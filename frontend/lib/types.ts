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
  extracted_judge: string,
  extracted_type:string
  confidence: string
  confidence_reason: string,
  court: string,
  extracted_department: string,
  cases: {
    name: string
    case_type: string
  }
}
/*
   return {
        "today": {
            "date": today.isoformat(),
            "hearings": today_hearings,
            "outlook_only": today_outlook_only
        },
        "tomorrow": {
            "date": tomorrow.isoformat(),
            "hearings": tomorrow_hearings,
            "outlook_only": tomorrow_outlook_only
        },
        "this_week": {
            "end_date": end_of_week.isoformat(),
            "hearings": this_week_hearings,
            "outlook_only": week_outlook_only
        }
    }*/

export type SyncStatus = 
    | "synced" 
    | "not_in_outlook" 
    | "in_outlook_only" 
    | "date_mismatch" 
    | "time_mismatch" 
    | "vacated_in_outlook" 
    | "continued_in_outlook"

export type MyDayHearing = {
    id: string
    hearing_date: string
    hearing_time: string
    hearing_name: string
    hearing_type: string
    department: string
    judge: string
    case_id: string
    cases: {
        id: string
        name: string
        case_number: string
        case_type: string
    }
    sync_status: SyncStatus
    outlook_date: string | null
    outlook_time: string | null
    outlook_subject: string | null
}

export type OutlookOnlyEvent = {
    outlook_id: string
    subject: string
    outlook_date: string
    outlook_time: string
    sync_status: "in_outlook_only",
    case_id: string | null  
}

export type MyDaySection = {
    date?: string
    end_date?: string
    hearings: MyDayHearing[]
    outlook_only: OutlookOnlyEvent[]
}

export type MyDayData = {
    token_valid: boolean,
    today: MyDaySection
    tomorrow: MyDaySection
    this_week: MyDaySection
}
