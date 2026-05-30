'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconX, IconEdit, IconAlertTriangle, IconCheck, IconLock } from "@tabler/icons-react"
import { Notice } from "@/lib/types"
import { confirmNotice } from "@/lib/api"

type ManualEntryPanelProps = {
    notice: Notice
    isOpen: boolean
    onClose: () => void
}

const HEARING_TYPES = ["CMC", "OSC", "TRC", "Trial", "Motion", "Other"]

const ManualEntryPanel = ({ notice, isOpen, onClose }: ManualEntryPanelProps) => {
    const router = useRouter()

    const [form, setForm] = useState({
        hearing_date: notice.extracted_date ?? "",
        hearing_time: notice.extracted_time ?? "",
        hearing_type: notice.extracted_type ?? "",
        hearing_name: notice.extracted_name ?? "",
        court: "",
        department: notice.extracted_department ?? "",
        judge: notice.extracted_judge ?? "",
    })

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        await confirmNotice(notice.id,{
            hearing_date: form.hearing_date || undefined,
            hearing_time: form.hearing_time || undefined,
            hearing_name: form.hearing_name || undefined,
            hearing_type: form.hearing_type || undefined,
            department: form.department || undefined,
            judge: form.judge || undefined,
            court: form.court || undefined,
        })
        onClose()
        router.refresh()
    }

    if (!isOpen) return null

    const isAiExtracted = (value: string) => value !== ""
    const isMissing = (value: string) => value === ""

    const labelClasses = "text-[12px] font-medium text-text-primary flex items-center gap-1.5"
    const inputClasses = "w-full h-9 border border-border-default rounded-lg px-3 text-[13px] text-text-primary bg-bg-page outline-none focus:border-text-muted focus:ring-2 focus:ring-text-muted/10 transition-all"
    const missingInputClasses = "w-full h-9 border border-pending-border rounded-lg px-3 text-[13px] text-text-primary bg-pending-bg/30 outline-none focus:border-pending-text focus:ring-2 focus:ring-pending-text/10 transition-all"

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-text-primary/20 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-140 bg-bg-card z-50 flex flex-col border-l border-border-default rounded-l-2xl overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-border-default flex items-start justify-between gap-3 flex-shrink-0">
                    <div className="flex items-start gap-3">
                        {/* User avatar */}
                        <div className="w-9 h-9 rounded-full bg-brand-header flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[12px] font-semibold text-brand-accent">NB</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] font-semibold text-text-primary">Manual hearing entry</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">LOW confidence</span>
                            </div>
                            <span className="text-[12px] text-text-muted">{notice.cases.name} · Notice {notice.id.slice(0, 8)}…</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg border border-border-default bg-bg-subtle flex items-center justify-center hover:bg-bg-page transition-colors "
                    >
                        <IconX className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                </div>

                {/* Warning banner */}
                <div className="mx-5 mt-4 px-3 py-2.5 bg-pending-bg border border-pending-border rounded-xl flex gap-2.5 items-start ">
                    <IconAlertTriangle className="w-4 h-4 text-pending-text flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-pending-text leading-relaxed">
                        <span className="font-semibold">AI extracted a partial notice.</span> Review all pre-filled fields and complete the missing ones before saving.
                    </p>
                </div>

                {/* Confidence row */}
                <div className="mx-5 mt-3 px-3 py-2 bg-bg-subtle border border-border-default rounded-xl flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-urgent-bg border-urgent-border text-urgent-text">LOW</span>
                    <span className="text-[11px] text-text-secondary flex-1">{notice.confidence_reason}</span>
                    <span className="text-[10px] text-text-muted font-mono">{notice.id.slice(0, 8)}…</span>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

                    {/* Section — Hearing details */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-default">Hearing details</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Hearing type <span className="text-urgent-text">*</span>
                                    {isMissing(form.hearing_type) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">Missing</span>}
                                </label>
                                <select
                                    value={form.hearing_type}
                                    onChange={e => handleChange("hearing_type", e.target.value)}
                                    className={isMissing(form.hearing_type) ? missingInputClasses : inputClasses}
                                >
                                    <option value="">Select type</option>
                                    {HEARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {isMissing(form.hearing_type) && (
                                    <span className="text-[10px] text-urgent-text">Required · not extracted</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Hearing name
                                    {isAiExtracted(form.hearing_name) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>}
                                </label>
                                <input
                                    type="text"
                                    value={form.hearing_name}
                                    onChange={e => handleChange("hearing_name", e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g. Case Management Conference"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Date <span className="text-urgent-text">*</span>
                                    {isAiExtracted(form.hearing_date) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>}
                                </label>
                                <input
                                    type="date"
                                    value={form.hearing_date}
                                    onChange={e => handleChange("hearing_date", e.target.value)}
                                    className={isMissing(form.hearing_date) ? missingInputClasses : inputClasses}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Time <span className="text-urgent-text">*</span>
                                    {isAiExtracted(form.hearing_time) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>}
                                </label>
                                <input
                                    type="time"
                                    value={form.hearing_time}
                                    onChange={e => handleChange("hearing_time", e.target.value)}
                                    className={isMissing(form.hearing_time) ? missingInputClasses : inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section — Court & location */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-default">Court & location</p>
                        <div className="flex flex-col gap-1.5 mb-3">
                            <label className={labelClasses}>
                                Court / venue <span className="text-urgent-text">*</span>
                                {isMissing(form.court) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">Missing</span>}
                            </label>
                            <input
                                type="text"
                                value={form.court}
                                onChange={e => handleChange("court", e.target.value)}
                                className={isMissing(form.court) ? missingInputClasses : inputClasses}
                                placeholder="e.g. Los Angeles Superior Court"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Department
                                    {isMissing(form.department) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">Missing</span>}
                                    {isAiExtracted(form.department) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>}
                                </label>
                                <input
                                    type="text"
                                    value={form.department}
                                    onChange={e => handleChange("department", e.target.value)}
                                    className={isMissing(form.department) ? missingInputClasses : inputClasses}
                                    placeholder="e.g. Dept. 44"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>
                                    Judge
                                    {isMissing(form.judge) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">Missing</span>}
                                    {isAiExtracted(form.judge) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>}
                                </label>
                                <input
                                    type="text"
                                    value={form.judge}
                                    onChange={e => handleChange("judge", e.target.value)}
                                    className={isMissing(form.judge) ? missingInputClasses : inputClasses}
                                    placeholder="e.g. Hon. M. Torres"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section — Source */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-default">AI notice source</p>
                        <div className="bg-bg-subtle border border-border-default rounded-xl p-3 flex flex-col gap-1.5">
                            {[
                                { label: "Source", value: notice.source },
                                { label: "Case number", value: notice.extracted_case_number },
                                { label: "Notice ID", value: notice.id.slice(0, 8) + "…" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-[11px] text-text-muted">{label}</span>
                                    <span className="text-[11px] text-text-secondary font-mono">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-border-default flex items-center justify-between gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <IconLock className="w-3 h-3" />
                        Saved to audit log as manual entry
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-border-default text-[12px] text-text-secondary hover:bg-bg-subtle transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-brand-header text-brand-accent text-[12px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                        >
                            Save hearing
                            <IconCheck className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ManualEntryPanel