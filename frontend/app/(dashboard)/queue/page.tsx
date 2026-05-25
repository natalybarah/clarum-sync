export const dynamic = 'force-dynamic'
import { getGapCases, getNotices } from "@/lib/api";
import { Case, Notice, Hearing} from "@/lib/types";
import NoticeCard from "@/components/notice-card";
import GapCard from "@/components/gap-card";
type ExtendedGapCase = Case & {
    confidence: string,
    hearings: Hearing[]

}
const GapCases= async ()=>{
    const gapCases= await getGapCases();
    const pendingNotices= await getNotices();
    console.log(gapCases, "GAP CASES")
    return(
        <div>
            <div>
                <h1>section A</h1>
            
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

export default GapCases;