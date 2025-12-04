"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Header component
const Header = () => {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    } else if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-16 sm:h-20 md:h-[88px] border-b border-[#100F27]">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 md:px-8 container mx-auto">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold">Zcash Analystics</h1>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-4 lg:gap-8 items-center text-sm lg:text-base">
            <li className={pathname === "/" ? "button-ui instrument-sans" : ""}>
              <a href="/">Analystics</a>
            </li>
            <li
              className={
                pathname === "/stats" ? "button-ui instrument-sans" : ""
              }
            >
              <a href="/stats">Stats</a>
            </li>
            <li
              className={
                pathname === "/explorer" ? "button-ui instrument-sans" : ""
              }
            >
              <a href="/explorer">Explorer</a>
            </li>
            <li
              className={
                pathname === "/privacy-analytics" ? "button-ui instrument-sans" : ""
              }
            >
              <a href="/privacy-analytics">Privacy Analytics</a>
            </li>
          </ul>
        </nav>

        {/* Search Icon - Desktop only */}
        <div className="hidden md:flex gap-2 items-center">
          <span>
            <Image
              src={require("../../assets/search.png")}
              alt="Icon"
              width={15}
              height={15}
            />
          </span>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#100F27] bg-[#050915]">
          <nav className="px-4 py-4">
            <ul className="flex flex-col gap-3 text-sm">
              <li className={pathname === "/" ? "button-ui instrument-sans py-2 px-3 rounded" : "py-2 px-3"}>
                <a href="/" onClick={() => setMobileMenuOpen(false)}>Analystics</a>
              </li>
              <li
                className={
                  pathname === "/stats" ? "button-ui instrument-sans py-2 px-3 rounded" : "py-2 px-3"
                }
              >
                <a href="/stats" onClick={() => setMobileMenuOpen(false)}>Stats</a>
              </li>
              <li
                className={
                  pathname === "/explorer" ? "button-ui instrument-sans py-2 px-3 rounded" : "py-2 px-3"
                }
              >
                <a href="/explorer" onClick={() => setMobileMenuOpen(false)}>Explorer</a>
              </li>
              <li
                className={
                  pathname === "/privacy-analytics" ? "button-ui instrument-sans py-2 px-3 rounded" : "py-2 px-3"
                }
              >
                <a href="/privacy-analytics" onClick={() => setMobileMenuOpen(false)}>Privacy Analytics</a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
