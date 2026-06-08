const EmptyState=({title}: {title: string})=> {
    const today = new Date()
    const day= today.getDay()

    const getMessage=()=> {
        if (title=== "Today"){
            if (day === 5) return "No appearances today - close to the weekend, well deserved!"
            
            if (day === 6 || day === 0 ) return "No court on weekends. Enjoy your time off!"
            return "No appearances today. A quiet day - use it well."
        }
        
        if (title === "Tomorrow") {
            if (day === 4) return "Nothing scheduled for tomorrow — enjoy a quiet Friday."
           if (day === 5 || day === 6) return "No court appearances this weekend."
            return "Nothing scheduled for tomorrow."
        }
       
        return "No appearances scheduled for the rest of the week."
    }

    return  (
        <div className="bg-bg-card border border-border-default rounded-xl px-5 py-4">
            <p className="text-[13px] text-text-muted italic">{getMessage()}</p>
        </div>
    )
}

export default EmptyState;