const MyDayHeaderLoading = () => {


    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between">
                <div>
                   
                    <div className="flex items-baseline gap-5 mb-5">
                        <div className="h-12 w-52 bg-border-default rounded animate-pulse" />
                        <div className="h-7 w-36 bg-border-default rounded animate-pulse" />
                    </div>
                   
                    <div className="h-4 w-80 bg-border-default rounded animate-pulse mt-1" />
                 
                </div>

           
                <div className="flex items-stretch gap-3 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-border-default rounded-xl px-4 py-3 flex items-center gap-3 w-40">
                            <div className="w-9 h-9 rounded-lg bg-border-default animate-pulse " />
                            <div className="flex flex-col gap-1.5">
                                <div className="h-6 w-8 bg-border-default rounded animate-pulse" />
                                <div className="h-3 w-20 bg-border-default rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyDayHeaderLoading