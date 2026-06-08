'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Notice } from "@/lib/types"
import { confirmNotice } from "@/lib/api"
import PanelShell from "@/components/ui/panel-shell"
import HearingFormFields, { HearingForm } from "@/components/ui/hearing-form-fields"
import { useDemoGuard } from "@/lib/use-demo-guard"
import DemoToast from "./ui/demo-toast"

type ManualEntryPanelProps = {
    notice: Notice
    isOpen: boolean
    onClose: () => void
}

const ManualEntryPanel = ({ notice, isOpen, onClose }: ManualEntryPanelProps) => {
    const router = useRouter()
    const { guardAction, showToast, setShowToast } = useDemoGuard()

    const [form, setForm] = useState<HearingForm>({
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
        guardAction(async ()=>{
            await confirmNotice(notice.id, {
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
        })
    }

    // Determine badge per field
    const getBadge = (field: keyof HearingForm) => {
        if (form[field] !== "") return "ai"
        return "missing"
    }

    if (!isOpen) return null

    return (
        <PanelShell
            onClose={onClose}
            onSave={handleSave}
            header={
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-header flex items-center justify-center  mt-0.5">
                        <span className="text-[12px] font-semibold text-brand-accent">NB</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-text-primary">Manual hearing entry</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">{notice.confidence} confidence</span>
                        </div>
                        <span className="text-[12px] text-text-muted">{notice.cases.name} · Notice {notice.id.slice(0, 8)}…</span>
                    </div>
                </div>
            }
        >
            {/* Warning banner */}
            <div className="mb-4 px-3 py-2.5 bg-pending-bg border border-pending-border rounded-xl flex gap-2.5 items-start">
                <IconAlertTriangle className="w-4 h-4 text-pending-text  mt-0.5" />
                <p className="text-[12px] text-pending-text leading-relaxed">
                    <span className="font-semibold">AI extracted a partial notice.</span> Review all pre-filled fields and complete the missing ones before saving.
                </p>
            </div>

            {/* Form fields */}
            <HearingFormFields
                form={form}
                onChange={handleChange}
                getBadge={getBadge}
            />

            {/* Source info */}
            <div className="mt-4">
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
            <DemoToast show={showToast} onClose={() => setShowToast(false)} />
        </PanelShell>
    )
}

export default ManualEntryPanel;