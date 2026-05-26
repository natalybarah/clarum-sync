
type ActionVariant = 'confirmed' | 'pending' | 'urgent'


const actionStyles: Record<ActionVariant, { message: string, className: string }> = {
    confirmed: {
        message: "View",
        className: "text-text-secondary text-[13px] hover:text-text-primary flex items-center gap-1"
    },
    pending: {
        message: "Review",
        className: "text-pending-text text-[13px] hover:opacity-80 flex items-center gap-1"
    },
    urgent: {
        message: "Verify now",
        className: "text-urgent-text text-[13px] hover:opacity-80 flex items-center gap-1"
    }
}

const ActionButton = ({ variant }: { variant: ActionVariant }) => {
    const styles = actionStyles[variant]
    return (
        <button className={styles.className}>
            {styles.message}
            <span>→</span>
        </button>
    )
}

export default ActionButton;