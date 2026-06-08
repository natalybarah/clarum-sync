import { MyDayHearing } from "@/lib/types"
import { SyncStatus } from "@/lib/types"
import CaseTypeBadge from "../ui/case-type-badge"
import { CaseType } from "../ui/case-type-badge"
import SyncBadge from "../ui/sync-badge"
import { QueuePillButton } from "../ui/queue-button"
import MismatchDetail from "./mismatch-detail"
import { parseTime } from "@/lib/utils"

/*
export type SyncStatus = 
    | "synced" 
    | "not_in_outlook" 
    | "in_outlook_only" 
    | "date_mismatch" 
    | "time_mismatch" 
    | "vacated_in_outlook" 
    | "continued_in_outlook"


*/

const borderStyles: Record<SyncStatus, string> ={
    synced: "border-l-[3px] border-l-confirmed-solid",
    not_in_outlook: "border-l-[3px] border-l-urgent-solid",
    date_mismatch: "border-l-[3px] border-l-urgent-solid",
    time_mismatch: "border-l-[3px] border-l-urgent-solid",
    vacated_in_outlook: "border-l-[3px] border-l-pending-solid",
    continued_in_outlook: "border-l-[3px] border-l-pending-solid",
    in_outlook_only: "border-l-[3px] border-l-pending-solid"
}



const HearingCard=({hearing}: {hearing: MyDayHearing})=>{
  const departmentDisplay= hearing.department?.replace(/^Dept\.?\s*/i, "") ?? ""
  // Parse time into hours and AM/PM format
  const {hours, ampm}= parseTime(hearing.hearing_time)
  const isVacated= hearing.sync_status === "vacated_in_outlook"

  return(
    <div className={`bg-bg-card border border-border-default rounded-xl overflow-hidden ${borderStyles[hearing.sync_status]}`}>
        <div className="grid grid-cols-[80px_1fr_auto] items-center px-4 py-3 gap-0 ">

            {/*Time colimn */}
            <div className="flex flex-col items-start pr-4">
                <span className={`text-[20px] font-semibold leading-none tracking-tight tabular-nums 
                ${isVacated ? "line-through text-text-muted decoration-text-muted" : "text-text-primary"}`}>{hours}</span>
                <span className="text-[10px] font-medium text-text-muted mt-0.5 tracking-wide">{ampm}</span>
            </div>

            {/* Information column*/}

            <div className="flex flex-col gap-1 pl-4 border-l border-border-default ">
                  {/* Case name and type badgee */}
                  <div className=" ">

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[13px] font-medium ${isVacated ? "text-text-muted" : "text-text-primary"}`}>{hearing.cases?.name}</span>
                            {hearing.cases?.case_type && (
                              <CaseTypeBadge variant={hearing.cases.case_type as CaseType}/> 
                            )}
                        </div>

                  {/* Hearing metadata: case number, hearing name, judge, department */}

                                      <div className="flex items-center gap-1.5 text-[11.5px] text-text-secondary">
                                        <span>{hearing.hearing_type}</span>
                                        {hearing.department && (
                                          <>
                                            <span className="text-border-default"> · </span>
                                            <span>Dept. {departmentDisplay}</span>
                                          </>
                                        )}
                                        {hearing.judge && (
                                          <>
                                            <span className="text-border-default">·</span>
                                            <span>{hearing.judge}</span>
                                          </>
                                        )}
                                      </div>

                  {/*Case Number */}
                  {hearing.cases?.case_number && (
                        <span className="text-[10px] text-text-muted font-mono">
                            {hearing.cases.case_number}
                        </span>
                    )}
                  </div>
                  
                  {/* Right column -  badge and action */}

        </div>
            <div className=" flex items-center gap-2 pl-4 ">
                <SyncBadge syncStatus={hearing.sync_status}/>
                {(hearing.sync_status=== "date_mismatch" || hearing.sync_status === "time_mismatch" )&& (
                  <QueuePillButton variant="check_docket" onClick={()=>window.open("https://www.lacourt.org", "_blank")}/>
                )}
              
            </div>

        </div>
        <MismatchDetail hearing={hearing} />

    </div>
  )
}

export default HearingCard;