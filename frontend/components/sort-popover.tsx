'use client'
import { useState } from "react"
import { SortType, SortDirection } from "./sort-table"
import { IconSelector } from "@tabler/icons-react"

type SortPopOverType= {
    label: string,
    sortTypeOptions: SortType,
    currentSort: SortType,
    currentDirection: SortDirection,
    onSort: (field: SortType, direction: SortDirection | null )=>void
}
const SortPopOver=({label, sortTypeOptions, currentSort, currentDirection, onSort}: SortPopOverType)=>{
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const handleBlur=(e)=>{
        if(!e.currentTarget.contains(e.relatedTarget)){
            setIsOpen(false)
        }

    }


    return(
        <div tabIndex={0} onBlur={handleBlur} className="relative inline-flex ">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary hover:text-text-primary"
            >
                {label}
                <IconSelector className="w-3.5 h-3.5 text-text-muted" />
            </button>

            
           {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-bg-card border border-border-default rounded-lg shadow-sm min-w-47 p-1.5 flex flex-col gap-0.5">

                    {sortTypeOptions === "status" && (
                        <>
                            <button onClick={() => onSort("status", "asc")} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full ${currentSort === "status" && currentDirection === "asc" ? "bg-bg-subtle" : ""}`}>
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-0 ${currentSort === "status" && currentDirection === "asc" ? "border-text-primary bg-text-primary" : "border-text-muted"}`}>
                                    {currentSort === "status" && currentDirection === "asc" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-[11.5px] text-text-primary">Urgent first</span>
                            </button>
                            <button onClick={() => onSort("status", "desc")} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full ${currentSort === "status" && currentDirection === "desc" ? "bg-bg-subtle" : ""}`}>
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-0 ${currentSort === "status" && currentDirection === "desc" ? "border-text-primary bg-text-primary" : "border-text-muted"}`}>
                                    {currentSort === "status" && currentDirection === "desc" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-[11.5px] text-text-primary">Confirmed first</span>
                            </button>
                        </>
                    )}

                {sortTypeOptions === "next_hearing" && (
                    <>
                        <button onClick={() => onSort("next_hearing", "asc")} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full ${currentSort === "next_hearing" && currentDirection === "asc" ? "bg-bg-subtle" : ""}`}>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center  ${currentSort === "next_hearing" && currentDirection === "asc" ? "border-text-primary bg-text-primary" : "border-text-muted"}`}>
                                {currentSort === "next_hearing" && currentDirection === "asc" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[11.5px] text-text-primary">Soonest first</span>
                        </button>
                        <button onClick={() => onSort("next_hearing", "desc")} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full ${currentSort === "next_hearing" && currentDirection === "desc" ? "bg-bg-subtle" : ""}`}>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-0 ${currentSort === "next_hearing" && currentDirection === "desc" ? "border-text-primary bg-text-primary" : "border-text-muted"}`}>
                                {currentSort === "next_hearing" && currentDirection === "desc" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[11.5px] text-text-primary">Latest first</span>
                        </button>
                        <button onClick={() => onSort("no_hearing", null)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full">
                            <div className="w-3 h-3 rounded-full border border-text-muted flex-0" />
                            <span className="text-[11.5px] text-text-primary">No hearing first</span>
                        </button>
                    </>
                )}

            
                <div className="h-px bg-border-default my-1 mx-1" />
                <button 
                    onClick={() => onSort(null, null)} 
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-bg-subtle text-left w-full"
                >
                    <div className={`w-3 h-3 rounded-full border flex-0 ${currentSort === null ? "border-text-primary bg-text-primary" : "border-text-muted"}`} />
                    <span className="text-[11.5px] text-text-muted">Default order</span>
                </button>

                </div>
            )}
        </div>

    )
}

export default SortPopOver