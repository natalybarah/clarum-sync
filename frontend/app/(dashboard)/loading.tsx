import MyDayHeaderLoading from "@/components/loading-states/loading-myday-header"
import MyDaySectionLoading from "@/components/loading-states/loading-myday-section"

const Loading = () => {
    return (
        <div className="flex flex-col gap-8">
            <MyDayHeaderLoading />
          
            <MyDaySectionLoading cardCount={4} />
         
            <MyDaySectionLoading cardCount={3} />
         
            <MyDaySectionLoading cardCount={5} />
        </div>
    )
}

export default Loading