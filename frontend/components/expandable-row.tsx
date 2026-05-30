'use client'
import { useState } from "react"
import { Case, Notice } from "@/lib/types"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { QueuePillButton, QueueIconButton } from "./ui/queue-button"
import { formatDate, formatTime } from "@/lib/utils"
import CaseTypeBadge, { CaseType } from "./ui/case-type-badge"
import Badge from "./ui/badge"
import ActionButton from "./ui/action-button"
import { confirmNotice, rejectNotice, verifyCase } from "@/lib/api"
import { useRouter } from "next/navigation"
import ManualEntryPanel from "./manual-entry-panel"

type ExpandableRowProps = {
    c: Case
    pendingNotice: Notice | undefined
    caseVariant: 'confirmed' | 'pending' | 'urgent'
    tdBaseClasses: string
}

const ExpandableRow = ({ c, pendingNotice, caseVariant, tdBaseClasses }: ExpandableRowProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [showPanel, setShowPanel]= useState<boolean>(false)
    const router=useRouter()

    const handleConfirm= async(noticeId:string) =>{
        await confirmNotice(noticeId)
        router.refresh()
    }

    const handleReject= async(noticeId: string) =>{
        await rejectNotice(noticeId)
        router.refresh()
    }

    return (
        <>
            {/* Main row */}
            <tr
                key={c.id}
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer transition-colors duration-100 hover:bg-bg-subtle"
            >
                <td className={tdBaseClasses}>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex flex-row items-center gap-2">
                            {isExpanded
                                ? <IconChevronDown className="w-3.5 h-3.5 text-text-muted flex-0" />
                                : <IconChevronRight className="w-3.5 h-3.5 text-text-muted flex-0" />
                            }
                            <span className="text-text-primary text-[14px] font-medium">{c.name}</span>
                            <CaseTypeBadge variant={c.case_type as CaseType} />
                        </div>
                        <span className="text-[12px] text-text-muted font-mono pl-5">{c.case_number}</span>
                    </div>
                </td>

                <td className={`text-[14px] ${c.last_hearing_date === null ? "italic text-text-muted" : "text-text-secondary"} ${tdBaseClasses}`}>
                    {formatDate(c.last_hearing_date) ?? "No past history"}
                    <br />
                    <span className="text-text-muted text-[12px] font-light">{c.last_hearing_type}</span>
                </td>

                <td className={`${c.next_hearing_date === null ? "text-urgent-solid/60 italic" : "text-text-secondary"} ${tdBaseClasses} text-[14px]`}>
                    {formatDate(c.next_hearing_date) ?? "No next hearing"}
                    <br />
                    <span className="text-text-muted text-[12px] font-light">{c.next_hearing_type}</span>
                </td>

                <td className={tdBaseClasses}>
                    <Badge variant={caseVariant} />
                </td>

                <td className={tdBaseClasses} onClick={(e) => e.stopPropagation()}>
                    <ActionButton variant={caseVariant} />
                </td>
            </tr>

            {/* Expanded panel */}
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="bg-bg-subtle border-b border-border-default px-6 py-4">
                        <div className="grid grid-cols-3 gap-6">

                            {/* Column 1 — Case Details */}
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Case Details</span>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { label: "County", value: c.county },
                                        { label: "Phase", value: c.phase },
                                        { label: "Status", value: c.status },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
                                            <span className="text-[12px] text-text-primary">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/*  AI Notice */}
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                                    {pendingNotice ? "AI Notice Detected · Needs Review" : "AI Notice"}
                                </span>
                                {pendingNotice ? (
                                    <div className="flex flex-col gap-2 bg-bg-card border border-border-default rounded-lg p-3">
                                        {/* Header */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai-bg border border-ai-border text-ai-text tracking-wider">AI EXTRACTED</span>
                                            <span className="text-[11px] font-semibold text-text-primary">Court Notice Parsed</span>
                                        </div>

                                        {/* Source */}
                                        <div className="text-[9.5px] text-text-muted font-mono flex items-center gap-1">
                                            📧 {pendingNotice.source}
                                            <span className="text-border-default">·</span>
                                            gpt-4o-mini
                                        </div>

                                        {/* Extracted info */}
                                        <div className="bg-bg-subtle border-l-[3px] border-pending-solid rounded-r-md px-3 py-2">
                                            <div className="text-[12.5px] font-semibold text-text-primary">
                                                {pendingNotice.extracted_name} · {formatDate(pendingNotice.extracted_date)} · {formatTime(pendingNotice.extracted_time)}
                                            </div>
                                            <div className="text-[10.5px] text-text-secondary mt-0.5">
                                                {pendingNotice.extracted_department && `Dept. ${pendingNotice.extracted_department}`}
                                            </div>
                                        </div>

                                        {/* Confidence */}
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${pendingNotice.confidence === "MEDIUM" ? "bg-pending-bg border-pending-border text-pending-text" : "bg-urgent-bg border-urgent-border text-urgent-text"}`}>
                                                {pendingNotice.confidence} confidence
                                            </span>
                                            <span className="text-[10px] text-text-muted italic">{pendingNotice.confidence_reason}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1">
                                            {pendingNotice.confidence === "MEDIUM" ? (
                                                <>
                                                    <QueuePillButton variant="confirm" onClick={() => handleConfirm(pendingNotice.id)} />
                                                    <QueueIconButton variant="edit" onClick={() => {}} />
                                                    <QueueIconButton variant="reject" onClick={() => handleReject(pendingNotice.id)}/>
                                                </>
                                            ) : (
                                                <>
                                                    <QueuePillButton variant="manual" onClick={() => setShowPanel(true)} />
                                                    <QueueIconButton variant="reject" onClick={() => handleReject(pendingNotice.id)} />
                                                </>
                                            )}
                                            {showPanel && pendingNotice && (
                                                <ManualEntryPanel
                                                    notice={pendingNotice}
                                                    isOpen={showPanel}
                                                    onClose={()=> setShowPanel(false)}
                                                />
                                            )}     
                                            
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-text-muted italic">No pending notices</span>
                                )}
                            </div>

                            {/* Column 3 — Audit Trail placeholder */}
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Audit Trail</span>
                                <span className="text-[12px] text-text-muted italic">Coming soon</span>
                            </div>

                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

export default ExpandableRow