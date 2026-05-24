
import { IconSelector } from "@tabler/icons-react";
import { Case, Notice} from "@/lib/types";
import { formatDate } from "@/lib/utils";

const Dashboard=({cases, notices}: {cases: Case[], notices: Notice[] })=>{

    const thBaseClases= "text-text-tertiary text-[12px] font-medium font-sans text-left"
    const caseNumberWithPendingNotices= notices.map(ntc=>{
            return ntc.extracted_case_number
        })
    
    return(
        <div className="bg-bg-page border-border-default border rounded-2xl">
            <table className=" w-full">
                <thead>
                    <tr>
                        <th className={`${thBaseClases}`}>CASE NAME</th>
                        <th className={`${thBaseClases}`}>LAST HEARING</th>
                       { /*<IconSelector/>*/}
                        <th className={`${thBaseClases}`}>NEXT HEARING</th>
                        <th className={`${thBaseClases}`}>STATUS</th>
                            <th className={`${thBaseClases} flex flex-row text-center`}>ACTION
                                    <IconSelector className="text-text-secondary w-4 h-4"/>       
                            </th>
                    </tr>
                </thead>
                <tbody>
                {cases.map((c: Case)=>(
                    <tr key={c.id}>
                        <td>
                            <div>
                                <div className="flex flex-row gap-2">
                                    <span className="text-text-primary text-[14px] font-bold">{c.name}</span>
                                    <span className="text-[14px] text-text-muted">{c.case_type}</span>
                                </div>
                                <span className="text-[14px] text-text-muted font-light font-mono">{c.case_number}</span>
                            </div>
                        </td>
            
                            <td className={` text-[14px] ${c.last_hearing_date === null ? "italic text-text-muted" : "text-text-secondary"}`}>
                                { formatDate(c.last_hearing_date) ?? "No past history"}
                                <br></br>
                            <span className="text-text-muted text-[14px] font-light">{c.last_hearing_name}</span>
                            </td>
                            
                        
                        <td className={`${c.next_hearing_date === null ? "text-urgent-solid italic" : "text-text-secondary"} text-[14px]`}>{ formatDate(c.next_hearing_date) ?? "No next hearing"}</td>
                        <td>{caseNumberWithPendingNotices.includes(c.case_number) ? "Pending" 
                        : c.next_hearing_date === null ? "Urgent" : "Confirmed"}
                        </td>
                        <td>{caseNumberWithPendingNotices.includes(c.case_number) ? "Review"
                        : c.next_hearing_date === null ? "Verify now" : "View" }</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )

}

export default Dashboard;