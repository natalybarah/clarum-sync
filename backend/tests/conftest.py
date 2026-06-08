import pytest
import copy
from datetime import date, timedelta
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# ────────────────────── Mock Data ──────────────────────

MOCK_CASES_MAIN = [
    {
        "id": "fake-uuid-1",
        "name": "Martinez v. Pacific Logistics",
        "case_number": "23STCV10234",
        "case_type": "Class",
        "status": "active",
        "phase": "Discovery",
        "county": "Los Angeles",
        "last_hearing_date": "2026-05-15",
        "last_hearing_name": "CMC",
        "last_hearing_time": "09:00:00",
        "last_hearing_type": "CMC",
        "next_hearing_date": "2026-07-10",
        "next_hearing_name": "Trial Readiness Conference",
        "next_hearing_time": "10:00:00",
        "next_hearing_type": "TRC"
    }
]

MOCK_CASES = [
    {
        "name": "Martinez v. Pacific Logistics",
        "case_number": "23STCV10234",
        "case_type": "Class",
        "status": "active",
        "phase": "Discovery",
        "county": "Los Angeles",
        "id": "fake-uuid-1",
        "snoozed_until": None,
        "snoozed_by": None,
        "hearings": [
            {
                "hearing_date": (date.today() + timedelta(days=30)).isoformat(),
                "hearing_time": "09:00:00",
                "hearing_name": "Trial Readiness Conference",
                "department": "12",
                "judge": "Hon. Sandra Rivera",
                "source": "email",
                "is_confirmed": True,
                "confidence": "HIGH",
                "hearing_type": "TRC"
            }
        ]
    }
]

MOCK_NOTICES = [
    {
        "id": "fake-notice-uuid",
        "source": "email",
        "raw_content": "Court notice for hearing...",
        "extracted_case_number": "23STCV16901",
        "extracted_date": "2026-06-15",
        "extracted_time": "09:00:00",
        "extracted_name": "Case Management Conference",
        "extracted_judge": "Hon. Sandra Rivera",
        "extracted_department": "12",
        "extracted_type": "CMC",
        "confidence": "MEDIUM",
        "confidence_reason": "Judge not found",
        "court": None,
        "cases": {"name": "Martinez v. Pacific Logistics", "case_type": "Class"},
        "notice_status": "pending"
    }
]

EXTRACTED_HEARING_INFO = {
    "hearing_date": "2026-06-15",
    "hearing_time": "09:00:00",
    "hearing_type": "CMC",
    "hearing_name": "Case Management Conference",
    "department": "12",
    "judge": "Hon. Sandra Rivera",
    "case_number": "23STCV16901",
    "case_name": "Martinez v. Pacific Logistics",
    "case_type": "Class",
    "court": "Los Angeles Superior Court"
}

TEST_NOTICE_TEXT = """
SUPERIOR COURT OF CALIFORNIA
COUNTY OF LOS ANGELES

Case No: 23STCV16901
Martinez v. Pacific Logistics

NOTICE OF CASE MANAGEMENT CONFERENCE
DATE: June 15, 2026
TIME: 9:00 AM
DEPT: 12
JUDGE: Hon. Sandra Rivera
"""