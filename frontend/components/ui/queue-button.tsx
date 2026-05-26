import { IconPencil, IconX, IconCheck, TablerIcon } from "@tabler/icons-react"
type QueueButtonVariant= 'confirm' | 'manual' | 'verify'
type QueueIconVariant= 'verify' | 'edit' | 'reject'
type IconButton= TablerIcon

const buttonStyles: Record<QueueButtonVariant, string>={
    confirm: "bg-confirmed-text text-text-on-dark-primary",
    manual: "bg-pending-text text-text-on-dark-primary",
    verify: "bg-urgent-text text-text-on-dark-primary"
}

const buttonMessages: Record<QueueButtonVariant, string>={
    confirm: "Confirm",
    manual: "Manual entry",
    verify: "Verify now"
}

const buttonIcons: Record<QueueButtonVariant, IconButton | null>= {
    confirm: IconCheck,
    manual: IconPencil,
    verify: null
}

const iconTinyButtons: Record<QueueIconVariant, IconButton>={
    edit: IconPencil,
    reject: IconX,
    verify: IconCheck
}

export const QueuePillButton=({variant, onClick}:{
    variant: QueueButtonVariant,
    onClick: ()=> void
})=>{
    const Icon= buttonIcons[variant]
    return(
        <button onClick={onClick} className={`text-[12px] font-medium px-4 py-1.5 rounded-full flex items-center
        gap-1.5 whitespace-nowrap hover:opacity-85 cursor-pointer ${buttonStyles[variant]}`}>
            {Icon && <Icon className= "w-3.5 h-3.5"/>}
            {buttonMessages[variant]}
        </button>
    )
}

export const QueueIconButton=({variant, onClick}:{
    variant: QueueIconVariant,
    onClick: ()=> void

})=>{
    const Icon= iconTinyButtons[variant]
    return(
        <button onClick={onClick} title={variant} className="w-8 h-8 rounded-full border border-border-default bg-bg-card 
        flex items-center justify-center cursor-pointer text-text-muted hover:bg-bg-subtle ">
            <Icon className="w-4 h-4 text-text-muted" />
        </button>
    )
}
