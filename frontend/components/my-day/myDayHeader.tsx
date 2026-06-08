import { IconCalendarCheck, IconAlertTriangle, IconAlertCircle, IconCalendar } from "@tabler/icons-react"
import MyDayStatCard from "./myday-stat-card"
import RefreshButton from "./refresh-button"

type MyDayHeaderProps = {
    syncedCount: number
    issueCount: number
    warningCount: number
    totalCount: number
}

const MyDayHeader = ({ syncedCount, issueCount, warningCount, totalCount }: MyDayHeaderProps) => {
    const today = new Date()
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" })
    const fullDate = today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Greeting */}
            <div className="flex flex-row justify-between">
                <div>

                <h1 className=" tracking-tight">
                    <span className="text-[32px] text-confirmed-text font-bold">Good morning, </span>
                    <span className="text-[28px]  text-text-primary font-medium">Camila team</span>
                </h1>
                <p className="text-[16px] text-text-muted mt-0.5">
                    Here are the team's appearances for this week  —  {dayName}, {fullDate}
                </p>
                <RefreshButton/>
                </div>
                
            <div className="flex items-stretch gap-3 mt-4">
            {/* Horizontal stat cards */}
             {   <MyDayStatCard icon={IconCalendar} count={totalCount} label="Total this week" />}
                <MyDayStatCard icon={IconAlertTriangle} count={issueCount} label="Sync issues" variant="issue" />
                <MyDayStatCard icon={IconAlertCircle} count={warningCount} label="Warnings" variant="warning" />
                <MyDayStatCard icon={IconCalendarCheck} count={syncedCount} label="Synced" variant="synced" />
            </div>
            </div>
        </div>
    )
}

export default MyDayHeader