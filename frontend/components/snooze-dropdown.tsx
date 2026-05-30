'use client'
import { IconAlarmSnooze } from "@tabler/icons-react";
import { useState } from "react";
import SnoozeDaysButton from "./ui/snoozeDaysButton";

const SnoozeDropdown= ({caseId}: {caseId: string })=> {
    const [isOpen, setIsOpen]= useState<boolean>(false);
   
    const handleBlur=(e: React.FocusEvent<HTMLDivElement>)=>{
        if(!e.currentTarget.contains(e.relatedTarget)){
        setIsOpen(false)
        }
    }   

    return(


        <div tabIndex={0} onBlur={handleBlur} className="relative">
            <button onClick={()=> setIsOpen(!isOpen)} className="w-9 h-9 rounded-full border border-border-default bg-bg-card flex items-center justify-center
            transition-all duration-150 hover:bg-bg-subtle hover:border-text-muted hover:scale-105 active:scale-95 group ">
                <IconAlarmSnooze className="w-4 h-4 text-text-muted transition-colors duration-150 group-hover:text-text-primary"/>
            </button>
            {
                isOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-bg-card border border-border-default rounded-xl shadow-sm min-w-40 p-1.5 flex flex-col gap-0.5">
            
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted px-2.5 py-1.5">
                            Snooze alert for
                        </span>

                        <div className="h-px bg-border-default mx-1 mb-0.5" />
                        <SnoozeDaysButton label={30}  caseId={caseId} />
                        <SnoozeDaysButton label={60}  caseId={caseId}/>
                        <SnoozeDaysButton label={90}  caseId={caseId}/>
                        <SnoozeDaysButton label={180}  caseId={caseId}/>
                        
                    </div>
                )
            }
        </div>
    )
}

export default SnoozeDropdown;
