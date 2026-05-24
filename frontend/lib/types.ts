export type Hearing = {
  id: string,
  hearing_date: string
  hearing_time: string
  hearing_name: string,
  hearing_type: string,
  department: string
  judge: string
  source: string
  is_confirmed: boolean
  confidence: string
  is_past: boolean
  is_next: boolean
}

export type Case = {
  id: string,
  name: string
  case_number: string
  case_type: string
  status: string
  phase: string
  county: string,
  last_hearing_date: string | null,
  last_hearing_time: string | null,
  last_hearing_name: string | null,
  last_hearing_type: string | null,
  next_hearing_date: string | null,
  next_hearing_time: string | null,
  next_hearing_name: string | null,
  next_hearing_type: string | null,
}

export type Notice = {
  id: string
  source: string
  raw_content: string
  extracted_case_number: string
  extracted_date: string
  extracted_time: string
  extracted_name: string
  extracted_judge: string
  confidence: string
  confidence_reason: string,
  court: string,
  extracted_department: string,
  cases: {
    name: string
    case_type: string
  }
}