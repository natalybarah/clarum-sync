import { formatDate, formatTime } from "@/lib/utils"
import { MyDayHearing } from "@/lib/types"
const MismatchDetail = ({ hearing }: { hearing: MyDayHearing }) => {
    const { sync_status, hearing_date, hearing_time, outlook_date, outlook_time } = hearing

    if (sync_status === "synced" || sync_status === "not_in_outlook" || sync_status === "in_outlook_only") {
        return null
    }

    if (sync_status === "vacated_in_outlook" || sync_status === "continued_in_outlook") {
        return (
            <div className="px-4 pb-3 pt-0 flex items-center gap-2 ml-[80px] pl-8">
                <div className="w-px h-4 bg-pending-border" />
                <span className="text-[10.5px] text-pending-text italic">
                    {sync_status === "vacated_in_outlook" 
                        ? "Marked vacated by calendar team — verify if rescheduled" 
                        : "Marked continued — check for new date"}
                </span>
            </div>
        )
    }

    
    const clarum = sync_status === "time_mismatch" ? formatTime(hearing_time) : formatDate(hearing_date)
    const outlook = sync_status === "time_mismatch" ? formatTime(outlook_time ?? "") : formatDate(outlook_date ?? "")

    return (
        <div className="px-4 pb-3 pt-0 ml-[80px] pl-8 flex items-center gap-3">
            <div className="w-px h-4 bg-urgent-border" />
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-text-muted line-through">{clarum}</span>
                <span className="text-text-muted">→</span>
                <span className="text-urgent-text font-semibold">{outlook}</span>
            </div>
            <span className="text-[10px] text-text-muted">
                {sync_status === "time_mismatch" ? "in Outlook" : "in Outlook · possible continuance"}
            </span>
        </div>
    )
}

export default MismatchDetail;