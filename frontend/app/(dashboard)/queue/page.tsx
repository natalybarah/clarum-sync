export const dynamic = 'force-dynamic'
import { getGapCases, getNotices } from "@/lib/api";
import { Case, Notice, Hearing} from "@/lib/types";
import NoticeCard from "@/components/notice-card";
import GapCard from "@/components/gap-card";
import BackButton from "@/components/ui/back-button";

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
        <div>
            <BackButton/>
            <div>
                <div >

                    {/* Overall header for Today */}

                    <div className="text-text-primary font-bold font-sans text-2xl mb-1 ">{`Today's queue`}</div>
                    <div className="flex flex-row gap-3" >
                    <p className="text-text-secondary text-[14px]">{` ${todayDate} — ${totalItems} items need attention`}</p> 

                        {/* Pending AI Notices header */}

                        <div className="bg-brand-header rounded-full py-1 px-3 inline-flex gap-2 ">
                            <div className="text-brand-accent text-[10px] font-medium ">{`${pendingNotices.length} pending notices` }</div>
                            <div className="w-px h-3 bg-white/50"></div>
                            <div className="text-brand-accent text-[10px] font-medium">{`${gapCases.length} gap alerts`}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center flex-nowrap gap-3 mt-5 mb-3">
                    <div className="text-text-secondary  text-[10px] tracking-wider font-medium text-nowrap">PENDING AI NOTICES </div>
                    <div className="text-pending-text bg-pending-bg rounded-3xl px-1.5 py-0.5 text-[10px]">{pendingNotices.length}</div>
                    <div className="bg-text-muted/30 w-full h-[.90px] text-center "> </div>
                </div>
           
                    {pendingNotices.map((notice: Notice)=>(
                            <NoticeCard key={notice.id} notice={notice}/>
                    )
                    )}    
                {/* Gap alerts header */}

                <div className="flex flex-row items-center flex-nowrap gap-3 mt-5 mb-3">
                    <div className="text-text-secondary  text-[10px] tracking-wider font-medium text-nowrap">GAP ALERTS </div>
                    <div className="text-pending-text bg-pending-bg rounded-3xl px-1.5 py-0.5 text-[10px]">{gapCases.length}</div>
                    <p className="text-urgent-text  text-[10px] tracking-wider font-medium text-nowrap">NO HEARINGS IN 90 DAYS </p>
                    <div className="bg-text-muted/30 w-full h-[.90px] text-center "> </div>
                </div>
                {gapCases.map((gapCase: ExtendedGapCase)=>(
                        <GapCard key={gapCase.id} gapCase={gapCase}/>
                ))}
                
            </div>
        </div>
    )
}

export default TodayQueue;