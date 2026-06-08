'use client'
import { useState } from "react"

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export const useDemoGuard = () => {
    const [showToast, setShowToast] = useState(false)

    const guardAction = (realAction: () => void) => {
        if (isDemoMode) {
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2500)
            return
        }
        realAction()
    }

    return { guardAction, showToast, setShowToast }
}