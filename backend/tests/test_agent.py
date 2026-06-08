from unittest.mock import patch
from agent import assign_confidence_score, get_hearing_from_text, insert_notice
from tests.conftest import EXTRACTED_HEARING_INFO, TEST_NOTICE_TEXT


# ---------------------------------------- Confidence Scoring ---------------------------------------------

def test_assign_confidence_score_high():
    confidence_score, _ = assign_confidence_score(EXTRACTED_HEARING_INFO)
    assert confidence_score == "HIGH"


def test_assign_confidence_score_medium():
    extracted = {**EXTRACTED_HEARING_INFO, "judge": None}
    confidence_score, _ = assign_confidence_score(extracted)
    assert confidence_score == "MEDIUM"


def test_assign_confidence_score_low():
    extracted = {**EXTRACTED_HEARING_INFO, "case_number": None}
    confidence_score, _ = assign_confidence_score(extracted)
    assert confidence_score == "LOW"


def test_assign_confidence_score_low_missing_date():
    extracted = {**EXTRACTED_HEARING_INFO, "hearing_date": None}
    confidence_score, _ = assign_confidence_score(extracted)
    assert confidence_score == "LOW"


def test_assign_confidence_score_low_missing_time():
    extracted = {**EXTRACTED_HEARING_INFO, "hearing_time": None}
    confidence_score, _ = assign_confidence_score(extracted)
    assert confidence_score == "LOW"


#  ----------------------------------------AI Extraction ----------------------------------------

def test_get_hearing_from_text():
    with patch("agent.openai_client") as mock_openai:
        mock_openai.responses.parse.return_value.output_parsed.model_dump.return_value = EXTRACTED_HEARING_INFO
        result = get_hearing_from_text(TEST_NOTICE_TEXT)
        assert result == EXTRACTED_HEARING_INFO
        assert result["case_number"] == "23STCV16901"
        assert result["hearing_type"] == "CMC"


#  ----------------------------------------  Insert Notice  ----------------------------------------

def test_insert_notice_with_high_score():
    with patch("agent.supabase") as mock_supabase, \
         patch("agent.insert_hearing") as mock_insert_hearing:

        
        mock_supabase.table.return_value.select.return_value \
            .eq.return_value.execute.return_value.data = [
                {"id": "fake-case-uuid", "case_number": "23STCV16901"}
            ]

        # No duplicate notice exiss
        mock_supabase.table.return_value.select.return_value \
            .eq.return_value.eq.return_value.eq.return_value \
            .execute.return_value.data = []

        # Notice insert returns an id
        mock_supabase.table.return_value.insert.return_value \
            .execute.return_value.data = [{"id": "fake-notice-uuid"}]

        insert_notice(EXTRACTED_HEARING_INFO, "HIGH", "All fields were extracted", TEST_NOTICE_TEXT)

        # insert_hearing should be called since confidence is HIGH and case was found
        mock_insert_hearing.assert_called_once()


def test_insert_notice_with_medium_score():
    with patch("agent.supabase") as mock_supabase, \
         patch("agent.insert_hearing") as mock_insert_hearing:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "fake-case-uuid", "case_number": "23STCV16901"}
        ]
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{"id": "fake-notice-uuid"}]

        insert_notice(EXTRACTED_HEARING_INFO, "MEDIUM", "Judge not found", TEST_NOTICE_TEXT)
        mock_insert_hearing.assert_not_called()


def test_insert_notice_case_not_found():
    with patch("agent.supabase") as mock_supabase, \
         patch("agent.insert_hearing") as mock_insert_hearing:
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

        insert_notice(EXTRACTED_HEARING_INFO, "HIGH", "All fields were extracted", TEST_NOTICE_TEXT)
        mock_insert_hearing.assert_not_called()