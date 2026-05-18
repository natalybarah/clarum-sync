export type Hearing = {
  hearing_date: string
  hearing_time: string
  hearing_name: string
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
  county: string
  hearings: Hearing[]
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
  confidence_reason: string
  cases: {
    name: string
    case_type: string
  }
}