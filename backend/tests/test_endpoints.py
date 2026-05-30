from unittest.mock import patch
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from main import app
import copy
from datetime import date, timedelta

client= TestClient(app)

# /----------------------------------------------------- TEST DATA -------------------------------------------------------/
MOCK_CASES = [
    {
        "name": "Martinez v. Pacific Logistics",
        "case_number": "23STCV10234",
        "case_type": "Class",
        "status": "active",
        "phase": "Litigation",
        "county": "Los Angeles",
        "snoozed_until": None,
        "snoozed_by": None,
        "hearings": [
            {
                "hearing_date": "2026-06-15",
                "hearing_time": "09:00:00",
                "hearing_name": "Case Management Conference",
                "hearing_type": "CMC",
                "department": "Dept. 12",
                "judge": "Hon. Sandra Rivera",
                "source": "manual",
                "is_confirmed": True,
                "confidence": "HIGH"
            }
        ]
    }
]

MOCK_CASES_MAIN = [
    {
        "id": "fake-uuid",
        "name": "Martinez v. Pacific Logistics",
        "case_number": "23STCV10234",
        "case_type": "Class",
        "status": "active",
        "phase": "Litigation",
        "county": "Los Angeles",
        "last_hearing_date": "2026-01-15",
        "last_hearing_name": "Case Management Conference",
        "last_hearing_time": "09:00:00",
        "last_hearing_type": "CMC", 
        "next_hearing_date": "2026-06-15",
        "next_hearing_name": "Case Management Conference",
        "next_hearing_time": "09:00:00",
        "next_hearing_type": "CMC"

    }
]

MOCK_NOTICES = [
    {
        "id": "fake-notice-uuid-001",
        "source": "pdf",
        "raw_content": "SUPERIOR COURT OF CALIFORNIA...",
        "extracted_case_number": "23STCV16901",
        "extracted_date": "2026-07-18",
        "extracted_time": "13:00:00",
        "extracted_name": "Case Management Conference",
        "extracted_judge": "Hon. Lucy Lee",
        "extracted_type": "CMC",
        "extracted_department": "12",
        "confidence": "MEDIUM",
        "confidence_reason": "Missing optional fields",
        "cases": {
            "name": "Robinson v. Pacific Manufacturing",
            "case_type": "FEHA"
        }
    }
]


# /-------------------------------------------------- Test Get Cases -----------------------------------------------------/

def test_get_cases_returns_correct_structure():
    with patch("main.supabase") as mock_supabase:
        # Mock total count of cases query
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.count= 18

        # Mock filtered query
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = MOCK_CASES_MAIN
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.count = 1
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert isinstance(result["cases"], list)
        assert result["total"] == 18
        assert result["cases"][0]["last_hearing_date"] is not None
        assert result["cases"][0]["last_hearing_time"] is not None
        assert result["cases"][0]["last_hearing_name"] is not None
        assert result["cases"][0]["next_hearing_date"] is not None
        assert result["cases"][0]["next_hearing_time"] is not None
        assert result["cases"][0]["next_hearing_name"] is not None

def test_get_cases_no_past_hearing():
    mock_no_past = {**MOCK_CASES_MAIN[0],
        "last_hearing_date": None,
        "last_hearing_name": None,
        "last_hearing_time": None
    }
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = [mock_no_past]
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.count = 1
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert result["cases"][0]["last_hearing_date"] is None
        assert result["cases"][0]["next_hearing_date"] is not None

def test_get_cases_no_future_hearing():
    mock_no_future = {**MOCK_CASES_MAIN[0],
        "next_hearing_date": None,
        "next_hearing_name": None,
        "next_hearing_time": None
    }
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = [mock_no_future]
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.count = 1
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert result["cases"][0]["next_hearing_date"] is None
        assert result["cases"][0]["last_hearing_date"] is not None

# /----------------------------------------------------- Test Get Notices -------------------------------------------------/
def test_get_notices():
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = MOCK_NOTICES
        response= client.get("/notices")
        assert response.status_code == 200
        result= response.json()
        assert isinstance(result, list)

# /----------------------------------------------------- Test Gap Detector ------------------------------------------------/

def test_get_cases_gap():
    past_date = (date.today() - timedelta(days=30)).isoformat()
    mock_gap_cases = copy.deepcopy(MOCK_CASES) + [
        {
            "name": "Johnson v. Westside Medical",
            "case_number": "30-2023-01345678",
            "case_type": "FEHA",
            "status": "active",
            "phase": "Discovery",
            "county": "Orange",
            "snoozed_until": None, 
            "snoozed_by": None,   
            "hearings": [
                {**MOCK_CASES[0]["hearings"][0], "hearing_date": past_date, "is_confirmed": True}
            ]
        }
    ]

    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_gap_cases
        response = client.get("/cases/gaps")
        assert response.status_code == 200
        result = response.json()

        # only 1 case should be raised, the one with a past hearing
        assert isinstance(result, list)
        assert len(result) == 1

        # the gap case should be Johnson and not Martinez
        assert result[0]["name"] == "Johnson v. Westside Medical"

        # Martinez case should not be in gaps since it has a future confirmed hearing
        case_names = [c["name"] for c in result]
        assert "Martinez v. Pacific Logistics" not in case_names

# /-------------------------------------------------- Test Aprove Notice --------------------------------------------------------/
def test_approve_notice():
    with patch("main.supabase") as mock_supabase, \
         patch("main.insert_hearing") as mock_insert_hearing:

        notice_response = MagicMock()
        notice_response.data = [MOCK_NOTICES[0]]

        updated_response = MagicMock()
        updated_response.data = [{**MOCK_NOTICES[0], "notice_status": "approved"}]

        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.side_effect = [
            notice_response,  
        ]
        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = updated_response
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "fake-case-uuid", "case_number": "23STCV16901"}
        ]

        response = client.patch(f"/notices/{MOCK_NOTICES[0]['id']}/approve")
        assert response.status_code == 200
        mock_insert_hearing.assert_called_once()


# /------------------------------------------------------- Test Reject Notice --------------------------------------------------/

def test_reject_notice():
    with patch("main.supabase") as mock_supabase:
      
        updated_response_data= [{**MOCK_NOTICES[0], "notice_status": "rejected"}]

        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = [updated_response_data]

        response = client.patch(f"/notices/{MOCK_NOTICES[0]['id']}/reject")
        assert response.status_code == 200
        assert response.json()["message"]== "Notice has been sucessfully rejected"

# /--------------------------------------------------------- Test Manual Verify Case  ---------------------------------------------/

def test_verify_case():
    with patch("main.supabase") as mock_supabase:
        
        updated_response_data= [{**MOCK_CASES[0], "id": "fake-uuid", "last_verified_at": "2026-05-28T19:00:00", "verified_by": "NB"}]

        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = [updated_response_data]

        response= client.patch(f"/cases/fake-uuid/verify")
        assert response.status_code == 200
        assert response.json()["message"]== "case has been verified sucessfully"

# /------------------------------------------------------------ Test Snooze Case -------------------------------------------------/

def test_snooze_case():
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value.data = [
             {"id": "fake-uuid", "snoozed_until": "2026-06-27T19:00:00", "snoozed_by": "NB"}
        ]

        response = client.patch(f"/cases/fake-uuid/snooze?snooze_days=30")
        assert response.status_code == 200
        assert response.json()["message"] == "Case snoozed for 30 days"


        


