'use client'
import { IconChevronsRight, IconChevronsLeft, IconChevronRight, IconChevronLeft  } from "@tabler/icons-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"

type PaginationProps={
    currentPage: number,
    totalPages: number,
}

const Pagination= ({currentPage, totalPages}: PaginationProps)=>{
    const searchParams= useSearchParams();
    const pathname= usePathname();
    const router= useRouter();

    const goToPage= (page: number)=>{
        const params= new URLSearchParams(searchParams.toString());
        params.set("page", page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }
    const baseClassesIconContainer="w-7 h-7 flex items-center justify-center rounded border border-border-default text-text-muted hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed"
return(

    <div className="flex items-center justify-center gap-4 px-4 py-3 ">
        <span className="text-[12px] text-text-muted">
           Page {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-1">
            {/* Go to first page */}
            <button 
                onClick={()=>goToPage(1)} 
                disabled={currentPage === 1} 
                className={baseClassesIconContainer}
            >
                <IconChevronsLeft className="w-3.5 h-3.5"/>
            </button>
            {/*Go to previous page */}
            <button 
                onClick={()=>goToPage(currentPage - 1)} 
                disabled={currentPage === 1 } 
                className={baseClassesIconContainer}
            >
                <IconChevronLeft className="w-3.5 h-3.5"/>
            </button>
            {/*Go to next page */}
            <button 
                onClick={()=>goToPage(currentPage + 1 )} 
                disabled={currentPage === totalPages} 
                className={baseClassesIconContainer}
            >
                <IconChevronRight className="w-3.5 h-3.5"/>
            </button>
            {/*Go to last page  */}
            <button 
                onClick={()=>goToPage(totalPages)} 
                disabled={currentPage === totalPages} 
                className={baseClassesIconContainer}
            >
                <IconChevronsRight className="w-3.5 h-3.5"/>
            </button>

        </div>
    </div>
)
}

export default Pagination;