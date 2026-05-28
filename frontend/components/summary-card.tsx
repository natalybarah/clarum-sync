import { Case, Notice} from '@/lib/types';
import { TablerIcon} from '@tabler/icons-react';
import { IconCalendarSmile, IconCalendarSad, IconCalendarQuestion } from "@tabler/icons-react";

export type CardType= 'confirmed' | 'gap' | 'pending'

/*


*/
const SummaryCard= async ({cardType, totalCases, gapCount, noticeCount}: {
    cardType: CardType
    totalCases: number
    gapCount: number
    noticeCount: number
})=>{
    
    const confirmedCount = totalCases - gapCount
    const confirmedPercent = totalCases > 0 ? Math.round((confirmedCount / totalCases) * 100) : 0

    const summaryCardFields: Record<CardType, {
        icon: TablerIcon,
        relevantNum: string,
        primaryText: string,
        secondaryText: string

    }>={
            confirmed: {
                icon: IconCalendarSmile,
                relevantNum: `${confirmedCount}`,
                primaryText: "Confirmed",
                secondaryText: `${confirmedPercent}% of all cases have covered hearings`,
            },

            gap:{
                icon: IconCalendarSad,
                relevantNum: `${gapCount}`,
                primaryText: "Gap alerts",
                secondaryText: "No hearing in 90 days",
            },

            pending:{
                icon: IconCalendarQuestion,
                relevantNum: `${noticeCount}`,
                primaryText: "Pending review",
                secondaryText: "AI notices awaiting confirmation from paralegal",
            }
    }
    const {icon: Icon}= summaryCardFields[cardType]


    return(
        <div className="w-full flex flex-row gap-4 border border-border-default p-4 rounded-3xl">
            <div className="flex flex-row items-start ">
                <div className={ `${cardType === "confirmed" ? "bg-confirmed-bg" : cardType === "gap" ? "bg-urgent-bg" : "bg-pending-bg"}  w-12 h-12 rounded-xl flex items-center justify-center` }>
                <Icon className={`${cardType ==="confirmed" ? "text-confirmed-solid" : cardType === "gap" ? "text-urgent-text" : "text-pending-text" } w-6 h-6 stroke-[1.5px]` }/>
                </div>
            </div>
            <div className="">
                <div className="flex flex-col gap-1 items-start">
                    <p className="text-3xl font-bold self-start">{summaryCardFields[cardType].relevantNum}</p>
                    <div className="flex flex-col gap-0.2">
                        <p className="text-sm text-text-primary font-semibold">{summaryCardFields[cardType].primaryText}</p>
                        <span className='text-xs text-text-muted'>{summaryCardFields[cardType].secondaryText}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryCard;