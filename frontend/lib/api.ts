import { Parastoo } from "next/font/google"

const FAST_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"


// /----------------------------------------- API Endpoints ------------------------------------/
export const getCases= async(page: number = 1, query: string = "") =>{
    const params= new URLSearchParams({page: page.toString()})
    if(query) params.set('query', query)
    const data= await fetch(`${FAST_API_URL}/cases?${params.toString()}`, { cache: 'no-store' })
    
    if (!data.ok) throw new Error(`An error ocurred, failed to fetch cases ${data.status} ${data.statusText}`)
    const cases= await data.json()
    return cases
}

export const getNotices= async()=>{
    const data= await fetch(`${FAST_API_URL}/notices`, { cache: 'no-store' })
    if (!data.ok) throw new Error("An error ocurred, failed to fetch notices")
    const notices= data.json()
    return notices
}

export const getGapCases= async()=>{
    const data= await fetch(`${FAST_API_URL}/cases/gaps`, { cache: 'no-store' })
    if (!data.ok) throw new Error("An error ocurred, failed to fetch cases with gaps")
    const gapCases= data.json()
    return gapCases
}

export const confirmNotice= async(notice_id:string , correction?: {
    hearing_date?: string
    hearing_time?: string
    hearing_name?: string
    hearing_type?: string
    department?: string
    judge?: string
    court?: string

}) => {
    const message= await fetch(`${FAST_API_URL}/notices/${notice_id}/approve`, {
        method: 'PATCH',
        cache: 'no-store',
        headers: {'Content-Type': 'application/json'},
        body: correction ? JSON.stringify(correction): undefined
    })
    if(!message.ok) throw new Error(`Failed to approve notice: ${message.status}`)
        return message

}


export const rejectNotice= async(notice_id: string)=> {
    const message= await fetch(`${FAST_API_URL}/notices/${notice_id}/reject`, {
        method: 'PATCH',
        cache: 'no-store'
    })
    if(!message.ok) throw new Error("An error ocurred, notice failed to be rejected")
    return message
}

export const verifyCase= async(case_id: string)=> {
    const message= await fetch(`${FAST_API_URL}/cases/${case_id}/verify`, {
        method: 'PATCH',
        cache: 'no-store'
    })
    if(!message.ok) throw new Error("An error ocurred. Failed to verify case manually")
    return message
}


/* -------------------------------------------------- Snooze case endpoint ----------------------------------------------------*/

export const snoozeCase= async(case_id: string, snooze_days: number)=>{
    const message= await fetch(`${FAST_API_URL}/cases/${case_id}/snooze?snooze_days=${snooze_days}`, {
        method: 'PATCH',
        cache: 'no-store'
    })
    if(!message.ok) throw new Error("an error ocurred, the case was not snoozed")
    return message
}

/* ------------------------------------------------ Process Emails  ---------------------------------*/

export const processEmails= async()=>{
    const response= await fetch(`${FAST_API_URL}/emails/process`, {
        method: 'POST',
        cache: 'no-store'
    })

    if (!response.ok) throw new Error(`Failed to process emails: ${response.status}`)
    return response.json()
}/*
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
    }
*/

/* ----------------------------------------------------- My Day Endpoint ---------------------------------------------------- */

export const getMyDay= async ()=>{
    const response= await fetch(`${FAST_API_URL}/my-day`, {cache: 'no-store'})
    if (!response.ok) throw new Error(`Failed.  ${response.status} an error ocurred fetching my day information`)
    return response.json()
}


/* -----------------------------------------------------Create hearing endpoint for only outlook events ---------------------- */
export const createHearing = async (hearing: {
    hearing_date: string
    hearing_time: string
    hearing_name?: string
    hearing_type?: string
    department?: string
    judge?: string
    case_id: string
}) => {
    const response = await fetch(`${FAST_API_URL}/hearings`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hearing)
    })
    if (!response.ok) throw new Error(`Failed to create hearing: ${response.status}`)
    return response.json()
}