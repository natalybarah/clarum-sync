export const dynamic = 'force-dynamic'
import { getGapCases, getNotices } from "@/lib/api";
import { Case, Notice, Hearing} from "@/lib/types";
import NoticeCard from "@/components/notice-card";
import GapCard from "@/components/gap-card";
import { formatDate, formatTime } from "@/lib/utils";

type ExtendedGapCase = Case & {
    confidence: string,
    hearings: Hearing[]

}

const today= new Date();

const TodayQueue= async ()=>{

    const todayDate= today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
    const gapCases= await getGapCases();
    const pendingNotices= await getNotices();
    const totalItems= gapCases.length + pendingNotices.length

    console.log(gapCases, "GAP CASES")
    return(
        <div className="">
            <div>
                <div>
                    <div className="text-text-primary font-bold text-2xl">{`Today's queue`}</div>
                    <p className="text-text-secondary text-[14px]">{` ${todayDate} — ${totalItems} items need attention`}</p> 
                </div>
                <div className="flex flex-row items-center flex-nowrap gap-3">
                    <div className="text-text-secondary  text-[10px] tracking-wider font-medium text-nowrap">PENDING AI NOTICES </div>
                    <div className="text-pending-text bg-pending-bg rounded-3xl px-1.5 py-0.5 text-[10px]">{pendingNotices.length}</div>
                    <div className="bg-text-muted/30 w-full h-[.90px] text-center "> </div>
                </div>
                    {pendingNotices.map((notice: Notice)=>(
                            <NoticeCard key={notice.id} notice={notice}/>
                    )
                    )}    
                <h2>section B</h2>
                {gapCases.map((gapCase: ExtendedGapCase)=>(
                        <GapCard key={gapCase.id} gapCase={gapCase}/>
                ))}
                
            </div>
        </div>
    )
}

export default TodayQueue;