import { IconSearch } from "@tabler/icons-react"
import Link from "next/link"

const SearchBar = ({ queueCount }: { queueCount: number }) => {
    return (
        <div className="flex items-center gap-2.5 mb-4">

            <div className="flex-1 h-9 bg-bg-input border border-border-default rounded-md flex items-center gap-2 px-3">
                <IconSearch className="text-text-muted w-4 h-4 shrink-0" />
                <input
                    type="text"
                    placeholder="Search by case name or case number"
                    className="bg-transparent text-[13px] text-text-secondary placeholder:text-text-muted outline-none w-full"
                />
            </div>

            <Link href="/queue">
                <button className="h-9 bg-brand-header text-[#E2E8F0] text-[12px] font-semibold px-3.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-90">
                    Today's queue
                    <span className="bg-urgent-solid text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {queueCount}
                    </span>
                </button>
            </Link>
        </div>
    )
}

export default SearchBar