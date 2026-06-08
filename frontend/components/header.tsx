'use client'
import Image from "next/image"
import ClarumLogo from "@/assets/logoclar.png"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Header = () => {
    const pathname = usePathname()

    const navItems = [
        { label: "My Day", href: "/" },
        { label: "Cases", href: "/cases" },
        { label: "Queue", href: "/queue" },
    ]

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <header className="bg-brand-header px-6 flex items-end justify-between min-h-13">
    
    {/* Left — Logo + tabs */}
    <div className="flex items-end gap-6">
        
        <Link href="/">
            <div className="flex items-center gap-1 cursor-pointer h-[52px]">
                <Image src={ClarumLogo} alt="clarum logo" height={64} width={64} />
                <span className="text-text-on-dark-primary font-semibold text-[15px] tracking-tight">
                    Clarum Sync
                </span>
            </div>
        </Link>

        
        <nav className="flex items-end gap-0.5">
            {navItems.map(({ label, href }) => (
                <Link key={href} href={href}>
                    <div className={`
                        px-4 py-2 text-[12px] font-medium rounded-t-lg border-x border-t
                        transition-all duration-150 cursor-pointer
                        ${isActive(href)
                            ? "bg-bg-page text-text-primary border-border-default"
                            : "text-white/40 border-transparent hover:text-white/70 hover:bg-white/5"
                        }
                    `}>
                        {label}
                    </div>
                </Link>
            ))}
        </nav>
    </div>

    
    <div className="flex items-center gap-6 h-13">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/[0.07] rounded-full px-2.5 py-1 text-[12px] text-text-on-dark-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-confirmed-solid inline-block" />
            <span>Team Camila</span>
        </div>
        <span className="text-[12px] text-text-muted">
            <strong className="text-text-on-dark-secondary font-semibold">18</strong> active cases
        </span>
        <div className="w-7 h-7 rounded-full bg-confirmed-solid text-white text-[10px] font-bold flex items-center justify-center border border-white/[0.14]">
            NB
        </div>
    </div>

</header>
    )
}

export default Header