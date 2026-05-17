import os
from fastapi import FastAPI 
from supabase import create_client, Client 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import date, timedelta
load_dotenv()
app= FastAPI()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)



# add CORD middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Uvicorn lives in the middle as a ASGI server that runs the FastAPI and listens HTTP Requests and sends responses back

@app.get("/")
def home():
    return {"message": "CORS ENABLED"}

@app.get("/cases")
async def get_cases():
    today= date.today()
    limit_date= today + timedelta(days=90)
    #data= supabase.table("cases").select("*").eq("name, case_number, case_type")
    data= ( supabase.from_("cases")
        .select("name, case_number, case_type, status, phase, county, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence)")
        .eq("status", "active")
        .execute()
    )
    cases= data.data
    
    for case in cases:
        upcoming = [
            h for h in case["hearings"]
            if date.fromisoformat(h["hearing_date"]) >= today
        ]
        for h in case["hearings"]:
            hearing_date = date.fromisoformat(h["hearing_date"])
            h["is_past"] = hearing_date < today
            h["is_next"] = (
                len(upcoming) > 0 and
                hearing_date == min(date.fromisoformat(u["hearing_date"]) for u in upcoming)
            )

    return cases

@app.get("/notices")
async def get_notices():
    data= ( supabase.from_("notices")
    .select("id, source, raw_content, extracted_case_number, extracted_date, extracted_time, extracted_name, extracted_judge, confidence, confidence_reason,"
    "cases(name, case_type)")
    .eq("notice_status", "pending")
    .execute()
    )
    return data.data

@app.get("/cases/gaps")
async def get_cases_gap():
    today= date.today()
    limit_date= today + timedelta(days=90)
    data= ( supabase.from_("cases")
        .select("name, case_number, case_type, status, phase, county, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence)")
        .eq("status", "active")
        .execute()
    )
    cases_data= data.data
    gaps= []
    for case in cases_data:
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