import re
import pytz
from datetime import datetime

def extract_case_number_from_text(text: str) -> str:
    """Look for California case number patterns in text."""
    if not text:
        return None
    patterns = [
        r'\b\d{2}[A-Z]{2,5}\d{4,8}\b', # 25STCVI12345678
        r'\b\d{2}-\d{4}-\d{8}\b',# 24-2025-12345678
        r'\b[A-Z]{2,5}\d{6,10}\b', # SKCVZ1234567891
        r'\b[A-Z]{2,4}-\d{2,5}-\d{2,6}\b',  # BCV-25-12345678
        r'\b[A-Z]{2,4}-\d{2,6}\b' # CVO-123456
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group()
    return None


def strip_team_prefix(subject: str) -> str:
    """Remove team prefixes like (Camila Team), [Camila], (Camila Team/AA)."""
    cleaned = re.sub(r'^\([^)]+\)\s*', '', subject)
    cleaned = re.sub(r'^\[[^\]]+\]\s*', '', cleaned)
    return cleaned.strip()


def detect_status_prefix(subject: str) -> str:
    """Returns 'vacated', 'continued', 'off', or None."""
    subject_lower = subject.lower()
    if any(p in subject_lower for p in ['[vacated]', '[vacated', '[vac]', "[vac'd]", '[cancelled]', '[canceled]']):
        return 'vacated'
    if any(p in subject_lower for p in ["[cont'd", '[continued]', '[cont]', "[cont'd to]"]):
        return 'continued'
    if any(p in subject_lower for p in ['[off]', '[ooo]']):
        return 'off'
    return None


def has_team_prefix(subject: str) -> bool:
    """Check if subject has any team prefix like (Camila Team) or [Camila]."""
    return bool(re.match(r'^[\(\[][\w\s/]+[\)\]]', subject))


HEARING_KEYWORDS_IN_SUBJECT = [
    "hearing", "cmc", "case management", "osc", "show cause",
    "trial", "trc", "trial readiness", "motion", "ex parte", "conference",
    "status conference", "court", "appearance", "non-appearance"
]

NOT_HEARING_KEYWORDS =[
    "last day", "LD", "L/D", "file and serve", "reminder", "tentative ruling", "TR"
]

def is_hearing_event(subject: str) -> bool:
    """Check if the Outlook event subject suggests it's a hearing  """
    subject_lower = subject.lower()
    has_hearing_keyword= any(kw in subject_lower for kw in HEARING_KEYWORDS_IN_SUBJECT)
    has_exclusion_keyword= any(kw in subject_lower for kw in NOT_HEARING_KEYWORDS)

    return has_hearing_keyword and not has_exclusion_keyword


def utc_to_pacific(time_str: str, date_str: str):
    
    pacific = pytz.timezone("America/Los_Angeles")
    dt_utc = datetime.strptime(f"{date_str}T{time_str}", "%Y-%m-%dT%H:%M:%S")
    dt_utc = dt_utc.replace(tzinfo=pytz.utc)
    dt_pacific = dt_utc.astimezone(pacific)
    return dt_pacific.strftime("%H:%M:%S"), dt_pacific.strftime("%Y-%m-%d")