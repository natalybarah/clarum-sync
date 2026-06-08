'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { processEmails } from "@/lib/api"
import { IconRefresh } from "@tabler/icons-react"

const SyncEmailsButton = () => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const router = useRouter()

    const handleSync = async () => {
        setLoading(true)
        setMessage("")
        try {
            const result = await processEmails()
            if (result.error) {
                setMessage(result.error)
            } else {
                setMessage(`Processed ${result.processed} new. skipped ${result.skipped_duplicates} duplicates`)
                router.refresh()
            }
        } catch (err) {
            setMessage("Failed to sync emails")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ai-text text-brand-accent text-[12px] font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
                <IconRefresh className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Syncing..." : "Sync emails now"}

            </button>
            {message && (
                <span className="text-[12px] text-text-muted">{message}</span>
            )}
        </div>
    )
}

export default SyncEmailsButton