from unittest.mock import patch
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
        "hearings": [
            {
                "hearing_date": "2026-06-15",
                "hearing_time": "09:00:00",
                "hearing_name": "CMC",
                "department": "Dept. 12",
                "judge": "Hon. Sandra Rivera",
                "source": "manual",
                "is_confirmed": True,
                "confidence": "HIGH"
            }
        ]
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
        "confidence": "MEDIUM",
        "confidence_reason": "Missing optional fields",
        "cases": {
            "name": "Robinson v. Pacific Manufacturing",
            "case_type": "FEHA"
        }
    }
]

# /-------------------------------------------------- Test Get Cases -----------------------------------------------------/

def test_get_cases_with_future_hearing():
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = MOCK_CASES
        response = client.get("/cases") 
        assert response.status_code == 200
        assert isinstance(response.json(), list )
        result= response.json()
        assert result[0]["hearings"][0]["is_next"]==True

def test_get_cases_with_past_hearing():
    past_date= (date.today()-  timedelta(days=30)).isoformat()
    mock_past= copy.deepcopy(MOCK_CASES)
    mock_past[0]["hearings"][0]["hearing_date"]= past_date

    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_past
        response = client.get("/cases") 
        assert response.status_code == 200
        assert isinstance(response.json(), list )
        result= response.json()
        assert result[0]["hearings"][0]["is_past"]==True
        assert result[0]["hearings"][0]["is_next"]==False

def test_get_cases_with_multiple_hearings():
    past_date = (date.today() - timedelta(days=30)).isoformat()
    future_date_near = (date.today() + timedelta(days=20)).isoformat()
    future_date_far = (date.today() + timedelta(days=60)).isoformat()

    mock_multiple = copy.deepcopy(MOCK_CASES)
    mock_multiple[0]["hearings"] = [
        {**mock_multiple[0]["hearings"][0], "hearing_date": past_date},
        {**mock_multiple[0]["hearings"][0], "hearing_date": future_date_near},
        {**mock_multiple[0]["hearings"][0], "hearing_date": future_date_far},
    ]

    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_multiple
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        hearings = result[0]["hearings"]

        # past hearing should be is_past=True, is_next=False
        assert result[0]["hearings"][0]["is_past"] == True
        assert result[0]["hearings"][0]["is_next"] == False

        # nearest future hearing should be is_next=True
        assert result[0]["hearings"][1]["is_next"] == True
        assert result[0]["hearings"][1]["is_past"] == False

        # farther future hearing should be is_next=False
        assert result[0]["hearings"][2]["is_next"] == False
        assert result[0]["hearings"][2]["is_past"] == False

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

