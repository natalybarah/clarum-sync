import { formatDate, formatTime} from "@/lib/utils";
import { Case, Hearing } from "@/lib/types";

type ExtendedGapCase = Case & {
    confidence: string,
    hearings: Hearing[]

}
/*


    data= ( supabase.from_("cases")
        .select("name, case_number, case_type, status, phase, county, "
        "hearings(hearing_date, hearing_time, hearing_name, department, judge, source, is_confirmed, confidence)")
        .eq("status", "active")
        .execute()

*/
const GapCard=({gapCase}: {gapCase: ExtendedGapCase})=>{
    // Orders past hearings by descending order
   // const calcDaysFromLastHearing=()=>{
         const pastHearings= gapCase.hearings.sort((a,b)=> {
            const elA= Date.parse(a.hearing_date)
            const elB= Date.parse(b.hearing_date)
            return elB - elA
        })

        const result = new Date().getTime() - Date.parse(pastHearings[0].hearing_date);
        const newResult= Math.floor(result / 1000 / 60 / 60 / 24)
        const status= newResult > 100 ? "Urgent" : "Review"
    /*
    500000
    num / 1000ms= num in sg
    num /60seg= num in min
    num /60min = num in hours
    num /24h= num in h
    num 
    */
        
    //}
   // calcDaysFromLastHearing()

    
    return(
        <div className="flex flex-row">
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <h3>{gapCase.name}</h3>
                    <span>{gapCase.case_type}</span>
                    <span>{status}</span>
                </div>
                    <p>{`No confirmed next hearing — last hearing was ${newResult} days ago `}</p>
                    <p>{`Last: ${pastHearings[0].hearing_type}` }</p>
            </div>
            <div className="flex flex-col">
                <p>Verify now</p>
                <p>Mark verified</p>
            </div>
        </div>
    )
}

export default GapCard;