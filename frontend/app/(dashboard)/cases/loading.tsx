import TableLoading from "@/components/loading-states/loading-dashboard"
import SummaryCardLoading from "@/components/loading-states/loading-summary-card"


const Loading = () => {

    return(

    <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-6">
            <SummaryCardLoading />
            <SummaryCardLoading />
            <SummaryCardLoading />
        </div>
        <div className="flex items-center gap-2.5 mb-4">
            {/* Search bar skeleton */}
            <div className="flex-1 h-9 bg-border-default rounded-md animate-pulse" />
            {/* Button skeleton */}
            <div className="h-9 w-32 bg-border-default rounded-md animate-pulse" />
        </div>
        <TableLoading />
    </div>
    )
}

export default Loading