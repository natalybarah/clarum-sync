import os
import io
import msal
import pdfplumber
import base64
import requests
import re
from fastapi import FastAPI 
from supabase import create_client, Client 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta, date
from agent import insert_hearing, get_hearing_from_text, assign_confidence_score, insert_notice
from pydantic import BaseModel
from typing import Optional


load_dotenv()

# /---------------------------------------------------- Instances ------------------------------------------------------------/

app= FastAPI()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)
MICROSOFT_CLIENT_ID= os.environ.get("MICROSOFT_CLIENT_ID")
MICROSOFT_CLIENT_SECRET= os.environ.get("MICROSOFT_CLIENT_SECRET")
MICROSOFT_TENANT_ID= os.environ.get("MICROSOFT_TENANT_ID")
REDIRECT_URI= "http://localhost:8000/auth/callback"
SCOPES= ["Mail.Read"]


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


# /------------------------------------------------------------ OAuth Flow --------------------------------------------------------/

def get_msal_app():
    # Provides secure access to microsoft graph API
    return msal.ConfidentialClientApplication(
        MICROSOFT_CLIENT_ID,
        authority=f"https://login.microsoftonline.com/common",
        client_credential= MICROSOFT_CLIENT_SECRET
    )

@app.get("/auth/login")
async def auth_login():
    msal_app= get_msal_app()
    auth_url= msal_app.get_authorization_request_url(
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    return {"auth_url": auth_url}

@app.get("/auth/callback")
async def auth_callback(code:str):
    msal_app= get_msal_app()
    result= msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    if "access_token" in result:
        return{ "message": "Authentication sucessful", "access_token": result["access_token"]}

    return {"error": result.get("error_description")}
'''
@app.get("/emails")
async def get_emails(access_token: str):
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"

    }

    response= requests.get(
        "https://graph.microsoft.com/v1.0/me/messages",
        headers= headers,
        params={
            "$top": "10",
            "$select": "subject,receivedDateTime,from,body,hasAttachments"
        }
    )

    return response.json()
'''
# /---------------------------------------------------------------------- Email Processing ----------------------------------------------------------/

class EmailRequest(BaseModel):
    access_token: str

@app.post("/emails/process")
async def process_emails(request: EmailRequest):
    headers={
        "Authorization": f"Bearer {request.access_token}",
        "Content-Type": "application/json"
    }
    # we fetch the emails , 50 max, with the params below
    response= requests.get(
        "https://graph.microsoft.com/v1.0/me/messages",
        headers= headers,
        params={
            "$top": "50",
            "$select": "subject,receivedDateTime,from,toRecipients,ccRecipients,body,bodyPreview,hasAttachments,conversationId,isRead,id"
        }
    )
    #we get a response which we conver to json AND that we later convert to a python dictionary. value = emails. if no emails then we have an empty array. 
    emails= response.json().get("value", [])
    print(f" {len(emails)} length of emails")

    results= []
    skipped_duplicates = 0

    # we loop thorugh email and create variables to store, the id of eaach email and its subjetc
    for email in emails:
        email_id = email["id"]
        email_subject= email["subject"]

        # we check for notices that already exist from a previous email id. Check if an email_id has been processed
        existing= (
            supabase.table("notices")
            .select("id")
            .eq("email_id", email_id)
            .execute()
        )

        if existing.data:
            skipped_duplicates += 1
            continue
        
        email_body_html= email.get("body", {}).get("content", "")
        # Python's RegEX re.sub(pattern, replacement, stringToReplace) Strips HTML
        clean_body= re.sub(r'<[^>]+>', ' ', email_body_html) #removes HTML tags
        clean_body= re.sub(r'\s+', ' ', clean_body).strip() # removes spaces
        
        # Keywords that suggest an email is hearing related
        hearing_keywords= ["hearing", "case management", "conference", "notice of", "osc", "trial", "set for",
        "TRC", "scheduled for", "ordered to appear", "status conference", "continued", "calendar", "update the calendar"]
        body_has_keywords= any(kw.lower() in clean_body.lower() for kw in hearing_keywords)


        # Emails with text only

        if body_has_keywords:
            hearing_info= get_hearing_from_text(f"Email subject: {email_subject}\n\n{clean_body}")
            print(f"AI extracted: {hearing_info}")
            confidence_score, confidence_reason = assign_confidence_score(hearing_info)
        # nsert_notice(hearing_info, confidence_score, confidence_reason, raw_notice_text):
            if hearing_info.get("case_number") or hearing_info.get("case_name"):  
                insert_notice(hearing_info, confidence_score, confidence_reason, clean_body, email_id=email_id)
                results.append({
                    "source": "email_body",
                    "email_subject": email_subject,
                    "confidence": confidence_score,
                    "confidence_reason": confidence_reason,
                    "hearing_info": hearing_info
                })

        # Emails with PDFs

        if email.get("hasAttachments"):
            attachments_response= requests.get(
                f"https://graph.microsoft.com/v1.0/me/messages/{email_id}/attachments",
                headers=headers
            )
            attachments= attachments_response.json().get("value", [])

            for attachment in attachments:
                if attachment.get("contentType")== "application/pdf":
                    attachment_name= attachment.get("name")
                    print(f"PDF: {attachment_name}")

                    pdf_bytes= base64.b64decode(attachment["contentBytes"])

                    # We get PDF object to iterate over pages
                    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                        text = ""
                        for page in pdf.pages:
                            text += page.extract_text() or ""
                    hearing_info= get_hearing_from_text(text)
                    confidence_score, confidence_reason = assign_confidence_score(hearing_info)

                    if hearing_info.get("case_number") or hearing_info.get("case_name"):
                        insert_notice(hearing_info, confidence_score, confidence_reason, text, email_id=email_id)
                        results.append({
                            "source": "pdf_attachment",
                            "email_subject": email_subject,
                            "attachment_name": attachment_name,
                            "confidence": confidence_score,
                            "confidence_reason": confidence_reason,
                            "hearing_info": hearing_info
                        })


    return{
        "processed": len(results),
        "skipped_duplicates": skipped_duplicates,
        "results": results
    }








