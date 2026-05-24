import os 
import json
from openai import OpenAI 
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime, date
from supabase import create_client, Client 
from dotenv import load_dotenv
load_dotenv()

# / ----------------------------------------------- Instances --------------------------------------------------------------/

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)
openAikey: str = os.environ.get('OPENAI_API_KEY')
openai_client= OpenAI()

# /-------------------------------- Pydantic base model for OpenAi output data validation -----------------------------------/

class HearingInfo(BaseModel):
    hearing_date: Optional[str]
    hearing_time: Optional[str]
    hearing_type: Optional[Literal["OSC", "Trial", "TRC", "CMC", "Motion", "Other"]]
    hearing_name: Optional[str]
    department: Optional[str]
    judge: Optional[str]
    case_number: Optional[str]
    court: Optional[str]

# /----------------------------------------------- Test data ----------------------------------------------------------------/

TEST_NOTICE_TEXT="""SUPERIOR COURT OF THE STATE OF CALIFORNIA FOR THE COUNTY OF LOS ANGELES CASE NO.: 23STCV16901 
CASE NAME: lopez et al. v. TechCorp Solutions, Inc. NOTICE OF CASE MANAGEMENT CONFERENCE TO ALL PARTIES AND 
THEIR ATTORNEYS OF RECORD: PLEASE TAKE NOTICE that a Case Management Conference (CMC) in the above-entitled action
has been set for: DATE: July 22, 2026 TIME: 3:30pm in dept 45 Spring Street Courthouse, 312 North Spring Street, Los Angeles, 
CA 90012 1. CASE MANAGEMENT STATEMENT: Pursuant to California Rules of Court, Rule 3.725, each party must file and 
serve a Case Management Statement (Form CM-110) at least fifteen (15) calendar days before the date set for the conference.
2. CLASS ACTION STATUS: As this matter is designated as a Class Action, the parties should be prepared to discuss a schedule 
for class certification discovery, the filing of the motion for class certification, and any pending mediation efforts.
3. APPEARANCES: Appearances may be made in person or via LASC CourtConnect for remote telephonic or video appearance. 
If appearing remotely, parties must follow the procedures set forth on the Court’s website at www.lacourt.org.
4. MEET AND CONFER: Pursuant to Rule 3.724, counsel for the parties are required to "meet and confer" (in person or by 
telephone) no later than thirty (30) days before the date set for the CMC to discuss the issues listed in Rule 3.727. 
Dated: May 12, 2026 honorable Lucy Lee CLERK OF THE SUPERIOR COURT By: J. Doe, Deputy Clerk """

MODEL= "gpt-4o-mini-2024-07-18"
INSTRUCTION = """
You are an expert paralegal at a California plaintiff-side employment litigation firm.
Your job is to read raw court notices and extract structured hearing information with precision.
EXTRACTION RULES:
hearing_date:
- Format: YYYY-MM-DD
- Look for labels like "DATE:", "Hearing Date:", "scheduled for", "set for"
- If multiple dates appear, pick the one explicitly tied to the hearing
hearing_time:
- Format: HH:MM:00 in 24-hour time
- Convert "1pm" → "13:00:00", "9:00 AM" → "09:00:00"
- Look for labels like "TIME:", "at", "o'clock"
hearing_type:
- Pick the closest match: CMC, OSC, TRC, Trial, Other
- CMC = Case Management Conference, Status Conference, Initial Status Conference
- OSC = Order to Show Cause (any variation)
- TRC = Trial Readiness Conference
- Trial = Jury Trial, Non-Jury Trial, Bench Trial
hearing_name:
- The exact name of the hearing as written in the document
- NOT the document title (e.g. "NOTICE OF CASE MANAGEMENT CONFERENCE" is the title)
- The hearing name is usually after "PLEASE TAKE NOTICE that a..."
department:
- Numbers only — no "Dept.", "Department", or "Dept #" prefix
- Example: "Dept. 12" → "12"
judge:
- Full name of the judge only
- The Honorable prefix can be included
- The Deputy Clerk or Clerk who signs the document is NOT the judge
- If no judge is explicitly named, return null
case_number:
- Exactly as written — preserve formatting, dashes, and capitalization
- Look for labels like "CASE NO.", "Case Number:", "No."
court:
- Full name of the court
If a field cannot be found after careful reading, return null.
Do not guess or infer — only extract what is explicitly stated.
"""

REQUIRED_FIELDS= ["hearing_date", "case_number", "hearing_time"]

OPTIONAL_FIELDS = [ "hearing_name", "department", "hearing_type", "judge", "court"]

