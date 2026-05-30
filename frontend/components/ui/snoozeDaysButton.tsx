import { snoozeCase } from "@/lib/api";
import { useRouter } from "next/navigation";

const SnoozeDaysButton= ({label, caseId}: {label: number, caseId: string})=>{
    const router= useRouter();
    const onSnooze= async () => {
        await snoozeCase(caseId, label)
        router.refresh()
    }
  
    return(
            <button onClick={onSnooze} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left w-full transition-colors duration-150 hover:bg-bg-subtle group">
                <div className="w-2 h-2 rounded-full bg-text-muted/40 scale-100  transition-all  group-hover:scale-120  group-hover:bg-urgent-solid"></div>
                <span className="text-[12px] text-text-secondary transition-colors duration-150 group-hover:text-text-primary group-hover:translate-x-0.5">{label >= 180 ? "6 months" : `${label} days`}</span> 
            </button>
    )
}

export default SnoozeDaysButton;
