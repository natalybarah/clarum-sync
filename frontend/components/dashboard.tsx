
//import { IconSelector } from "@tabler/icons-react";
import { Case } from "@/lib/types";


const Dashboard=({cases}: {cases: Case[]})=>{


    const formatDate=(dateStr: string | null | undefined)=>{
        if(!dateStr) return null;
        const timestamp= Date.parse(dateStr)
        if (!timestamp || !isFinite(timestamp)) return null;
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }
/*


*/
    
 

    

    return(
        <div>
            <table>
                <thead>
                    <tr>
                        <th>CASE NAME</th>
                        <th>LAST HEARING</th>
                       { /*<IconSelector/>*/}
                        <th>NEXT HEARING</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                {cases.map((c: Case)=>(
                    <tr key={c.id}>
                        <td>{c.name}</td>
                        
                        <td>{ c.last_hearing_date ?? "no past history"}</td>
                        <td>{ c.next_hearing_date ?? "No next hearing"}</td>
                        <td>urgent</td>
                        <td>Verify now</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )

}

export default Dashboard;