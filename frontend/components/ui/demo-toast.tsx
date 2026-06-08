'use client'
import { useState } from "react"

const DemoToast = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
    if (!show) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-brand-header text-brand-accent text-[12px] font-medium rounded-full shadow-lg animate-fade-in flex items-center gap-2">
            🔒 Demo mode — this action is disabled for visitors
            <button onClick={onClose} className="text-white/40 hover:text-white/70 ml-2">✕</button>
        </div>
    )
}

export default DemoToast