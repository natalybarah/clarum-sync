'use client'
import { IconCheck, IconLock, IconX } from "@tabler/icons-react"

type PanelShellProps = {
    onClose: () => void
    onSave: () => void
    children: React.ReactNode
    header: React.ReactNode
}

const PanelShell = ({ onClose, onSave, children, header }: PanelShellProps) => {
    return (
        <>
            <div className="fixed inset-0 bg-text-primary/20 z-40" onClick={onClose} />
            <div className="fixed top-0 right-0 bottom-0 w-[440px] bg-bg-card z-50 flex flex-col border-l border-border-default rounded-l-2xl overflow-hidden">

                {/* Header as prop */}
                <div className="px-5 py-4 border-b border-border-default flex items-start justify-between gap-3 ">
                    {header}
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg border border-border-default bg-bg-subtle flex items-center justify-center hover:bg-bg-page transition-colors "
                    >
                        <IconX className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                </div>

                {/* Body as children */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-border-default flex items-center justify-between gap-3 ">
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
                            onClick={onSave}
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

export default PanelShell