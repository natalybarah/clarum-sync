import Link from "next/link"



const Header= ()=>{
    return(
        <header className="h-13 flex items-center justify-between px-6 bg-brand-header ">
            <div>
                image
                <span className="">Clarum Sync</span>
            </div>
            <div>
                <p>Team Ana</p> 
                <p>180 active cases</p>
                <p>image</p>
            </div>
        </header>
    )
}

export default Header;
