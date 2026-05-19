
import Image from "next/image";
import ClarumLogo from "@/assets/logoclar.png"

const Header= ()=>{
    return(
        <header className="h-13 flex items-center justify-between px-6 bg-brand-header ">
            <div className="flex flex-column items-center">
                <Image src={ClarumLogo} alt="clarum logo" height={64} width={64}/>
                <span className="text-text-on-dark-primary font-semibold text-[15px] tracking-tight font-sans">Clarum Sync</span>
            </div>
            <div className="flex flex-column gap-7 items-center">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/[0.07] rounded-full px-2.5 py-1 text-[12px] text-[#CBD5E1] font-medium">
                    <span className="w-1.75 h-1.75 rounded-full bg-confirmed-solid inline-block" />
                    <span> Team Camila </span>
                </div>

                <span className="text-xs text-text-muted">
                    <strong className="text-text-on-dark-secondary font-semibold">18</strong> active cases
                </span>
                <div className="w-7 h-7 rounded-full bg-confirmed-solid text-white text-[10px] font-bold flex items-center justify-center border border-white/[0.14]">
                    NB
                </div>
            </div>
        </header>
    )
}

export default Header;
