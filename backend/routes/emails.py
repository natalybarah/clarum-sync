import io
import re
import base64
import requests
import pdfplumber
from fastapi import APIRouter
from datetime import datetime, timezone
from db import supabase
from agent import get_hearing_from_text, assign_confidence_score, insert_notice


router= APIRouter(tags=["emails"])




@router.post("/emails/process")
async def process_emails():
    token_record= (supabase.table("oauth_tokens")
    .select("access_token, expires_at, user_email")
    .order("created_at", desc=True)
    .limit(1)
    .execute()
    )

    if not token_record.data:
        return {"error": "Not authenticated. Visit /auth/login first"}
    
    expires_at_str = token_record.data[0]["expires_at"]
    expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))

    if expires_at < datetime.now(timezone.utc):
        return {"error": "Token expired. Visit /auth/login to reauthenticate"}
    
    access_token = token_record.data[0]["access_token"]
    headers={
        "Authorization": f"Bearer {access_token}",
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
