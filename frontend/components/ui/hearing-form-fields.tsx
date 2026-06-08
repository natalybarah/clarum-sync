const HEARING_TYPES = ["CMC", "OSC", "TRC", "Trial", "Motion", "Other"]

export type HearingForm = {
    hearing_date: string
    hearing_time: string
    hearing_type: string
    hearing_name: string
    court?: string
    department: string
    judge: string
}

type FieldBadge = "ai" | "outlook" | "missing" | null

type HearingFormFieldsProps = {
    form: HearingForm
    onChange: (field: string, value: string) => void
    getBadge?: (field: keyof HearingForm) => FieldBadge,
    showCourt?: boolean
}

const Badge = ({ type }: { type: FieldBadge }) => {
    if (!type) return null
    if (type === "ai") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">AI extracted</span>
    if (type === "outlook") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-confirmed-bg border border-confirmed-border text-confirmed-text">From Outlook</span>
    if (type === "missing") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-urgent-bg border border-urgent-border text-urgent-text">Missing</span>
    return null
}

const HearingFormFields = ({ form, onChange, getBadge, showCourt }: HearingFormFieldsProps) => {
    const badge = (field: keyof HearingForm) => getBadge ? getBadge(field) : null
    
    const labelClasses = "text-[12px] font-medium text-text-primary flex items-center gap-1.5"
    const inputClasses = "w-full h-9 border border-border-default rounded-lg px-3 text-[13px] text-text-primary bg-bg-page outline-none focus:border-text-muted focus:ring-2 focus:ring-text-muted/10 transition-all"
    const missingInputClasses = "w-full h-9 border border-pending-border rounded-lg px-3 text-[13px] text-text-primary bg-pending-bg/30 outline-none focus:border-pending-text focus:ring-2 focus:ring-pending-text/10 transition-all"

    const inputClass = (field: keyof HearingForm) =>
        badge(field) === "missing" ? missingInputClasses : inputClasses

    return (
        <div className="flex flex-col gap-4">


            {/* Hearing details */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-default">
                    Hearing details
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Hearing type <span className="text-urgent-text">*</span>
                            <Badge type={badge("hearing_type")} />
                        </label>
                        <select
                            value={form.hearing_type}
                            onChange={e => onChange("hearing_type", e.target.value)}
                            className={inputClass("hearing_type")}
                        >
                            <option value="">Select type</option>
                            {HEARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Hearing name
                            <Badge type={badge("hearing_name")} />
                        </label>
                        <input
                            type="text"
                            value={form.hearing_name}
                            onChange={e => onChange("hearing_name", e.target.value)}
                            className={inputClasses}
                            placeholder="e.g. Case Management Conference"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Date <span className="text-urgent-text">*</span>
                            <Badge type={badge("hearing_date")} />
                        </label>
                        <input
                            type="date"
                            value={form.hearing_date}
                            onChange={e => onChange("hearing_date", e.target.value)}
                            className={inputClass("hearing_date")}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Time <span className="text-urgent-text">*</span>
                            <Badge type={badge("hearing_time")} />
                        </label>
                        <input
                            type="time"
                            value={form.hearing_time}
                            onChange={e => onChange("hearing_time", e.target.value)}
                            className={inputClass("hearing_time")}
                        />
                    </div>
                </div>
            </div>

            {/* Court  and location */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-default">
                    Court & location
                </p>
                {showCourt !== false && (
                    <div className="flex flex-col gap-1.5 mb-3">
                        <label className={labelClasses}>
                            Court / venue
                            <Badge type={badge("court")} />
                        </label>
                        <input
                            type="text"
                            value={form.court}
                            onChange={e => onChange("court", e.target.value)}
                            className={inputClass("court")}
                            placeholder="e.g. Los Angeles Superior Court"
                        />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Department
                            <Badge type={badge("department")} />
                        </label>
                        <input
                            type="text"
                            value={form.department}
                            onChange={e => onChange("department", e.target.value)}
                            className={inputClass("department")}
                            placeholder="e.g. Dept. 44"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClasses}>
                            Judge
                            <Badge type={badge("judge")} />
                        </label>
                        <input
                            type="text"
                            value={form.judge}
                            onChange={e => onChange("judge", e.target.value)}
                            className={inputClass("judge")}
                            placeholder="e.g. Hon. M. Torres"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HearingFormFields