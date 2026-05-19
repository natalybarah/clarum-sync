
import { IconCalendarSad, IconCalendarSmile, IconCalendarQuestion } from '@tabler/icons-react';
import { Case } from '@/lib/types';

const SummaryCard= ({cases})=>{

    const numActiveCases= cases.length
    const confirmedCases= cases.filter((c: Case)=> { 
       return c.hearings && c.hearings.length > 0 &&  c.hearings[0].is_next === true}
    )
    console.log(confirmedCases.length)
    const result= numActiveCases > 0 ? ( confirmedCases.length / numActiveCases) * 100 : 0
    const confirmedCasePorcentage= Math.round(result)
    
    //case con no hearing date next para gap alert  mayor de 90 dias
    //pendingreview hearings con  confidence medium low notices.  

    return(
        <div className="w-full flex flex-row gap-4 border border-border-default p-4 rounded-3xl">
            <div className="flex flex-row items-start ">
                <div className="bg-confirmed-bg w-12 h-12 rounded-xl flex items-center justify-center ">
                <IconCalendarSmile className="text-confirmed-solid w-6 h-6 stroke-[1.5px]" />
                </div>
            </div>
            <div className="">
                
                <div className="flex flex-col gap-1 items-start">
                    <p className="text-3xl font-bold self-start">{numActiveCases}</p>
                    <div className="flex flex-col gap-0.2">
                        <p className="text-sm text-text-primary font-semibold">Confirmed cases</p>
                        <span className='text-xs text-text-muted'>{confirmedCasePorcentage}% of all cases have covered hearings</span>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default SummaryCard;