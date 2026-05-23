import { Case, Notice} from '@/lib/types';
import { TablerIcon} from '@tabler/icons-react';
import { IconCalendarSmile, IconCalendarSad, IconCalendarQuestion } from "@tabler/icons-react";

export type CardType= 'confirmed' | 'gap' | 'pending'


const SummaryCard= async ({cases, cardType, gapCases, notices}: {cases: Case[], cardType: CardType,
    gapCases: Case[], notices: Notice[] })=>{
    
    const numActiveCases= cases.length
    console.log(gapCases, "gap cases here")
    const confirmedCases= cases.filter((c: Case)=> { 
       return c.hearings && c.hearings.length > 0 &&  c.hearings[0].is_next === true}
    )
    const result= numActiveCases > 0 ? ( confirmedCases.length / numActiveCases) * 100 : 0
    const confirmedCasePercent= Math.round(result)

    const summaryCardFields: Record<CardType, {
        icon: TablerIcon,
        relevantNum: string,
        primaryText: string,
        secondaryText: string

    }>={
            confirmed: {
                icon: IconCalendarSmile,
                relevantNum: `${confirmedCases.length}`,
                primaryText: "Confirmed",
                secondaryText: `${confirmedCasePercent}% of all cases have covered hearings`,
            },

            gap:{
                icon: IconCalendarSad,
                relevantNum: `${gapCases.length}`,
                primaryText: "Gap alerts",
                secondaryText: "No hearing in 90 days",
            },

            pending:{
                icon: IconCalendarQuestion,
                relevantNum: `${notices.length}`,
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