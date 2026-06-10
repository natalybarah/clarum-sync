
const TableLoading=()=>{


    
    const thBaseClasses= "text-text-tertiary text-[12px] font-medium font-sans text-left px-4 py-4 border-b border-border-default "
    const tdBaseClasses = "px-4 py-2 h-[50px]  border-b border-border-default  animate-pulse"

    return(
        <>
        <table className=" w-full  ">
                <thead>
                    <tr>
                        <th className={thBaseClasses}>CASE NAME</th>
                        <th className={thBaseClasses}>LAST HEARING</th>
                       { /*<IconSelector/>*/}
                        <th className={thBaseClasses}>  NEXT HEARING </th>
                        <th className={thBaseClasses}> STATUS</th>
                        <th className={`${thBaseClasses} `}>ACTION</th>
                    </tr>
                </thead>
              
                   <tbody>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                            <td className={tdBaseClasses}>
                                <div className="h-5 w-[90%] bg-border-default rounded animate-pulse" />
                            </td>
                            <td className={tdBaseClasses}>
                                <div className="h-5 w-[60%] bg-border-default rounded animate-pulse" />
                            </td>
                            <td className={tdBaseClasses}>
                                <div className="h-5 w-[60%] bg-border-default rounded animate-pulse" />
                            </td>
                            <td className={tdBaseClasses}>
                                <div className="h-5 w-[50%] bg-border-default rounded animate-pulse" />
                            </td>
                            <td className={tdBaseClasses}>
                                <div className="h-5 w-[55%] bg-border-default rounded animate-pulse" />
                            </td>
                        </tr>
                    ))}
                </tbody>
                {/*sortCasesByType.map((c: Case)=>{
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
                })*/}
                
            </table>
    </>


    )
}

export default TableLoading;
