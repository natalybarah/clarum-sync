import NoticeCardLoading from "@/components/loading-states/loading-notice-card"
import GapCardLoading from "@/components/loading-states/loading-gap-card"

const Loading = () => {
    return (
        <div>
            <div className="h-8 w-20 bg-border-default rounded-lg animate-pulse mb-4" />
            <div className="h-7 w-36 bg-border-default rounded animate-pulse mb-1" />
            <div className="flex flex-row gap-3 mb-5">
                <div className="h-4 w-64 bg-border-default rounded animate-pulse" />
                <div className="h-5 w-40 bg-border-default rounded-full animate-pulse" />
            </div>

    
            <div className="flex flex-row items-center gap-3 mt-5 mb-3">
                <div className="h-3 w-36 bg-border-default rounded animate-pulse" />
                <div className="h-5 w-6 bg-border-default rounded-full animate-pulse" />
                <div className="bg-text-muted/30 w-full h-[.90px]" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <NoticeCardLoading key={i} />
            ))}

        
            <div className="flex flex-row items-center gap-3 mt-5 mb-3">
                <div className="h-3 w-24 bg-border-default rounded animate-pulse" />
                <div className="h-5 w-6 bg-border-default rounded-full animate-pulse" />
                <div className="bg-text-muted/30 w-full h-[.90px]" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
                <GapCardLoading key={i} />
            ))}
        </div>
    )
}

export default Loading