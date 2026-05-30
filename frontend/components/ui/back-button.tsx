import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react";

const BackButton=()=>{

    return(
        <Link href={"/"}>
            <button className="flex items-center gap-1.5 text-[12px] text-text-muted transition-colors duration-150 hover:text-text-primary mb-3 cursor-pointer">
                <IconArrowLeft className="w-3.5 h-3.5" />
                All cases
            </button>
        </Link>
    )
}

export default BackButton;
