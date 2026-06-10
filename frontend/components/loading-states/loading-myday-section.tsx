


const MyDaySectionLoading = ({ cardCount = 3 }: { cardCount?: number }) => {


    return (
        <div className="flex flex-col gap-3">
          
            <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-border-default rounded animate-pulse" />
                <div className="h-5 w-16 bg-border-default rounded-full animate-pulse" />
                <div className="flex-1 h-px bg-border-default" />
            </div>

           
            <div className="flex flex-col gap-2">
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} className="bg-bg-card border border-border-default rounded-2xl px-4 py-3.5 flex flex-row justify-between gap-4 min-h-[80px]">
                        <div className="flex flex-col gap-1.5 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="h-3.5 w-48 bg-border-default rounded animate-pulse" />
                                <div className="h-5 w-14 bg-border-default rounded-full animate-pulse" />
                            </div>
                            <div className="h-3.5 w-64 bg-border-default rounded animate-pulse" />
                            <div className="h-3 w-40 bg-border-default rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 ">
                            <div className="h-6 w-20 bg-border-default rounded-full animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyDaySectionLoading