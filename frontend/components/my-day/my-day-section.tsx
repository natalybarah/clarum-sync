'use client'

import { MyDayHearing, OutlookOnlyEvent } from "@/lib/types"
import EmptyState from "./empty-state"
import HearingCard from "./hearing-card"
import OutlookOnlyCard from "./outlook-only-card"
// Group hearings by date in this week section

type MyDaySectionProps={
  title: string,
  date?: string,
  hearings: MyDayHearing[],
  outlookOnly: OutlookOnlyEvent[],
  showDayLabels?: boolean
}

type CardItem = 
    | { type: "hearing", data: MyDayHearing }
    | { type: "outlook_only", data: OutlookOnlyEvent }

const groupByDate=(hearings: MyDayHearing[], outlookOnly: OutlookOnlyEvent[])=>{
    const groups: Record<string, {hearings: MyDayHearing[], outlookOnly: OutlookOnlyEvent[]}>= {}
    const addToGroup= (date: string)=>{
      if (!groups[date]){
        groups[date]= {hearings: [], outlookOnly: []}
      }
    }

    hearings.forEach(h=>{
      addToGroup(h.hearing_date)
      groups[h.hearing_date].hearings.push(h)
    })

    outlookOnly.forEach(e=>{
      addToGroup(e.outlook_date)
      groups[e.outlook_date].outlookOnly.push(e)
    })
    return groups
}

const formatDayLabel = (dateString: string)=>{
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  })
}

const MyDaySection=({
  title,
  date,
  hearings,
  outlookOnly,
  showDayLabels= false
}: MyDaySectionProps)=> {
    const sortedHearings= [...hearings].sort((a,b)=>{
    return  (a.hearing_time ?? "").localeCompare(b.hearing_time ?? "")
    })

    const sortedOutlookOnlyHearings= [...outlookOnly].sort((a,b)=>{
     return (a.outlook_time ?? "").localeCompare(b.outlook_time ?? "")
    })

    const isEmpty = hearings.length === 0 && outlookOnly.length === 0

     const issueCount = hearings.filter(h =>
        ["not_in_outlook", "date_mismatch", "time_mismatch"].includes(h.sync_status)
    ).length

    const warningCount = hearings.filter(h =>
        ["vacated_in_outlook", "continued_in_outlook"].includes(h.sync_status)
    ).length + outlookOnly.length
    // Merge hearings and outlook_only into one sorted list
 

    const getTime = (item: CardItem) => {
        return item.type === "hearing" 
            ? item.data.hearing_time ?? "00:00:00"
            : item.data.outlook_time ?? "00:00:00"
    }

    const mergedCards: CardItem[] = [
        ...sortedHearings.map(h => ({ type: "hearing" as const, data: h })),
        ...sortedOutlookOnlyHearings.map(e => ({ type: "outlook_only" as const, data: e }))
    ].sort((a, b) => getTime(a).localeCompare(getTime(b)))

    return (
        <div className="flex flex-col gap-3">

            {/* Section header */}
            <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-bold text-text-primary tracking-tight">
                    {title}
                </h2>
                {!isEmpty && (
                    <>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-subtle text-text-muted border border-border-default">
                            {hearings.length + outlookOnly.length} hearings
                        </span>
                        {issueCount > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-urgent-bg text-urgent-text border border-urgent-border">
                                {issueCount} {issueCount === 1 ? "issue" : "issues"}
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pending-bg text-pending-text border border-pending-border">
                                {warningCount} {warningCount === 1 ? "warning" : "warnings"}
                            </span>
                        )}
                    </>
                )}
                <div className="flex-1 h-px bg-border-default" />
            </div>

            {/* Empty state */}
            {isEmpty && <EmptyState title={title} />}

            {/* Cards */}
            {!isEmpty && !showDayLabels && (
                <div className="flex flex-col gap-2">
                  {
                    mergedCards.map(item=>
                        item.type === "hearing"
                        ? <HearingCard key={item.data.id} hearing={item.data} />
                        : <OutlookOnlyCard key={item.data.outlook_id} event={item.data}/>
                  )}
                </div>
            )}

            {/* This Week — grouped by day */}
            {!isEmpty && showDayLabels && (() => {
                const groups = groupByDate(hearings, outlookOnly)
                return (
                    <div className="flex flex-col gap-4">
                        {Object.entries(groups)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([date, group]) => (
                                <div key={date} className="flex flex-col gap-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                                        {formatDayLabel(date)}
                                    </p>
                                    {group.hearings.map(h => <HearingCard key={h.id} hearing={h} />)}
                                    {group.outlookOnly.map(e => <OutlookOnlyCard key={e.outlook_id} event={e} />)}
                                </div>
                            ))
                        }
                    </div>
                )
            })()}

        </div>
    )
}



export default MyDaySection;