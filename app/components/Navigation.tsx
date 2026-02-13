"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/contacts", label: "Contacts" },
    { href: "/ideas", label: "Ideas" }
  ];

  return (
    <>
      {/* Mobile Navigation - Sticky Bottom */}
      <nav className="fixed inset-x-0 bottom-0 z-50 sm:hidden bg-[#05070d]/95 backdrop-blur-xl border-t border-white/10">
        <div className="safe-area-inset-bottom px-4 py-3">
          <ul className="flex justify-around gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              
              return (
                <li key={link.href} className="flex-1">
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-xs font-medium text-center transition-colors ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-200"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      {/* Desktop Navigation - Top Right */}
      <nav className="hidden sm:block glass-panel fixed right-8 top-8 z-50 border-white/20 px-4 py-3">
        <ul className="flex gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-cyan-400/20 text-cyan-200"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
