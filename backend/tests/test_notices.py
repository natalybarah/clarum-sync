from unittest.mock import patch, MagicMock
from tests.conftest import client, MOCK_NOTICES


# -------------------------------------------------- GET /notices --------------------------------------------------------

def test_get_notices():
    with patch("routes.notices.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = MOCK_NOTICES

        response = client.get("/notices")
        assert response.status_code == 200
        result = response.json()
        assert isinstance(result, list)
        assert len(result) == 1


# --------------------------------------------------------PATCH /notices/{id}/approve --------------------------------------------------------

def test_approve_notice():
    with patch("routes.notices.supabase") as mock_supabase, \
         patch("routes.notices.insert_hearing") as mock_insert_hearing:

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


def test_approve_notice_not_found():
    with patch("routes.notices.supabase") as mock_supabase:
        mock_supabase.from_.return_value.select.return_value.eq.return_value.execute.return_value.data = []

        response = client.patch("/notices/nonexistent-uuid/approve")
        assert response.status_code == 200
        assert "error" in response.json()


# -------------------------------------------------------- PATCH /notices/{id}/reject --------------------------------------------------------

def test_reject_notice():
    with patch("routes.notices.supabase") as mock_supabase:
        mock_supabase.from_.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        response = client.patch(f"/notices/{MOCK_NOTICES[0]['id']}/reject")
        assert response.status_code == 200
        assert response.json()["message"] == "Notice has been sucessfully rejected"