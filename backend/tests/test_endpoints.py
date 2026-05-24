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
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = MOCK_CASES_MAIN
        response = client.get("/cases") 
        assert response.status_code == 200
        assert isinstance(response.json(), list )
        result= response.json()
        assert result[0]["last_hearing_date"] is not None
        assert result[0]["last_hearing_time"] is not None
        assert result[0]["last_hearing_name"] is not None
        assert result[0]["next_hearing_date"] is not None
        assert result[0]["next_hearing_time"] is not None
        assert result[0]["next_hearing_name"] is not None

def test_get_cases_no_past_hearing():
    mock_no_past = {**MOCK_CASES_MAIN[0], 
        "last_hearing_date": None,
        "last_hearing_name": None,
        "last_hearing_time": None
    }
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_no_past]
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert result[0]["last_hearing_date"] is None
        assert result[0]["next_hearing_date"] is not None


def test_get_cases_no_future_hearing():
    mock_no_future = {**MOCK_CASES_MAIN[0],
        "next_hearing_date": None,
        "next_hearing_name": None,
        "next_hearing_time": None
    }
    with patch("main.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_no_future]
        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert result[0]["next_hearing_date"] is None
        assert result[0]["last_hearing_date"] is not None

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

