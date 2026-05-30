'use client'
import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { Case, Notice } from "@/lib/types"
import CaseTypeBadge from "./ui/case-type-badge"
import ActionButton from "./ui/action-button"
import ExpandableRow from "./expandable-row"
import Badge from "./ui/badge"
import SortPopOver from "./sort-popover"

export type SortType= 'status' | 'next_hearing' | 'no_hearing' | null
export type SortDirection= 'desc' | 'asc' | 'pending' | null
//NEED TO ADD CASE FOR PENDING
const SortTable=({cases, notices}: {cases: Case[], notices: Notice[]})=>{

    const [sortType, setSortType]= useState<SortType>(null)
    const [sortDirection, setSortDirection] =useState<SortDirection>(null)

    const caseNumberWithPendingNotices= notices.map(ntc=> ntc.extracted_case_number)

    const getCaseStatus=(c: Case)=>{
        if (caseNumberWithPendingNotices.includes(c.case_number)) return "pending"
        if (c.next_hearing_date === null) return "urgent"
        else return "confirmed"
    }

    const sortCasesByType=[...cases].sort((a, b)=>{
        if (sortType === "status"){
            if(!sortDirection) return 0
            
            const statusOrder={urgent: 0, pending: 1, confirmed: 2}
            const statusA= statusOrder[getCaseStatus(a)];
            const statusB= statusOrder[getCaseStatus(b)];
            /*

            */

            if(sortDirection === "asc") return statusA - statusB
          
            return statusB - statusA
        }
        if (sortType === "next_hearing"){
            if(!a.next_hearing_date) return 1
            if(!b.next_hearing_date) return -1 
            const dateA= Date.parse(a.next_hearing_date)
            const dateB= Date.parse(b.next_hearing_date) 

            if(sortDirection === "asc") return dateA - dateB
            return dateB - dateA
        }

        if(sortType === "no_hearing"){
            if (!a.next_hearing_date && b.next_hearing_date ) return -1
            if (a.next_hearing_date && !b.next_hearing_date) return 1
            return 0
        }

        
        return 0
    })
    
    const thBaseClasses= "text-text-tertiary text-[12px] font-medium font-sans text-left px-4 py-4 border-b border-border-default "
    const tdBaseClasses = "px-4 py-2 border-b border-border-default "

    return(
        <>
        <table className=" w-full  ">
                <thead>
                    <tr>
                        <th className={thBaseClasses}>CASE NAME</th>
                        <th className={thBaseClasses}>LAST HEARING</th>
                       { /*<IconSelector/>*/}
                        <th className={thBaseClasses}>
                            <SortPopOver
                                label="NEXT HEARING"
                                sortTypeOptions="next_hearing"
                                currentSort={sortType}
                                currentDirection={sortDirection}
                                onSort={(field, direction)=>{
                                    setSortType(field)
                                    setSortDirection(direction)
                                }}
                            />

                        </th>
                        <th className={thBaseClasses}>
                            <SortPopOver
                                label="STATUS"
                                sortTypeOptions="status"
                                currentSort={sortType}
                                currentDirection={sortDirection}
                                onSort={(field, direction) => {
                                    setSortType(field)
                                    setSortDirection(direction)
                                }}
                            />  
                        </th>
                        <th className={`${thBaseClasses} `}>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                {sortCasesByType.map((c: Case)=>{
                   const pendingNotice = notices.find(n => n.extracted_case_number === c.case_number)
                    const caseVariant = pendingNotice ? "pending" : c.next_hearing_date === null ? "urgent" : "confirmed"
                
                return (
                    <ExpandableRow
                        key={c.id}
                        c={c}
                        pendingNotice={pendingNotice}
                        caseVariant={caseVariant}
                        tdBaseClasses={tdBaseClasses}
                    />
                )
                })}
                </tbody>
            </table>
    </>


    )
}

export default SortTable;
