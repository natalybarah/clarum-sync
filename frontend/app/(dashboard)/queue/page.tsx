import { getGapCases, getNotices } from "@/lib/api";
import { Case, Notice} from "@/lib/types";

const GapCases= async ()=>{
    const gapCases= await getGapCases();
    const pendingNotices= await getNotices();
    return(
        <div>
            <div>
                <h1>section A</h1>
            
                    {pendingNotices.map((notice: Notice)=>(
                        <h2 key={notice.id}>{notice.extracted_name}</h2>
                    )
                    )}    
                <h2>section B</h2>
                {gapCases.map((c: Case)=>(
                    <h1 key={c.id}>{c.name}</h1>
                ))}
                
            </div>
        </div>
    )
}

export default GapCases;