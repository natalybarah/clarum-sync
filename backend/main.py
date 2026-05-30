import os
from fastapi import FastAPI 
from supabase import create_client, Client 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta, date
from agent import insert_hearing
from pydantic import BaseModel
from typing import Optional

load_dotenv()

# /---------------------------------------------------- Instances ------------------------------------------------------------/

app= FastAPI()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


# /--------------------------------------------------- CORS Middleware -------------------------------------------------------/

# Middleware that allows the backend to connect with a different port - local host for fronted

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://clarum-sync.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# /--------------------------------------------------- Home Endpoint ---------------------------------------------------------/

# Home path for tests

@app.get("/")
def home():
    return {"message": "CORS ENABLED"}

# /--------------------------------------------------- Get All Active Cases ---------------------------------------------------/

@app.get("/cases")
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

# /------------------------------------------------------- Get Notices --------------------------------------------------------/

@app.get("/notices")
async def get_notices():
    # Fetch notices linked to its corresponding case 
    data= ( supabase.from_("notices")
    .select("id, source, raw_content, extracted_case_number, extracted_date, extracted_time, extracted_name, extracted_judge, confidence, confidence_reason, court, extracted_department,"
    "cases(name, case_type)")
    .eq("notice_status", "pending")
    .execute()
    )
    return data.data



# /------------------------------------------------------- Gap Detector -------------------------------------------------------/

@app.get("/cases/gaps")
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


# / ------------------------------------------------------ Update Notice with Reject -------------------------------------------------------/

@app.patch("/notices/{notice_id}/reject")
async def reject_notice(notice_id: str):
    data = ( supabase.from_("notices")
    .update({"notice_status": "rejected"})
    .eq("id", notice_id)
    .execute()
    )
    return {"message": "Notice has been sucessfully rejected"}

# /--------------------------------------------------------- Approve Notice ---------------------------------------------------------/

class HearingCorrection(BaseModel):
    hearing_date: Optional[str]= None
    hearing_time: Optional[str]= None
    hearing_name: Optional[str]= None
    hearing_type: Optional[str]= None
    department: Optional[str]= None
    judge: Optional[str]= None
    court: Optional[str]= None



@app.patch("/notices/{notice_id}/approve")
async def approve_notice(notice_id: str, correction: HearingCorrection = None):
    notice = (supabase.from_("notices")
    .select("*")
    .eq("id", notice_id)
    .execute()
    )
    
    if not notice.data:
        return {"error": "Error ocurred, notice not found"}

    notice_data = notice.data[0]

    updated_notice = (supabase.from_("notices")
    .update({"notice_status": "approved"})
    .eq("id", notice_id)
    .execute()
    )

    updated_notice_data= updated_notice.data[0]
 
    result = {
        "hearing_date": correction.hearing_date if correction and correction.hearing_date else notice_data["extracted_date"],
        "hearing_time": correction.hearing_time if correction and correction.hearing_time else notice_data["extracted_time"],
        "hearing_name": correction.hearing_name if correction and correction.hearing_name else notice_data["extracted_name"],
        "hearing_type": correction.hearing_type if correction and correction.hearing_type else notice_data["extracted_type"],
        "department": correction.department if correction and correction.department else notice_data["extracted_department"],
        "judge": correction.judge if correction and correction.judge else notice_data["extracted_judge"],
        "court": correction.court if correction and correction.court else notice_data.get("court")
    }

    find_case_id= (
        supabase.table("cases")
        .select("case_number", "id")
        .eq("case_number", notice_data["extracted_case_number"])
        .execute()
    )

    insert_hearing(updated_notice_data["confidence"], True, result, find_case_id, notice_id )

    return {"message": "Notice has been sucessfully approved"}


# /-------------------------------------------------------------- Manual case approve ----------------------------------------------------/

@app.patch("/cases/{case_id}/verify")
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

# /------------------------------------------------------------- Snooze a case -----------------------------------------------------/

@app.patch("/cases/{case_id}/snooze")
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