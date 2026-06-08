import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/*
 const genExtraInfoCases= ()=>{
           
        return   cases.map((caseItem: Case)=>{
            
            const pastHearings: number[]=[]
            const futureHearings: number[]=[]
            caseItem.hearings.map((hearingItem: Hearing)=>{
                
                const hearingItemParsed= Date.parse(hearingItem.hearing_date)
                //const hearingItemParsed= new Date(hearingItemToParse)
                if (hearingItemParsed < Date.now()){
                    pastHearings.push(hearingItemParsed)

                } else {
                    futureHearings.push(hearingItemParsed)
                }
                
                return hearingItem
            })
            // Finds the last hearing date and the nearest hearing date

            const pastTimestamp= Math.max(...pastHearings)
            const futureTimestamp= Math.min(...futureHearings)

            // Finds the hearing item that matches the last hearing and nearest hearing by comparing timestamps
            const searchPastHearingName= caseItem.hearings.find(item=> Date.parse(item.hearing_date) === pastTimestamp)
            const searchFutureHearingName= caseItem.hearings.find(item=> Date.parse(item.hearing_date) === futureTimestamp)

            // Stores the hearing name found as the matching hearing for the last and nearest hearing
            const pastHearingName= searchPastHearingName?.hearing_name ?? null
            const futureHearingName= searchFutureHearingName?.hearing_name ?? null

            // Formats timestamps to display

            const pastHearingDate= formatDate(pastTimestamp)
            const futureHearingDate= formatDate(futureTimestamp)

            // returns case with additional fields 
            return {...caseItem, pastHearingDate, futureHearingDate, pastHearingName, futureHearingName}
        })
}
*/
// Gets cases with last and next hearing

/*
const extendedCases= cases.map(((c): ExtendedCase=>{
        // Checks a case has hearing items to continue
        if (!c.hearings || c.hearings.length === 0){
            return {...c, pastHearingDate: null, futureHearingDate: null, lastHearing: null, nextHearing: null }
        }

        // Filters hearings before today
        const findPastHearings= c.hearings.filter((h: Hearing)=> Date.parse(h.hearing_date) < Date.now() )
        // Sorts hearing dates by descending order
        .sort((a: Hearing,b: Hearing)=> Date.parse(b.hearing_date) - Date.parse(a.hearing_date))
        // Takes the first hearing in the array which is the most recent hearing before today
        const pastHearingDate= formatDate(findPastHearings[0]?.hearing_date)

        // Filters hearings after today
        const findFutureHearings=c.hearings.filter((h: Hearing)=> Date.parse(h.hearing_date) >= Date.now())
        // Sorts hearing dates by ascending order and
        .sort((a: Hearing, b: Hearing)=> Date.parse(a.hearing_date) - Date.parse((b.hearing_date)))
        // Takes the first hearing in array which is the nearest from today
        const futureHearingDate= formatDate(findFutureHearings[0]?.hearing_date)

        // Returns case item with additional fields including the hearing object to access its name 
        return {...c, pastHearingDate, futureHearingDate, lastHearing: findPastHearings[0] ?? null, nextHearing: findFutureHearings[0] ?? null}
    }))
*/
export const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const timestamp = Date.parse(dateStr)
    if (!timestamp || !isFinite(timestamp)) return null;
    return new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export const formatTime=(timeStr: string | null | undefined)=> {
    if(!timeStr) return null
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US',{
        hour: 'numeric',
        minute: "2-digit",
        hour12: true
    })
}

export const parseTime=(timeString: string)=>{
  if(!timeString) return {hours: "--", ampm: ""}
  const [hourString, minuteString]= timeString.split(":")
  const hour= parseInt(hourString)
  const ampm= hour >= 12 ? "PM" : "AM"
  const displayHour= hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return {hours: `${displayHour}:${minuteString}`, ampm}
}

