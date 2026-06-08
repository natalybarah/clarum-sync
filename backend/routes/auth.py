import os
import msal
from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
from db import supabase
from dotenv import load_dotenv

load_dotenv()

router= APIRouter(tags=["auth"])



MICROSOFT_CLIENT_ID= os.environ.get("MICROSOFT_CLIENT_ID")
MICROSOFT_CLIENT_SECRET= os.environ.get("MICROSOFT_CLIENT_SECRET")
MICROSOFT_TENANT_ID= os.environ.get("MICROSOFT_TENANT_ID")
REDIRECT_URI= "http://localhost:8000/auth/callback"
SCOPES= ["Mail.Read", "Calendars.Read"]
ALLOWED_EMAILS= os.environ.get("ALLOWED_EMAILS", "").split(",")

def get_msal_app():
    # Provides secure access to microsoft graph API
    return msal.ConfidentialClientApplication(
        MICROSOFT_CLIENT_ID,
        authority=f"https://login.microsoftonline.com/common",
        client_credential= MICROSOFT_CLIENT_SECRET
    )


@router.get("/auth/login")
async def auth_login():
    msal_app= get_msal_app()
    auth_url= msal_app.get_authorization_request_url(
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    return {"auth_url": auth_url}

@router.get("/auth/callback")
async def auth_callback(code:str):
    msal_app= get_msal_app()
    result= msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    if "access_token" in result:
        
        user_email=result.get("id_token_claims", {}).get("preferred_username", "").lower()

        if user_email not in [e.lower() for e in ALLOWED_EMAILS]:
            return {"error": f"Email {user_email} is not authorized for Clarum sync"}

        # calculates expiration of token by adding with python time object, datetime now and timedelta 
        # then we transform back to isoformat for supabase storage

        expires_at = (datetime.now(timezone.utc)+ timedelta(seconds=result["expires_in"])).isoformat()

        supabase.table("oauth_tokens").upsert({
            "user_email": user_email,
            "access_token": result["access_token"],
            "refresh_token": result.get("refresh_token"),
            "expires_at": expires_at,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="user_email").execute()

        return{ "message": "Authentication sucessful", "user": user_email}


    return {"error": result.get("error_description")}