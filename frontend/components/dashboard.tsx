

import { Case, Notice} from "@/lib/types";
import SortTable from "./sort-table";
import Pagination from "./pagination";

const Dashboard=({cases, notices, currentPage, totalPages}: {
    cases: Case[], 
    notices: Notice[],
    currentPage: number,
    totalPages: number,

 })=>{


    return(
        <>
            <div className="bg-bg-page border-border-default border rounded-2xl margin-t-0">
            <SortTable cases={cases} notices={notices} />
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages}/>
        </>
    )

}

export default Dashboard;