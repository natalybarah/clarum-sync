import { MyDayData } from "./types"

// Helper to get date strings relative to today
const getDateStr = (daysFromNow: number = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    return d.toISOString().split("T")[0]
}

// Helper to get next weekday (skip weekends)
const getNextWeekday = (daysFromNow: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1)
    }
    return d.toISOString().split("T")[0]
}

export const MOCK_MY_DAY_DATA: MyDayData = {
    token_valid: false,
    today: {
        date: getDateStr(0),
        hearings: [
            {
                id: "demo-1",
                hearing_date: getDateStr(0),
                hearing_time: "09:00:00",
                hearing_name: "Case Management Conference",
                hearing_type: "CMC",
                department: "12",
                judge: "Hon. Sandra Rivera",
                case_id: "demo-case-1",
                cases: {
                    id: "demo-case-1",
                    name: "Martinez v. Pacific Logistics Group",
                    case_number: "23STCV10234",
                    case_type: "Class"
                },
                sync_status: "synced",
                outlook_date: getDateStr(0),
                outlook_time: "09:00:00",
                outlook_subject: "(Camila Team) Martinez v Pacific Logistics - CMC"
            },
            {
                id: "demo-2",
                hearing_date: getDateStr(0),
                hearing_time: "10:30:00",
                hearing_name: "Order to Show Cause",
                hearing_type: "OSC",
                department: "23",
                judge: "Hon. Michael Torres",
                case_id: "demo-case-2",
                cases: {
                    id: "demo-case-2",
                    name: "Reyes v. SoCal Hospitality LLC",
                    case_number: "23STCV11456",
                    case_type: "PAGA"
                },
                sync_status: "time_mismatch",
                outlook_date: getDateStr(0),
                outlook_time: "08:00:00",
                outlook_subject: "(Camila Team) Reyes v. SoCal Hospitality - OSC"
            },
            {
                id: "demo-3",
                hearing_date: getDateStr(0),
                hearing_time: "11:00:00",
                hearing_name: "Case Management Conference",
                hearing_type: "CMC",
                department: "18",
                judge: "Hon. Robert Liu",
                case_id: "demo-case-4",
                cases: {
                    id: "demo-case-4",
                    name: "Garcia v. Pacific Coast Distributors LLC",
                    case_number: "RIC2300345",
                    case_type: "PAGA"
                },
                sync_status: "vacated_in_outlook",
                outlook_date: getDateStr(0),
                outlook_time: "11:00:00",
                outlook_subject: "[VACATED] (Camila Team) Garcia v. Pacific Coast - CMC"
            },
            {
                id: "demo-4",
                hearing_date: getDateStr(0),
                hearing_time: "14:00:00",
                hearing_name: "Trial Readiness Conference",
                hearing_type: "TRC",
                department: "45",
                judge: "Hon. Patricia Chen",
                case_id: "demo-case-3",
                cases: {
                    id: "demo-case-3",
                    name: "Thompson v. Western Retail Partners Inc",
                    case_number: "23STCV12567",
                    case_type: "Class"
                },
                sync_status: "not_in_outlook",
                outlook_date: null,
                outlook_time: null,
                outlook_subject: null
            }
        ],
        outlook_only: [
            {
                outlook_id: "demo-outlook-1",
                subject: "(Camila Team) Kim v. Pacific Tech Solutions - OSC",
                outlook_date: getDateStr(0),
                outlook_time: "15:00:00",
                sync_status: "in_outlook_only",
                case_id: "demo-case-5"
            }
        ]
    },
    tomorrow: {
        date: getDateStr(1),
        hearings: [
            {
                id: "demo-5",
                hearing_date: getDateStr(1),
                hearing_time: "09:30:00",
                hearing_name: "Motion to Compel Discovery",
                hearing_type: "Motion",
                department: "44",
                judge: "Hon. Lisa Nguyen",
                case_id: "demo-case-6",
                cases: {
                    id: "demo-case-6",
                    name: "Nguyen v. Bay Area Transit Authority",
                    case_number: "30-2023-01345678",
                    case_type: "FEHA"
                },
                sync_status: "synced",
                outlook_date: getDateStr(1),
                outlook_time: "09:30:00",
                outlook_subject: "(Camila Team) Nguyen v. Bay Area Transit - Motion"
            },
            {
                id: "demo-6",
                hearing_date: getDateStr(1),
                hearing_time: "14:00:00",
                hearing_name: "Status Conference",
                hearing_type: "OSC",
                department: "31",
                judge: "Hon. David Park",
                case_id: "demo-case-7",
                cases: {
                    id: "demo-case-7",
                    name: "Alvarado v. United Education Institute",
                    case_number: "5220006757",
                    case_type: "Retaliation"
                },
                sync_status: "date_mismatch",
                outlook_date: getDateStr(3),
                outlook_time: "14:00:00",
                outlook_subject: "(Camila Team) Alvarado v. United Education - OSC"
            }
        ],
        outlook_only: []
    },
    this_week: {
        end_date: getNextWeekday(5),
        hearings: [
            {
                id: "demo-7",
                hearing_date: getNextWeekday(3),
                hearing_time: "09:00:00",
                hearing_name: "Trial",
                hearing_type: "Trial",
                department: "18",
                judge: "Hon. Sarah Kim",
                case_id: "demo-case-8",
                cases: {
                    id: "demo-case-8",
                    name: "Johnson v. Pacific Steel Works Inc",
                    case_number: "RIC2300567",
                    case_type: "Retaliation"
                },
                sync_status: "synced",
                outlook_date: getNextWeekday(3),
                outlook_time: "09:00:00",
                outlook_subject: "(Camila Team) Johnson v. Pacific Steel - Trial"
            },
            {
                id: "demo-8",
                hearing_date: getNextWeekday(4),
                hearing_time: "10:00:00",
                hearing_name: "Case Management Conference",
                hearing_type: "CMC",
                department: "8",
                judge: "Hon. Tani Cantil-Sakauye",
                case_id: "demo-case-9",
                cases: {
                    id: "demo-case-9",
                    name: "Lopez v. Solutions Consulting Inc",
                    case_number: "BC-2024-08812",
                    case_type: "Class"
                },
                sync_status: "synced",
                outlook_date: getNextWeekday(4),
                outlook_time: "10:00:00",
                outlook_subject: "(Camila Team) Lopez v. Solutions Consulting - CMC"
            }
        ],
        outlook_only: [
            {
                outlook_id: "demo-outlook-2",
                subject: "(Camila Team) Price v. Andy Frain Services - CMC",
                outlook_date: getNextWeekday(3),
                outlook_time: "13:30:00",
                sync_status: "in_outlook_only",
                case_id: "demo-case-10"
            }
        ]
    }
}