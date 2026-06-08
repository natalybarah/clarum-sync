export type CaseType = "FEHA" | "PAGA" | "Class" | "Wrongful Termination" | "Retaliation"

const caseTypeStyles: Record<CaseType, { container: string, text: string }> = {
    "FEHA": {
        container: "bg-ai-bg border-ai-border",
        text: "text-ai-text"
    },
    "PAGA": {
        container: " bg-[#FAECE7] border border-[#F0997B]",
        text: "text-[#993C1D]"
    },
    "Class": {
        container: "bg-[#f4eaff] border-[#d4c8f5]",
        text: "text-[#8347b9]"
    },
    "Wrongful Termination": {
        container: "bg-bg-subtle border-border-default",
        text: "text-text-secondary"
    },
    "Retaliation": {
        container: "bg-[#feebe7] border-[#fac7be]",
        text: "text-[#c62a0f]"
    }
}

const CaseTypeBadge = ({ variant }: { variant: CaseType }) => {
    const styles = caseTypeStyles[variant]
    return (
        <div className={`inline-flex items-center border px-2 py-0 rounded-sm ${styles.container}`}>
            <span className={`text-[10px] font-medium ${styles.text}`}>
                {variant}
            </span>
        </div>
    )
}

export default CaseTypeBadge