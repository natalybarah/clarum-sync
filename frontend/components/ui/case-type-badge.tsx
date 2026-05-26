

/*

.cb-class{background:var(--purple-3);color:var(--purple-11);border:1px solid var(--purple-6);}
.cb-paga {background:var(--amber-3); color:var(--amber-11); border:1px solid var(--amber-6);}
.cb-feha {background:var(--sky-3);   color:var(--sky-11);   border:1px solid var(--sky-6);}
.cb-ret  {background:var(--tomato-3);color:var(--tomato-11);border:1px solid var(--tomato-6);}
.cb-wt   {background:var(--s3);      color:var(--s11);      border:1px solid var(--s6);}

.cb-class{background:var(--purple-3);color:var(--purple-11);border:1px solid var(--purple-6);}
.cb-paga {background:var(--amber-3); color:var(--amber-11); border:1px solid var(--amber-6);}
.cb-feha {background:var(--sky-3);   color:var(--sky-11);   border:1px solid var(--sky-6);}
.cb-ret  {background:var(--tomato-3);color:var(--tomato-11);border:1px solid var(--tomato-6);}
.cb-wt   {background:var(--s3);      color:var(--s11);      border:1px solid var(--s6);}

  /* ── AI Extracted / Info (Sky) ── */


export type CaseType = "FEHA" | "PAGA" | "Class" | "Wrongful Termination" | "Retaliation"

const caseTypeStyles: Record<CaseType, { container: string, text: string }> = {
    "FEHA": {
        container: "bg-ai-bg border-ai-border",
        text: "text-ai-text"
    },
    "PAGA": {
        container: "bg-pending-bg border-pending-border",
        text: "text-pending-text"
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