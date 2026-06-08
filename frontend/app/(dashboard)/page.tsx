export const dynamic = 'force-dynamic'
import { getMyDay } from "@/lib/api"
import { MyDayData } from "@/lib/types"
import MyDayHeader from "@/components/my-day/myDayHeader"
import MyDaySection from "@/components/my-day/my-day-section"
import { MOCK_MY_DAY_DATA } from "@/lib/mock-date"
import { IconLockHeart } from "@tabler/icons-react"
import { Icon } from "lucide-react"

const MyDay = async () => {
    const today= new Date();
    const getDay= today.getDay()

    let data: MyDayData

    try {
        data = await getMyDay()
       
        if (!data.token_valid && 
            data.today.hearings.length === 0 && 
            data.tomorrow.hearings.length === 0 && 
            data.this_week.hearings.length === 0) {
            data = MOCK_MY_DAY_DATA
        }
    } catch {
        data = MOCK_MY_DAY_DATA
    }

    const allHearings = [
        ...data.today.hearings,
        ...data.tomorrow.hearings,
        ...data.this_week.hearings
    ]
    const hearingHoy= data.today.hearings[0]
    const allOutlookOnly = [
        ...data.today.outlook_only,
        ...data.tomorrow.outlook_only,
        ...data.this_week.outlook_only
    ]

    const syncedCount = allHearings.filter(h => h.sync_status === "synced").length
    const issueCount = allHearings.filter(h =>
        h.sync_status === "not_in_outlook" ||
        h.sync_status === "date_mismatch" ||
        h.sync_status === "time_mismatch"
    ).length
    const warningCount = allHearings.filter(h =>
        h.sync_status === "vacated_in_outlook" ||
        h.sync_status === "continued_in_outlook"
    ).length + allOutlookOnly.length
    const totalHearingsCount = allHearings.length + allOutlookOnly.length


    return (
        <div className="flex flex-col gap-8">
          {!data.token_valid && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-subtle border border-border-default rounded-xl">
                      <IconLockHeart className="text-brand-header w-4s h-4"/>
                  <span className="text-[11px] font-medium text-text-muted">
                       Demo mode — showing sample data. In production, this page cross-checks live Outlook calendar events against Clarum hearings in real time.
                  </span>
              </div>
          )}
            <MyDayHeader
                syncedCount={syncedCount}
                issueCount={issueCount}
                warningCount={warningCount}
                totalCount={totalHearingsCount}
            />
            <MyDaySection
                title="Today"
                date={data.today.date}
                hearings={data.today.hearings}
                outlookOnly={data.today.outlook_only}
            />
            {getDay != 5 &&(
                <MyDaySection
                    title="Tomorrow"
                    date={data.tomorrow.date}
                    hearings={data.tomorrow.hearings}
                    outlookOnly={data.tomorrow.outlook_only}
                />
            )}
            {getDay != 5 &&(
                <MyDaySection
                    title="This week"  
                    hearings={data.this_week.hearings}
                    outlookOnly={data.this_week.outlook_only}
                    showDayLabels={true}
                />
            )}
            
        </div>
    )
}

export default MyDay