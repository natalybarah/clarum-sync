from fastapi import APIRouter
from datetime import datetime, timezone, timedelta, date
from db import supabase
from pydantic import BaseModel
from typing import Optional

router= APIRouter(tags=["cases"])

@router.get("/cases")
async def get_cases(page: int = 1, limit:int = 10, query: str= None):
    offset= (page -1) * limit
    # Fetch active cases with the last and next hearing date

    total_count= (supabase.table("cases_with_hearings")
        .select("id", count="exact")
        .eq("status", "active")
        .execute()
        ).count

    query_builder= ( supabase.from_("cases_with_hearings")
        .select("name, id, case_number, case_type, status, phase, county, last_hearing_date, last_hearing_name, last_hearing_time, last_hearing_type, \
         next_hearing_date, next_hearing_name, next_hearing_time, next_hearing_type",
         count="exact"
         )
        .eq("status", "active")
    )
    if query: 
        query_builder= query_builder.or_(f"name.ilike.%{query}%,case_number.ilike.%{query}%")

    data= query_builder.range(offset, offset + limit  - 1).execute()

    return {
        "cases": data.data,
        "filtered_total": data.count,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": -(-data.count // limit)
    }

@router.get("/cases/gaps")
async def get_cases_gap():
    # Set the criteria for a gap in a case - when there is no registered hearing within 90 days

    today= date.today()
    limit_date= today + timedelta(days=90)
    
    # Fetch the cases with its corresponding hearings

    data= ( supabase.from_("cases")
        .select("name, case_number, case_type, status, phase, county, id, snoozed_by, snoozed_until, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence, hearing_type)")
        .eq("status", "active")
        .execute()
    )
    cases_data= data.data
    # For every hearing of a case, verifies if is_confirmed is true from when the hearing got inserted or if there is a hearing
    # existing within 90 days

    # Returns the cases that have no upcoming hearings within 90 days for future user action
    gaps= []
    for case in cases_data:
        if case["snoozed_until"]:
            snoozed_date= date.fromisoformat(case["snoozed_until"][:10])
            if snoozed_date > today:
                continue

        hearings = case["hearings"]
        has_confirmed_upcoming = any(
            h["is_confirmed"] == True and
            date.fromisoformat(h["hearing_date"]) >= today and
            date.fromisoformat(h["hearing_date"]) <= limit_date
            for h in hearings
        )
        if not has_confirmed_upcoming:
            gaps.append(case)

    return gaps

@router.patch("/cases/{case_id}/verify")
async def verify_case(case_id: str):
    
    cases= ( supabase.from_("cases")
    .update({
        "last_verified_at": datetime.now(timezone.utc).isoformat(),
        "verified_by": "NB"}
    )
    .eq("id", case_id)
    .execute()
    )

    return {"message": "case has been verified sucessfully"}



@router.patch("/cases/{case_id}/snooze")
async def snooze_case(case_id:str, snooze_days: int):
    snoozed_until= (datetime.now(timezone.utc) + timedelta(days=snooze_days)).isoformat()
    message=( supabase.from_("cases")
    .update({
        "snoozed_until": snoozed_until,
        "snoozed_by": "NB",
        "last_verified_at": datetime.now(timezone.utc).isoformat(),
        "verified_by": "NB"
    })
    .eq("id", case_id)
    .execute()
    )
    return {"message": f"Case snoozed for {snooze_days} days"}

class HearingCreate(BaseModel):
    hearing_date: str
    hearing_time: str
    hearing_name: Optional[str] = None
    hearing_type: Optional[str] = None
    department: Optional[str] = None
    judge: Optional[str] = None
    case_id: str

@router.post("/hearings")
async def create_hearing(hearing: HearingCreate):
    response=(
        supabase.table("hearings")
        .insert({
            "hearing_date": hearing.hearing_date,
            "hearing_time": hearing.hearing_time,
            "hearing_name": hearing.hearing_name,
            "hearing_type": hearing.hearing_type,
            "department": hearing.department,
            "judge": hearing.judge,
            "case_id": hearing.case_id,
            "source": "calendar",
            "confidence": "HIGH",
            "is_confirmed": True
        })
        .execute()
    )
    return {"message": "Hearing created successfully", "hearing": response.data[0]}

