from agent import assign_confidence_score, get_hearing_from_text, insert_notice
from unittest.mock import  patch

# |---------------------------------------------------- TEST DATA -----------------------------------------------------|

TEST_NOTICE_TEXT= """ SUPERIOR COURT OF THE STATE OF CALIFORNIA FOR THE COUNTY OF LOS ANGELES CASE NO.: 23STCV16901 CASE NAME: lopez et al. v. TechCorp Solutions, Inc.
NOTICE OF CASE MANAGEMENT CONFERENCE TO ALL PARTIES AND THEIR ATTORNEYS OF RECORD: PLEASE TAKE NOTICE that a Case Management Conference (CMC) in the above-entitled 
action has been set for:DATE: July 22, 2026 TIME: 3:30pm in dept 45 Spring Street Courthouse, 312 North Spring Street, Los Angeles, CA 90012
1. CASE MANAGEMENT STATEMENT:Pursuant to California Rules of Court, Rule 3.725, each party must file and serve a Case Management Statement (Form CM-110) at least fifteen (15) calendar days before the date set for the conference.
2. CLASS ACTION STATUS: As this matter is designated as a Class Action, the parties should be prepared to discuss a schedule for class certification discovery, the filing of the motion for class certification, and any pending mediation efforts.
3. APPEARANCES:Appearances may be made in person or via LASC CourtConnect for remote telephonic or video appearance. If appearing remotely, parties must follow the procedures set forth on the Court’s website at www.lacourt.org.
4. MEET AND CONFER: Pursuant to Rule 3.724, counsel for the parties are required to "meet and confer" (in person or by telephone) no later than thirty (30) days before the date set for the CMC to discuss the issues listed in Rule 3.727.
Dated: May 12, 2026 honorable Lucy Lee CLERK OF THE SUPERIOR COURT By: J. Doe, Deputy Clerk
"""

EXTRACTED_HEARING_INFO= {
    'hearing_date': '2026-07-18',
    'hearing_time': '13:00:00',
    'hearing_type': 'CMC',
    'hearing_name': 'Case Management Conference',
    'department': '12',
    'judge': 'jim clark',
    'case_number': '23STCV16901'
    }
# /---------------------------------------------------- Assign Confidence Score ---------------------------------------/

def test_assign_confidence_score_high():
    assert assign_confidence_score(EXTRACTED_HEARING_INFO) == "HIGH"

def test_assign_confidence_score_medium():
    extracted= {**EXTRACTED_HEARING_INFO, "judge": None}
    assert assign_confidence_score(extracted) == "MEDIUM"

def test_assign_confidence_score_low():
    extracted= {**EXTRACTED_HEARING_INFO, "case_number": None}
    assert assign_confidence_score(extracted) == "LOW"

# /---------------------------------------------------- Get Hearing From Text -----------------------------------------/

def test_get_hearing_from_text():
    with patch("agent.openai_client") as mock_openai:
        mock_openai.responses.parse.return_value.output_parsed.model_dump.return_value =  EXTRACTED_HEARING_INFO
        result= get_hearing_from_text(TEST_NOTICE_TEXT)  
        assert result == EXTRACTED_HEARING_INFO

# /--------------------------------------------------- Insert Notice With Confidence Score -----------------------------/

def test_insert_notice_with_high_score():
    with    patch("agent.supabase") as mock_supabase, \
            patch("agent.insert_hearing") as mock_insert_hearing:

            # Mock to find the specific case in supabase
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "fake-case-uuid", "case_number": "23STCV16901"}]

            # Mock to insert hearing and returning a notice id
            mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{"id": "fake-notice-uuid"}] #EXTRACTED_HEARING_INFO
            
            insert_notice(EXTRACTED_HEARING_INFO, "HIGH", TEST_NOTICE_TEXT)

            # Verify that insert_hearing function is invoked
            mock_insert_hearing.assert_called_once()

def test_insert_notice_with_medium_score():
    with    patch("agent.supabase") as mock_supabase, \
            patch("agent.insert_hearing") as mock_insert_hearing:

            # Mock to find the specific case in supabase
            mock_supabase.table.select.return_value.eq.return_value.execute.return_value.data= [{"case_number": "23STCV16901", "id": "fake-case-uuid"}]

            # Mock to insert hearing and returning a notice id
            mock_supabase.table.return_value.insert.return_value.execute.return_value.data= [{"id": "fake-notice-uuid"}]

            insert_notice(EXTRACTED_HEARING_INFO, "MEDIUM", TEST_NOTICE_TEXT)

            # Verify that insert_hearing function is not invoked
            mock_insert_hearing.assert_not_called()

def test_insert_notice_case_not_found():
    with    patch("agent.supabase") as mock_supabase, \
            patch("agent.insert_hearing") as mock_insert_hearing:

            # Mock for a case that was not found
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

            insert_notice(EXTRACTED_HEARING_INFO, "HIGH", TEST_NOTICE_TEXT)

            # Verify nothing was inserted since case wasn't found
            mock_insert_hearing.assert_not_called()

