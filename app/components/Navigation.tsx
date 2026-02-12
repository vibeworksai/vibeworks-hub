"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/ideas", label: "Ideas" }
  ];

  return (
    <nav className="glass-panel fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border-white/20 px-4 py-3 sm:bottom-auto sm:left-auto sm:right-8 sm:top-8 sm:translate-x-0">
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
  );
}
