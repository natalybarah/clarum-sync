
import { SyncStatus } from "@/lib/types"
import { IconCheck, IconBolt, IconQuestionMark, IconCancel, IconArrowForward} from "@tabler/icons-react"
import { TablerIcon } from "@tabler/icons-react"

const SyncBadgeStyles: Record<SyncStatus, { 
    label: string
    icon: TablerIcon
    containerClass: string
    iconClass: string
    textClass: string
}> = {
    synced: {
        label: "Synced",
        icon: IconCheck,
        containerClass: "bg-confirmed-bg border-confirmed-border",
        iconClass: "text-confirmed-text w-3 h-3",
        textClass: "text-confirmed-text"
    },
    not_in_outlook: {
        label: "Missing from Outlook",
        icon: IconBolt,
        containerClass: "bg-urgent-bg border-urgent-border",
        iconClass: "text-urgent-text w-3 h-3",
        textClass: "text-urgent-text"
    },
    date_mismatch: {
        label: "Date mismatch",
        icon: IconBolt,
        containerClass: "bg-urgent-bg border-urgent-border",
        iconClass: "text-urgent-text w-3 h-3",
        textClass: "text-urgent-text"
    },
    time_mismatch: {
        label: "Time mismatch",
        icon: IconBolt,
        containerClass: "bg-urgent-bg border-urgent-border",
        iconClass: "text-urgent-text w-3 h-3",
        textClass: "text-urgent-text"
    },
    vacated_in_outlook: {
        label: "Vacated in Outlook",
        icon: IconCancel,
        containerClass: "bg-pending-bg border-pending-border",
        iconClass: "text-pending-text w-3 h-3",
        textClass: "text-pending-text"
    },
    continued_in_outlook: {
        label: "Continued in Outlook",
        icon: IconArrowForward,
        containerClass: "bg-pending-bg border-pending-border",
        iconClass: "text-pending-text w-3 h-3",
        textClass: "text-pending-text"
    },
    in_outlook_only: {
        label: "In Outlook only",
        icon: IconQuestionMark,
        containerClass: "bg-pending-bg border-pending-border",
        iconClass: "text-pending-text w-3 h-3",
        textClass: "text-pending-text"
    }
}

const SyncBadge=({syncStatus}: {syncStatus: SyncStatus})=>{
    const Icon = SyncBadgeStyles[syncStatus].icon
    const styles = SyncBadgeStyles[syncStatus]
 

  return (
        <div className={`inline-flex flex-row gap-1 items-center rounded-full border px-2.5 py-0.5 ${styles.containerClass}`}>
            <Icon className={styles.iconClass} />
            <span className={`text-[10px] font-semibold ${styles.textClass}`}>
                {styles.label}
            </span>
        </div>
    )


}

export default SyncBadge;
