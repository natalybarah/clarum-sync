import { TablerIcon } from "@tabler/icons-react"

type MyDayStatCardProps = {
    icon: TablerIcon
    count: number
    label: string
    variant?: "default" | "issue" | "warning" | "synced"
}

const variantStyles = {
    default: {
        border: "",
        cardBg: "bg-gradient-to-br from-brand-header to-[#1a4a3a]",
        iconBg: "bg-white/10",
        iconColor: "text-brand-accent",
        countColor: "text-white",
        labelColor: "text-white/60"
    },
    issue: {
        border: "border-t-[2.5px] border-t-urgent-solid",
        cardBg: "",
        iconBg: "bg-urgent-bg",
        iconColor: "text-urgent-text",
        countColor: "text-urgent-text",
        labelColor: "text-text-muted"
    },
    warning: {
        border: "border-t-[2.5px] border-t-pending-solid",
        cardBg: "",
        iconBg: "bg-pending-bg",
        iconColor: "text-pending-text",
        countColor: "text-pending-text",
        labelColor: "text-text-muted"
    },
    synced: {
        border: "border-t-[2.5px] border-t-confirmed-solid",
        cardBg: "",
        iconBg: "bg-confirmed-bg",
        iconColor: "text-confirmed-text",
        countColor: "text-confirmed-text",
        labelColor: "text-text-muted"
    }
}
/*
const borderStyles: Record<string, string> = {
    default: "border-t-[2.5px]",
    issue: "border-t-[2.5px] border-t-urgent-solid",
    warning: "border-t-[2.5px] border-t-pending-solid",
    synced: "border-t-[2.5px] border-t-confirmed-solid"
}
*/

const activeCountStyles: Record<string, string> = {
    default: "text-text-primary",
    issue: "text-urgent-text",
    warning: "text-pending-text",
    synced: "text-confirmed-text"
}

/*

const MyDayStatCard = ({ icon: Icon, count, label, variant = "default" }: MyDayStatCardProps) => {
    const isActive = count > 0 && variant !== "default"

    return (
        <div className={`bg-bg-card border border-border-default rounded-xl px-5 py-3 flex items-center gap-4 ${borderStyles[variant]}`}>
            <Icon className="w-5 h-5 text-text-muted" />
            <div>
                <p className={`text-[22px] font-bold leading-none ${isActive ? activeCountStyles[variant] : "text-text-primary"}`}>
                    {count}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
            </div>
        </div>
    )
}

export default MyDayStatCard

*/
const MyDayStatCard = ({ icon: Icon, count, label, variant = "default" }: MyDayStatCardProps) => {
    const isActive = count > 0 && variant !== "default"
    const styles = variantStyles[variant]

    return (
        <div className={`border border-border-default rounded-xl px-4 py-3 flex items-center gap-3 w-[160px] flex-shrink-0 ${styles.border} ${styles.cardBg || "bg-bg-card"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} />
            </div>
            <div>
                <p className={`text-[22px] font-bold leading-none tabular-nums ${
                    variant === "default" 
                        ? styles.countColor 
                        : isActive ? styles.countColor : "text-text-primary"
                }`}>
                    {count}
                </p>
                <p className={`text-[11px] mt-0.5 whitespace-nowrap ${styles.labelColor}`}>
                    {label}
                </p>
            </div>
        </div>
    )
}

export default MyDayStatCard