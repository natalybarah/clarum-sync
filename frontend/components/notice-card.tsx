import { formatDate, formatTime} from "@/lib/utils";
import { Notice } from "@/lib/types";

const NoticeCard=({notice}: {notice:Notice})=>{
    return(
        <div className="flex flex-row">
            <div>
                <div className="flex flex-row gap-3">
                    <h3>{notice.cases.name}</h3>
                    <span>{notice.cases.case_type}</span>
                    <span>{notice.confidence}</span>
                </div>
            <p>{`${notice.extracted_name} scheduled for ${formatDate(notice.extracted_date)} · ${formatTime(notice.extracted_time)}`}</p>
            <p>{`Dept. ${notice.extracted_department} · ${notice.court} · ${notice.confidence_reason}`}</p>
            <p>{`Parsed from ${notice.source} · 12 min ago `}</p>
        </div>
         <div className="flex flex-col">
                <p>Confirm</p>
                <p>Edit</p>
                <p>Reject</p>
            </div>
        </div>
    )
}

export default NoticeCard;