"use client";

import Image from "next/image";

// Header component
const Header = () => {
    return (
        <header className="h-[88px] border-b border-[#100F27]">
            <div className="flex items-center justify-between h-full px-8 container mx-auto">
                <h1>Zcash Analystics</h1>
                <nav>
                    <ul className="flex gap-8 items-center">
                        <li className="button-ui instrument-sans"><a href="/">Analystics</a></li>
                        <li><a href="/about">Explorers</a></li>
                    </ul>
                </nav>

                <div className="flex gap-2 items-center">
                    <span><Image src={require("../../assets/search.png")} alt="Icon" width={15} height={15} /></span>
                    <span className="ml-4"><Image src={require("../../assets/tdesign_mode-dark.png")} alt="Icon" width={15} height={15} /></span>
                </div>
            </div>
        </header>
    )
}

export default Header;