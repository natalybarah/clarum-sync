const NoticeCardLoading = () => {

    return (
        <div className="bg-bg-card border border-border-default rounded-2xl px-4 py-3.5 flex flex-row justify-between gap-4 mb-2 min-h-[95px]">
            <div className="flex-1 flex flex-col gap-1.5 justify-center">
               
               
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-52 bg-border-default rounded animate-pulse" />
                    <div className="h-5 w-16 bg-border-default rounded-full animate-pulse" />
                    <div className="h-5 w-12 bg-border-default rounded-full animate-pulse" />
                </div>
             
             
                <div className="h-3.25 w-64 bg-border-default rounded animate-pulse" />
              
              
                <div className="h-3.25 w-80 bg-border-default rounded animate-pulse" />
              
              
                <div className="h-2.75 w-32 bg-border-default rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 ">
                <div className="h-8 w-20 bg-border-default rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-border-default rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-border-default rounded-full animate-pulse" />
            </div>
        </div>
    )
}


export default NoticeCardLoading