import os
from fastapi import FastAPI 
from supabase import create_client, Client 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import date, timedelta
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Uvicorn lives in the middle as a ASGI server that runs the FastAPI and listens HTTP Requests and sends responses back

# /--------------------------------------------------- Home Endpoint ---------------------------------------------------------/

# Home path for tests

@app.get("/")
def home():
    return {"message": "CORS ENABLED"}

# /--------------------------------------------------- Get All Active Cases ---------------------------------------------------/

@app.get("/cases")
async def get_cases():
    today= date.today()

    # Fetch active cases with its corresponding hearings

    data= ( supabase.from_("cases")
        .select("name, id, case_number, case_type, status, phase, county, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence)")
        .eq("status", "active")
        .execute()
    )
    cases= data.data

    # Set boolean value to is_past and is_next for every hearing 

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

# /------------------------------------------------------- Get Notices --------------------------------------------------------/

@app.get("/notices")
async def get_notices():
    # Fetch notices linked to its corresponding case 
    data= ( supabase.from_("notices")
    .select("id, source, raw_content, extracted_case_number, extracted_date, extracted_time, extracted_name, extracted_judge, confidence, confidence_reason,"
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
        .select("name, case_number, case_type, status, phase, county, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence)")
        .eq("status", "active")
        .execute()
    )
    cases_data= data.data
    # For every hearing of a case, verifies if is_confirmed is true from when the hearing got inserted or if there is a hearing
    # existing within 90 days

    # Returns the cases that have no upcoming hearings within 90 days for future user action
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