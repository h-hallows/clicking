"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Radio, Bot, LayoutDashboard, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/scope",     icon: Globe,           label: "Scope",    color: "#7c6af7" },
  { href: "/feed",      icon: Radio,           label: "Feed",     color: "#00DCC8" },
  { href: "/atlas",     icon: Bot,             label: "Atlas",    color: "#a78bfa" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Portfolio",color: "#00d2e6" },
  { href: "/tools",     icon: Layers,          label: "Tools",    color: "#E879F9" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex items-stretch"
      style={{ background: "#0d0e12", borderColor: "#21262d", height: "56px" }}
    >
      {MOBILE_NAV.map(({ href, icon: Icon, label, color }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-[80ms]",
              isActive ? "" : "text-[#484f58] hover:text-[#6e7681]"
            )}
            style={isActive ? { color } : undefined}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-b-full"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
              />
            )}
            <span
              className="flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-[80ms]"
              style={isActive ? { backgroundColor: color + "18" } : undefined}
            >
              <Icon size={15} />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
