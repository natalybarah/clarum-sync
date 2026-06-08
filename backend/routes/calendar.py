import re
from collections import Counter
import pytz
import requests
from fastapi import APIRouter
from datetime import datetime, timezone, timedelta, date
from db import supabase
from agent import normalize_case_name
from calendar_utils import strip_team_prefix, detect_status_prefix, has_team_prefix, is_hearing_event, utc_to_pacific


router= APIRouter(tags=["calendar"])



# /--------------------------------------------------- Calendar Endpoint ---------------------------------------------------/

@router.get("/my-day")
async def get_my_day():
    # Use Pacific timezone for all date calculations
    pacific = pytz.timezone("America/Los_Angeles")
    today = datetime.now(pacific).date()
    tomorrow = today + timedelta(days=1)

    # End of week = Friday (or today if weekend)
    days_until_friday = 4 - today.weekday()
    if days_until_friday < 0:
        end_of_week = today
    else:
        end_of_week = today + timedelta(days=days_until_friday)

    # Step 1 — Fetch all Clarum hearings for the week
    hearings_data = (
        supabase.from_("hearings")
        .select("id, hearing_date, hearing_time, hearing_name, hearing_type, department, judge, case_id, "
                "cases(id, name, case_number, case_type)")
        .gte("hearing_date", today.isoformat())
        .lte("hearing_date", end_of_week.isoformat())
        .eq("is_confirmed", True)
        .order("hearing_date")
        .order("hearing_time")
        .execute()
    )
    clarum_hearings = hearings_data.data

    # Step 2 — Fetch all Clarum cases (for Outlook-only check)
    all_cases_data = (
        supabase.from_("cases")
        .select("id, name, case_number, case_type")
        .eq("status", "active")
        .execute()
    )
    all_cases = all_cases_data.data

    # Step 3 — Fetch Outlook calendar events
    token_record = (
        supabase.table("oauth_tokens")
        .select("access_token, expires_at")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    outlook_events = []
    token_valid = False

    if token_record.data:
        expires_at_str = token_record.data[0]["expires_at"]
        expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))

        if expires_at > datetime.now(timezone.utc):
            token_valid = True
            access_token = token_record.data[0]["access_token"]
            headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

            start_date = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc).isoformat()
            end_date = (datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc) + timedelta(days=8)).isoformat()

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/calendarView",
                headers=headers,
                params={
                    "startDateTime": start_date,
                    "endDateTime": end_date,
                    "$top": "200",
                    "$select": "subject,start,end,body,id",
                    "$orderby": "start/dateTime"
                }
            )
            if response.status_code == 200:
                outlook_events = response.json().get("value", [])

    # Step 4 — Clean Outlook event bodies for matching
    for event in outlook_events:
        body_html = event.get("body", {}).get("content", "")
        clean_body = re.sub(r'<[^>]+>', ' ', body_html)
        clean_body = re.sub(r'\s+', ' ', clean_body).strip()
        event["clean_body"] = clean_body

    # Step 5 — Match each Clarum hearing to Outlook events
    matched_outlook_ids = set()
    enriched_hearings = []

    for hearing in clarum_hearings:
        case = hearing.get("cases", {}) or {}
        case_number = case.get("case_number", "")
        case_name = case.get("name", "")
        case_type = case.get("case_type", "")
        hearing_type = hearing.get("hearing_type", "") or ""
        hearing_time_str = hearing.get("hearing_time") or "00:00:00"

        print(f"\n Matching hearing: {case_name} ({case_number}) on {hearing['hearing_date']} at {hearing_time_str}")

        matched_event = None
        best_match_score = 0

        for event in outlook_events:
            if event["id"] in matched_outlook_ids:
                continue

            event_subject = event["subject"]
            event_subject_cleaned = strip_team_prefix(event_subject)
            event_body = event.get("clean_body", "")
            raw_time = event["start"]["dateTime"][11:19]
            raw_date = event["start"]["dateTime"][:10]

            # Convert Outlook UTC time to Pacific for comparison
            converted_time, event_date = utc_to_pacific(raw_time, raw_date)

            print(f"  - {event_subject} on {event_date}")
            print(f"    body preview: {event_body[:100]}")

            # Date proximity check (±1 day)
            hearing_date_obj = date.fromisoformat(hearing["hearing_date"])
            event_date_obj = date.fromisoformat(event_date)
            days_diff = abs((event_date_obj - hearing_date_obj).days)
            if days_diff > 1:
                continue

            # Signal 1 — case number in body
            has_case_number = bool(case_number and case_number.lower() in event_body.lower())

            # Signal 2 — hearing type in subject
            has_hearing_type = bool(hearing_type and hearing_type.lower() in event_subject.lower())

            # Signal 3 — time match within ±30 min (both in Pacific)
            try:
                hearing_h = int(hearing_time_str[:2])
                hearing_m = int(hearing_time_str[3:5])
                event_h = int(converted_time[:2])
                event_m = int(converted_time[3:5])
                hearing_total = hearing_h * 60 + hearing_m
                event_total = event_h * 60 + event_m
                has_time_match = abs(hearing_total - event_total) <= 30
            except (ValueError, TypeError, IndexError):
                has_time_match = False

            # Signal 4 — fuzzy name match
            fuzzy_name_match = False
            if case_name:
                normalized = normalize_case_name(case_name)
                case_words = [w for w in normalized.split() if len(w) > 3 and w not in ['v', 'vs', 'v.', 'vs.']]
                subject_lower = event_subject_cleaned.lower()
                matching_words = [w for w in case_words if w in subject_lower]
                fuzzy_name_match = len(matching_words) >= 2

            fuzzy_with_type = fuzzy_name_match and bool(
                case_type and case_type.lower() in (event_subject + event_body).lower()
            )

            # Score — higher = better match
            score = 0
            if has_case_number and has_hearing_type and has_time_match:
                score = 5
            elif has_case_number and has_time_match:
                score = 4
            elif has_case_number and has_hearing_type:
                score = 3
            elif has_case_number:
                score = 2
            elif fuzzy_with_type and has_time_match:
                score = 1.5
            elif fuzzy_with_type:
                score = 1
            elif fuzzy_name_match and has_time_match:
                score = 0.5

            if score > best_match_score:
                best_match_score = score
                matched_event = event

        # Only accept match if score > 0
        if best_match_score == 0:
            matched_event = None

        # Determine sync status
        sync_status = "not_in_outlook"
        outlook_time = None
        outlook_date_str = None

        if matched_event:
            matched_outlook_ids.add(matched_event["id"])
            raw_time = matched_event["start"]["dateTime"][11:19]
            raw_date = matched_event["start"]["dateTime"][:10]
            outlook_time, outlook_date_str = utc_to_pacific(raw_time, raw_date)
            status_prefix = detect_status_prefix(matched_event["subject"])

            if status_prefix == "vacated":
                sync_status = "vacated_in_outlook"
            elif status_prefix == "continued":
                sync_status = "continued_in_outlook"
            elif outlook_date_str != hearing["hearing_date"]:
                sync_status = "date_mismatch"
            else:
                if not hearing.get("hearing_time") or not outlook_time:
                    sync_status = "synced"
                else:
                    hearing_time_obj = datetime.strptime(hearing["hearing_time"], "%H:%M:%S").time()
                    outlook_time_obj = datetime.strptime(outlook_time, "%H:%M:%S").time()
                    hearing_minutes = hearing_time_obj.hour * 60 + hearing_time_obj.minute
                    outlook_minutes = outlook_time_obj.hour * 60 + outlook_time_obj.minute

                    if abs(hearing_minutes - outlook_minutes) > 30:
                        sync_status = "time_mismatch"
                    else:
                        sync_status = "synced"

        enriched_hearings.append({
            **hearing,
            "sync_status": sync_status,
            "outlook_date": outlook_date_str,
            "outlook_time": outlook_time,
            "outlook_subject": matched_event["subject"] if matched_event else None
        })

    # Step 6 — Find Outlook events that aren't in Clarum (in_outlook_only)
    case_numbers_set = {c["case_number"].lower() for c in all_cases if c.get("case_number")}
    case_names_set = {normalize_case_name(c["name"]) for c in all_cases if c.get("name")}

    in_outlook_only = []
    for event in outlook_events:
        if event["id"] in matched_outlook_ids:
            continue

        subject = event["subject"]
        body = event.get("clean_body", "")

        if not has_team_prefix(subject):
            continue
        if not is_hearing_event(subject):
            continue
        if detect_status_prefix(subject) in ["vacated", "continued", "off", "cont", "cont'd", "cancelled", "dismissed"]:
            continue

        event_text = (subject + " " + body).lower()
        case_in_clarum = False

        for cn in case_numbers_set:
            if cn in event_text:
                case_in_clarum = True
                break

        if not case_in_clarum:
            for cn_name in case_names_set:
                if cn_name in event_text:
                    case_in_clarum = True
                    break
                    
        if not case_in_clarum:
            for c in all_cases:
                if not c.get("name"):
                    continue
                normalized = normalize_case_name(c["name"])
                case_words = [w for w in normalized.split() if len(w) > 3 and w not in ['v', 'vs', 'v.', 'vs.']]
                matching_words = [w for w in case_words if w in event_text]
                if len(matching_words) >= 2:
                    case_in_clarum = True
                    break

        if case_in_clarum:
            _ot, _od = utc_to_pacific(
                event["start"]["dateTime"][11:19],
                event["start"]["dateTime"][:10]
            )

            # Find matched_case_id
            matched_case_id = None
            for c in all_cases:
                if c.get("case_number") and c["case_number"].lower() in event_text:
                    matched_case_id = c["id"]
                    break
            if not matched_case_id:
                for c in all_cases:
                    if c.get("name") and normalize_case_name(c["name"]) in event_text:
                        matched_case_id = c["id"]
                        break

            in_outlook_only.append({
                "outlook_id": event["id"],
                "subject": event["subject"],
                "outlook_date": _od,
                "outlook_time": _ot,
                "sync_status": "in_outlook_only",
                "case_id": matched_case_id
            })

    # Step 7 — Group by time period
    def group_filter(hearings_list, date_filter):
        return [h for h in hearings_list if h["hearing_date"] == date_filter]

    today_hearings = group_filter(enriched_hearings, today.isoformat())
    tomorrow_hearings = group_filter(enriched_hearings, tomorrow.isoformat())
    this_week_hearings = [h for h in enriched_hearings
                          if today.isoformat() < h["hearing_date"] <= end_of_week.isoformat()
                          and h["hearing_date"] != tomorrow.isoformat()]

    today_outlook_only = [e for e in in_outlook_only if e["outlook_date"] == today.isoformat()]
    tomorrow_outlook_only = [e for e in in_outlook_only if e["outlook_date"] == tomorrow.isoformat()]
    week_outlook_only = [e for e in in_outlook_only
                          if today.isoformat() < e["outlook_date"] <= end_of_week.isoformat()
                          and e["outlook_date"] != tomorrow.isoformat()]

    return {
        "token_valid": token_valid,
        "today": {
            "date": today.isoformat(),
            "hearings": today_hearings,
            "outlook_only": today_outlook_only
        },
        "tomorrow": {
            "date": tomorrow.isoformat(),
            "hearings": tomorrow_hearings,
            "outlook_only": tomorrow_outlook_only
        },
        "this_week": {
            "end_date": end_of_week.isoformat(),
            "hearings": this_week_hearings,
            "outlook_only": week_outlook_only
        }
    }