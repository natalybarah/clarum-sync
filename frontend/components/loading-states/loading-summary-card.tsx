const SummaryCardLoading = () => {
    return (
        <div className="w-full flex flex-row gap-4 border border-border-default p-4 rounded-3xl">
            
            <div className="flex flex-row items-start">
                <div className="w-12 h-12 rounded-xl bg-border-default animate-pulse" />
            </div>
           
            <div className="flex flex-col gap-1 items-start">
                <div className="h-8 w-10 bg-border-default rounded animate-pulse" />
                <div className="h-3.5 w-24 bg-border-default rounded animate-pulse mt-1" />
                <div className="h-3 w-40 bg-border-default rounded animate-pulse mt-0.5" />
            </div>
        </div>
    )
}

export default SummaryCardLoading