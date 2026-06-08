'use cient'

import { OutlookOnlyEvent } from "@/lib/types"
import { IconQuestionMark } from "@tabler/icons-react"
import { parseTime } from "@/lib/utils"
import OutlookManualEntryPanel from "../outlook-manual-entry-panel"
import { useState } from "react"


const OutlookOnlyCard = ({ event }: { event: OutlookOnlyEvent }) => {
    const [showPanel, setShowPanel] = useState<boolean>(false)
    const { hours, ampm } = parseTime(event.outlook_time)
 

    return (
        <div className="bg-bg-card border border-border-default border-l-[3px] border-l-pending-solid rounded-xl overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_auto] items-center px-4 py-3 gap-0">

                {/* Time column */}
                <div className="flex flex-col items-start pr-4 ">
                    <span className="text-[20px] font-semibold leading-none tracking-tight tabular-nums text-text-primary">
                        {hours}
                    </span>
                    <span className="text-[10px] font-medium text-text-muted mt-0.5 tracking-wide">
                        {ampm}
                    </span>
                </div>

                {/* Info column */}
                <div className="flex flex-col gap-1 pl-4 border-l border-border-default">
                    <span className="text-[13px] font-medium text-text-primary">
                        {event.subject}
                    </span>
                    <span className="text-[11px] text-text-muted italic">
                        Found in Outlook · not tracked in Clarum
                    </span>
                </div>

                {/* Right column */}
                <div className="flex items-center gap-2 pl-4 ">
                    <div className="inline-flex flex-row gap-1 items-center rounded-full border px-2.5 py-0.5 bg-pending-bg border-pending-border">
                        <IconQuestionMark className="w-3 h-3 text-pending-text" />
                        <span className="text-[10px] font-semibold text-pending-text">
                            In Outlook only
                        </span>
                    </div>
                    <button

                        onClick={() => {setShowPanel(!showPanel)}}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-brand-header text-brand-accent hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                    >
                        Add to Clarum →
                    </button>
                    {showPanel && (
                      <OutlookManualEntryPanel event={event} isOpen={showPanel} onClose={()=>setShowPanel(false)} />
                    )}
                </div>

            </div>
        </div>
    )
}

export default OutlookOnlyCard