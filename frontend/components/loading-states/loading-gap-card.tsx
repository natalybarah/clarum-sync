const GapCardLoading = () => {

    return (
        <div className="bg-bg-card border border-border-default rounded-2xl px-4 py-3.5 flex flex-row justify-between gap-4 mb-2 min-h-[80px]">
            <div className="flex flex-col gap-1.5 justify-center">
              
              
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-56 bg-border-default rounded animate-pulse" />
                    <div className="h-5 w-16 bg-border-default rounded-full animate-pulse" />
                </div>
                
                
                <div className="h-3.25 w-72 bg-border-default rounded animate-pulse" />
             
             
                <div className="h-[11px] w-48 bg-border-default rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-8 w-28 bg-border-default rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-border-default rounded-full animate-pulse" />
            </div>
        </div>
    )
}

export default GapCardLoading