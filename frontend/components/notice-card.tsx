'use client'
import { QueueIconButton, QueuePillButton } from "./ui/queue-button";
import { Notice } from "@/lib/types";
import { CaseType } from "./ui/case-type-badge";
import CaseTypeBadge from "./ui/case-type-badge";
import { formatDate, formatTime } from "@/lib/utils";
import { confirmNotice, rejectNotice, verifyCase } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ManualEntryPanel from "./manual-entry-panel";

type ConfidenceVariant = "MEDIUM" | "LOW"

const confidenceStyles: Record<ConfidenceVariant, string>={
    MEDIUM: "bg-pending-bg border-pending-border text-pending-text",
    LOW: "bg-urgent-bg border-urgent-border text-urgent-text"
}



const NoticeCard= ({notice}: {notice: Notice})=>{
    const [showPanel, setShowPanel] = useState<boolean>(false)

    const router= useRouter()
    const handleConfirm= async()=>{
        await confirmNotice(notice.id);
        router.refresh()
    }

    const handleReject= async()=>{
        await rejectNotice(notice.id);
        router.refresh()
    }
    const confidence= notice.confidence as ConfidenceVariant

    return(
        <div className="bg-bg-card border-border-default border rounded-2xl
        px-4 py-3.5 flex gap-4 mb-2">
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-text-primary">
                        {notice.cases.name}
                    </span>
                    <CaseTypeBadge variant={notice.cases.case_type as CaseType}/>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceStyles[confidence]}`}>
                        {confidence}
                    </span>
                </div>
                <div className="text-[13px] font-semibold text-text-primary">
                    {notice.extracted_name} · {formatDate(notice.extracted_date)} · {formatTime(notice.extracted_time)}
                </div>
                <div className="text-[13px] text-text-secondary"> 
                    {notice.extracted_case_number && `${notice.extracted_case_number} · `}
                    {notice.extracted_department && `Dept. ${notice.extracted_department} · `}
                    <em className="italic text-pending-text">{notice.confidence_reason}</em>
                </div>

                <div className="text-[11px] text-text-muted font-mono">
                    Parsed from {notice.source}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-0">
            {confidence === "MEDIUM" ? (
                <>
                    <QueuePillButton variant="confirm" onClick={handleConfirm}/>
                    <QueueIconButton variant="edit" onClick={() => setShowPanel(true)}/>
                    <QueueIconButton variant="reject" onClick={handleReject}/>
                </>
            ) : (
                <>
                    <QueuePillButton variant="manual" onClick={() => setShowPanel(true)}/>
                    <QueueIconButton variant="reject" onClick={handleReject}/>
                </>
            )}
        </div>

       
        {showPanel && (
            <ManualEntryPanel
                notice={notice}
                isOpen={showPanel}
                onClose={() => setShowPanel(false)}
            />
        )}
        </div>
    )
}

export default NoticeCard;
