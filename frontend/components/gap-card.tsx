'use client'
import { formatDate, formatTime} from "@/lib/utils";
import { Case, Hearing } from "@/lib/types";
import { CaseType } from "./ui/case-type-badge";
import { QueueIconButton, QueuePillButton } from "./ui/queue-button";
import { verifyCase } from "@/lib/api";
import { useRouter } from "next/navigation";
import CaseTypeBadge from "./ui/case-type-badge";
import SnoozeDropdown from "./snooze-dropdown";

type ExtendedGapCase = Case & {
    confidence: string,
    hearings: Hearing[]

}

type GapUrgency= "URGENT" | "REVIEW"

const urgencyStyles: Record<GapUrgency, string>={
    URGENT: "bg-urgent-bg border-urgent-border border text-urgent-text",
    REVIEW: "bg-pending-bg border-pending-border border text-pending-text"
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
        const router= useRouter()
        const today = new Date()
        const pastHearings= gapCase.hearings
            .filter(h => Date.parse(h.hearing_date) < today.getTime())
            .sort((a,b)=> {
                const elA= Date.parse(a.hearing_date)
                const elB= Date.parse(b.hearing_date)
                return elB - elA    
        })
        const futureHearings= gapCase.hearings
            .filter(h=> Date.parse(h.hearing_date) > today.getTime() )
            .sort((a,b)=> {
                const elA= Date.parse(a.hearing_date)
                const elB= Date.parse(b.hearing_date)
                return elA -elB
            })

        const result = pastHearings.length > 0 ? new Date().getTime() - Date.parse(pastHearings[0].hearing_date) : null 
        const newResult= result ? Math.floor(result / 1000 / 60 / 60 / 24) : null
        
        //const status: GapUrgency= newResult ? > 90 ? "URGENT" : "REVIEW" : null
        const handleVerifyCase= async()=>{
            await verifyCase(gapCase.id);
            router.refresh()
        }

//it found to hearings descending orde february 
    
    return(
        <div className="bg-bg-card border border-border-default rounded-2xl px-4 py-3.5 flex flex-row justify-between gap-4 mb-2">
            
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-text-primary">{gapCase.name}</span>
                    <CaseTypeBadge variant={gapCase.case_type as CaseType} />
                    {/*<span className={`text-[10px] font-bold px-2 py-0.5 rounded full border ${urgencyStyles[status]}`}>{status}</span>*/}
                </div>

                <div className="text-[13px] text-text-tertiary">
                    No confirmed next hearing
                    {newResult > 0 && (
                        <span className="text-text-tertiary">
                            {` — last hearing was ${newResult} days ago`}
                        </span>
                    )}
                    {futureHearings.length > 0 && (
                        <span className="text-text-tertiary">
                            {` · Next known: ${formatDate(futureHearings[0].hearing_date)}  — ${futureHearings[0].hearing_type}`}
                        </span>
                    )}
                </div>
                    <div className="text-[11px] text-text-muted font-mono">
                        {gapCase.last_hearing_date
                            ? `Last: ${pastHearings[0].hearing_type} · ${formatDate(gapCase.last_hearing_date)} at ${formatTime(gapCase.last_hearing_time)}`
                            : "No hearing history found"
                        }
                    </div>
            </div>
            <div className="flex items-center gap-2 flex-0">
                <QueuePillButton variant ="check_docket" onClick={()=>window.open("https://www.lacourt.org", "_blank")}/>
                <SnoozeDropdown caseId={gapCase.id}/>
                {/*<QueueIconButton variant= "mark-verified" onClick={handleVerifyCase}/>
                <QueueIconButton variant="reject" onClick={()=>{}}/>*/}
            </div>
        </div>
    )
}

export default GapCard;