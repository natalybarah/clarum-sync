'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { OutlookOnlyEvent } from "@/lib/types"
import PanelShell from "@/components/ui/panel-shell"
import HearingFormFields, { HearingForm } from "@/components/ui/hearing-form-fields"
import { createHearing } from "@/lib/api"
import DemoToast from "./ui/demo-toast"
import { useDemoGuard } from "@/lib/use-demo-guard"

type OutlookManualEntryPanelProps = {
    event: OutlookOnlyEvent
    isOpen: boolean
    onClose: () => void
}

const OutlookManualEntryPanel = ({ event, isOpen, onClose }: OutlookManualEntryPanelProps) => {
    const router = useRouter()
    const { guardAction, showToast, setShowToast } = useDemoGuard()


    const [form, setForm] = useState<HearingForm>({
        hearing_date: event.outlook_date ?? "",
        hearing_time: event.outlook_time ?? "",
        hearing_type: "",
        hearing_name: event.subject ?? "",
        department: "",
        judge: "",
    })

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        
        guardAction(async()=>{
            if(!event.case_id){
                console.log("no case id found for this outlook event")
                return
            }
            await createHearing({
            hearing_date: form.hearing_date,
            hearing_time: form.hearing_time,
            hearing_name: form.hearing_name || undefined,
            hearing_type: form.hearing_type || undefined,
            department: form.department || undefined,
            judge: form.judge || undefined,
            case_id: event.case_id
            })
        
    
            onClose()
            router.refresh()
        })
    }

    const getBadge = (field: keyof HearingForm) => {
        if (field === "hearing_date" || field === "hearing_time" || field === "hearing_name") {
            return form[field] !== "" ? "outlook" : "missing"
        }
        return form[field] !== "" ? null : "missing"
    }

    if (!isOpen) return null

    return (
        <PanelShell
            onClose={onClose}
            onSave={handleSave}
            header={
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-header flex items-center justify-center mt-0.5">
                        <span className="text-[12px] font-semibold text-brand-accent">NB</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-text-primary">Add hearing to Clarum</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-pending-bg border border-pending-border text-pending-text">From Outlook</span>
                        </div>
                        <span className="text-[12px] text-text-muted truncate">{event.subject}</span>
                    </div>
                </div>
            }
        >
            <HearingFormFields
                form={form}
                onChange={handleChange}
                getBadge={getBadge}
                showCourt={false}
            />
         <DemoToast show={showToast} onClose={() => setShowToast(false)} />
        </PanelShell>
    )
}

export default OutlookManualEntryPanel