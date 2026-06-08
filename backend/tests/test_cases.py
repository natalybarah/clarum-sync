import copy
from datetime import date, timedelta
from unittest.mock import patch, MagicMock
from tests.conftest import client, MOCK_CASES_MAIN, MOCK_CASES


# --------------------------------------------- GET /cases -----------------------------------------------------------------

def test_get_cases_returns_correct_structure():
    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.count = 18
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = MOCK_CASES_MAIN
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.count = 1

        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert isinstance(result["cases"], list)
        assert result["total"] == 18
        assert result["cases"][0]["next_hearing_date"] is not None
        assert result["cases"][0]["last_hearing_date"] is not None


def test_get_cases_no_past_hearing():
    mock_no_past = {**MOCK_CASES_MAIN[0],
        "last_hearing_date": None,
        "last_hearing_name": None,
        "last_hearing_time": None
    }
    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.count = 1
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
    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.count = 1
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = [mock_no_future]
        mock_supabase.from_.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.count = 1

        response = client.get("/cases")
        assert response.status_code == 200
        result = response.json()
        assert result["cases"][0]["next_hearing_date"] is None
        assert result["cases"][0]["last_hearing_date"] is not None


# --------------------------------------------- GET / cases -GAP -----------------------------------------------------------------

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
            "id": "fake-uuid-2",
            "snoozed_until": None,
            "snoozed_by": None,
            "hearings": [
                {**MOCK_CASES[0]["hearings"][0], "hearing_date": past_date, "is_confirmed": True}
            ]
        }
    ]

    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_gap_cases

        response = client.get("/cases/gaps")
        assert response.status_code == 200
        result = response.json()
        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "Johnson v. Westside Medical"

        case_names = [c["name"] for c in result]
        assert "Martinez v. Pacific Logistics" not in case_names


def test_get_cases_gap_snoozed_case_excluded():
    """Snoozed cases should not appear in gap alerts"""
    future_snooze = (date.today() + timedelta(days=30)).isoformat()
    mock_snoozed = copy.deepcopy(MOCK_CASES)
    mock_snoozed[0]["snoozed_until"] = future_snooze
    mock_snoozed[0]["hearings"] = []  # no hearings but snoozed

    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_snoozed

        response = client.get("/cases/gaps")
        assert response.status_code == 200
        result = response.json()
        assert len(result) == 0  # snoozed case should be excluded

# -------------------------------------------PATCH cases/{id}/verify  -----------------------------------------------------------------

def test_verify_case():
    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        response = client.patch("/cases/fake-uuid/verify")
        assert response.status_code == 200
        assert response.json()["message"] == "case has been verified sucessfully"


# ---------------------------------------PATCH cases/{id}/snooze -----------------------------------------------------------------

def test_snooze_case():
    with patch("routes.cases.supabase") as mock_supabase:
        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        response = client.patch("/cases/fake-uuid/snooze?snooze_days=30")
        assert response.status_code == 200
        assert response.json()["message"] == "Case snoozed for 30 days"