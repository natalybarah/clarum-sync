from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from db import supabase
from agent import insert_hearing

router = APIRouter(tags=["notices"])

class HearingCorrection(BaseModel):
    hearing_date: Optional[str]= None
    hearing_time: Optional[str]= None
    hearing_name: Optional[str]= None
    hearing_type: Optional[str]= None
    department: Optional[str]= None
    judge: Optional[str]= None
    court: Optional[str]= None

@router.get("/notices")
async def get_notices():
    # Fetch notices linked to its corresponding case 
    data= ( supabase.from_("notices")
    .select("id, source, raw_content, extracted_case_number, extracted_date, extracted_time, extracted_name, extracted_judge, confidence, confidence_reason, court, extracted_department,"
    "cases(name, case_type)")
    .eq("notice_status", "pending")
    .execute()
    )
    return data.data

@router.patch("/notices/{notice_id}/reject")
async def reject_notice(notice_id: str):
    data = ( supabase.from_("notices")
    .update({"notice_status": "rejected"})
    .eq("id", notice_id)
    .execute()
    )
    return {"message": "Notice has been sucessfully rejected"}


@router.patch("/notices/{notice_id}/approve")
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