# ------------------------------------------------- Get hearing Info From Text ------------------------------------------/
def get_hearing_from_text(raw_notice_text: str) -> dict:
    
    openai_response= openai_client.responses.parse(
        model= MODEL,
        input=[
            {"role": "developer", "content": INSTRUCTION},
            {"role": "user", "content": raw_notice_text }
        ],
        text_format= HearingInfo,
    )

    openai_response_parsed= openai_response.output_parsed
    hearing_info = openai_response_parsed.model_dump()
    return hearing_info

# /----------------------------------- Assign a Confidence Score to the AI extracted Info ----------------------------------/
   
def assign_confidence_score(extracted_hearing_info) -> str:

    # Fields missing from extraction to determine the confidence score

    required_missing = [f for f in REQUIRED_FIELDS if not extracted_hearing_info.get(f)]
    optional_missing = [f for f in OPTIONAL_FIELDS if not extracted_hearing_info.get(f)]
    total_fields = len(REQUIRED_FIELDS) + len(OPTIONAL_FIELDS)
    extracted_count = total_fields - len(required_missing) - len(optional_missing)
    all_missing = required_missing + optional_missing
    confidence_score= "HIGH"
    
    # Determines confidence score based on length of missing fields 

    if len(required_missing) == 0 and len(optional_missing) == 0:
      confidence_score= "HIGH"
    if len(required_missing) == 0 and len(optional_missing) > 0:
      confidence_score = "MEDIUM"
    if len(required_missing) > 0:
      confidence_score = "LOW"
    print("confidence score:", confidence_score)

    # Displays confidence reason based on missing fields  
    if confidence_score == "HIGH":
        confidence_reason = "All fields were extracted"
    else:
        if len(all_missing) >= 3:
            confidence_reason = f"{len(all_missing)} fields not found"
        else:
            missing_str = " and ".join(all_missing)
            confidence_reason = f"{missing_str} not found"
    return confidence_score, confidence_reason

# /---------------------------------------------- Insert Hearing -------------------------------------------------------------/

def insert_hearing(confidence_score, is_confirmed, result, find_case_id, notice_id):
    
    # Return if case is not found in database. A hearing can't exist without a corresponding case

    if not find_case_id.data:
        return

    # Insert a hearing to database linked to its case and the notice that triggered it

    response = (
        supabase.table("hearings")
        .insert({"hearing_date": result["hearing_date"], 
                "hearing_time": result["hearing_time"],
                "hearing_type": result["hearing_type"],
                "hearing_name": result["hearing_name"],
                "department": result["department"],
                "judge": result["judge"],
                "source": "manual",
                "confidence": confidence_score,
                "is_confirmed": is_confirmed,
                "case_id": find_case_id.data[0]["id"],
                "notice_id": notice_id
                })
        .execute()
    )


# /----------------------------------------------------- Insert Notice ----------------------------------------------------/

def insert_notice(hearing_info, confidence_score, confidence_reason, raw_notice_text):

    notice_status= "pending"

    # Finds the corresponding case of the hearing

    find_case_id= (
        supabase.table("cases")
        .select("case_number", "id")
        .eq("case_number", hearing_info["case_number"])
        .execute()
    )

    # Return if a case is not found for the notice. A notice can't be saved to database without a corresponding case

    if not find_case_id.data:
        return

    # When confidence is HIGH, the notice_status is automatically updated to auto saved

    if confidence_score == "HIGH":
        notice_status = "auto_saved"

    # Insert a notice to database with its linked case 

    response = (
        supabase.table("notices")
        .insert({"extracted_date": hearing_info["hearing_date"], 
                "extracted_time": hearing_info["hearing_time"],
                "extracted_name": hearing_info["hearing_name"],
                "extracted_department": hearing_info["department"],
                "extracted_judge": hearing_info["judge"],
                "extracted_case_number": hearing_info["case_number"],
                "source": "pdf",
                "raw_content": raw_notice_text,
                "notice_status": notice_status,
                "confidence": confidence_score,
                "court": hearing_info["court"],
                "case_id": find_case_id.data[0]["id"],
                "confidence_reason": confidence_reason
                })
        .execute()
    )

    # When confidence is HIGH insert a hearing to the tables hearing
    # Insert hearing receives the notice id returned from a notice insert 

    if confidence_score == "HIGH":
        insert_hearing(confidence_score, True, hearing_info, find_case_id, response.data[0]["id"])


# /------------------------------------------------ Function call -------------------------------------------------------------/

if __name__ == "__main__":
    hearing_info =  get_hearing_from_text(TEST_NOTICE_TEXT)
    confidence_score, confidence_reason= assign_confidence_score(hearing_info)
    insert_notice(hearing_info, confidence_score, confidence_reason, TEST_NOTICE_TEXT)






