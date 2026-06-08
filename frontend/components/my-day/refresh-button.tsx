'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconRefresh } from "@tabler/icons-react"

const RefreshButton = () => {
    const [loading, setLoading] = useState(false)
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
    const router = useRouter()

    const handleRefresh = () => {
        setLoading(true)
        router.refresh()
        setTimeout(() => {
            setLoading(false)
            setLastRefreshed(new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }))
        }, 1500)
    }

    return (
        <div className="flex items-center gap-2">
            {lastRefreshed && (
                <span className="text-[11px] text-text-muted">
                    Updated {lastRefreshed}
                </span>
            )}
            <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary transition-colors duration-150 disabled:opacity-50"
            >
                <IconRefresh className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh"}
            </button>
        </div>
    )
}

export default RefreshButton