"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Globe, Bot, LayoutDashboard, Radio, Zap, ChevronRight, Wifi, Search, User, LogIn, X, ScanSearch, Layers, Bell, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { NODES } from "@/lib/ecosystem-data";
import { useAlertsStore } from "@/store/alerts-store";
import { useSidebarStore } from "@/store/sidebar-store";

const nav = [
  {
    id: "feed",
    label: "The Feed",
    href: "/feed",
    icon: Radio,
    color: "#00DCC8",
    dimColor: "#00DCC818",
    description: "Real-time intelligence",
    badge: "LIVE",
  },
  {
    id: "scope",
    label: "The Scope",
    href: "/scope",
    icon: Globe,
    color: "#7c6af7",
    dimColor: "#7c6af718",
    description: "Explore the ecosystem",
    badge: `${NODES.length}`,
  },
  {
    id: "atlas",
    label: "Atlas",
    href: "/atlas",
    icon: Bot,
    color: "#a78bfa",
    dimColor: "#a78bfa18",
    description: "AI intelligence layer",
    badge: null,
  },
  {
    id: "scan",
    label: "Scan",
    href: "/scan",
    icon: ScanSearch,
    color: "#00e5a0",
    dimColor: "#00e5a018",
    description: "Token intelligence reports",
    badge: null,
  },
  {
    id: "yield",
    label: "The Yield",
    href: "/yield",
    icon: Zap,
    color: "#fbbf24",
    dimColor: "#fbbf2418",
    description: "Discover yield pools",
    badge: null,
  },
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
    icon: Layers,
    color: "#E879F9",
    dimColor: "#E879F918",
    description: "AI & crypto toolkit",
    badge: "NEW",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "#00d2e6",
    dimColor: "#00d2e618",
    description: "Your home base",
    badge: "alerts", // dynamic — replaced at render time
  },
  {
    id: "watchlist",
    label: "Watchlist",
    href: "/watchlist",
    icon: Bell,
    color: "#fbbf24",
    dimColor: "#fbbf2418",
    description: "Alerts & monitoring",
    badge: "watchlist-count", // dynamic — replaced at render time
  },
  {
    id: "community",
    label: "Community",
    href: "/community",
    icon: Users,
    color: "#3fb950",
    dimColor: "#3fb95018",
    description: "On-chain verified activity",
    badge: null,
  },
];

function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const alertsUnread = useAlertsStore((s) => s.unreadCount);
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    function refresh() {
      try {
        const stored = localStorage.getItem("cc_alerts");
        if (stored) {
          const parsed: { active?: boolean }[] = JSON.parse(stored);
          setWatchlistCount(parsed.filter((a) => a.active).length);
        }
      } catch {}
    }
    refresh();
    window.addEventListener("cc_alerts_updated", refresh);
    return () => window.removeEventListener("cc_alerts_updated", refresh);
  }, []);
  const initials = user?.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "";
  const colors = ["#7c6af7", "#00d2e6", "#00e5a0", "#fbbf24", "#a78bfa"];
  const avatarColor = user ? colors[user.id.charCodeAt(user.id.length - 1) % colors.length] : "#7c6af7";

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#21262d] flex items-start justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="relative">
              <span
                className="text-[18px] font-black tracking-[0.12em] text-[#e6edf3] uppercase"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                Clicking
              </span>
              <div className="absolute -bottom-0.5 left-0 w-full h-px bg-gradient-to-r from-[#7c6af7] via-[#00d2e6] to-transparent opacity-50" />
            </div>
          </Link>
          <p className="text-[10px] text-[#6e7681] mt-1.5 tracking-wide font-medium">
            Crypto + AI Intelligence
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mt-1 w-6 h-6 flex items-center justify-center rounded-md text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ⌘K search shortcut */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-[#6e7681] hover:text-[#8b949e] hover:border-[#30363d] transition-all duration-[80ms] group"
        >
          <Search size={12} className="flex-shrink-0" />
          <span className="text-[11px] flex-1 text-left">Search...</span>
          <kbd className="text-[9px] bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded font-mono text-[#484f58]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-[80ms] relative",
                isActive
                  ? "bg-[#161b22] text-[#e6edf3]"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]/70"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80` }}
                />
              )}

              {/* Icon */}
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-[80ms] flex-shrink-0"
                style={isActive ? { backgroundColor: item.dimColor, color: item.color } : {}}
              >
                <Icon
                  size={14}
                  style={isActive ? { color: item.color } : {}}
                  className={cn("transition-colors duration-[80ms]", !isActive && "group-hover:text-[#e6edf3]")}
                />
              </span>

              <div className="flex-1 min-w-0">
                <div className={cn("text-[13px] font-semibold leading-none", isActive ? "text-[#e6edf3]" : "")}>
                  {item.label}
                </div>
                {isActive && (
                  <div className="text-[10px] text-[#6e7681] mt-0.5 truncate">
                    {item.description}
                  </div>
                )}
              </div>

              {/* Badge */}
              {item.badge && !isActive && (() => {
                let badgeVal: string | number | null = item.badge;
                if (item.badge === "alerts") badgeVal = alertsUnread > 0 ? alertsUnread : null;
                else if (item.badge === "watchlist-count") badgeVal = watchlistCount > 0 ? watchlistCount : null;
                if (!badgeVal) return null;
                const isNew = badgeVal === "NEW";
                return (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase tracking-wider"
                    style={{
                      backgroundColor: item.color + "20",
                      color: item.color,
                      animation: isNew ? "badge-pulse 2s ease-in-out infinite" : undefined,
                    }}
                  >
                    {badgeVal}
                  </span>
                );
              })()}

              {isActive && (
                <ChevronRight size={11} className="opacity-30 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-[#21262d]" />

      {/* Network status */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <Wifi size={11} className="text-[#3fb950]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-ping opacity-60" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[#3fb950]">All Systems Live</p>
            <p className="text-[9px] text-[#484f58] mt-0.5">ETH · ARB · BASE · SOL</p>
          </div>
        </div>
      </div>

      {/* User / Sign in */}
      <div className="px-3 pb-4 space-y-2">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#21262d] hover:border-[#30363d] hover:bg-[#161b22] transition-all duration-[80ms] group"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#8b949e] group-hover:text-[#e6edf3] transition-colors truncate">{user.name}</p>
                <p className="text-[9px] text-[#484f58] truncate">{user.email}</p>
              </div>
              <User size={11} className="text-[#484f58] flex-shrink-0" />
            </Link>
            {/* Guest upgrade prompt */}
            {user.id.startsWith("guest_") && (
              <Link
                href="/login?mode=signup"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-[80ms]"
                style={{ background: "#7c6af710", color: "#a78bfa", border: "1px solid #7c6af730" }}
              >
                <LogIn size={10} />
                Create free account to save progress
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#7c6af7]/25 bg-[#7c6af7]/[0.06] hover:bg-[#7c6af7]/[0.12] hover:border-[#7c6af7]/40 text-[#a78bfa] text-[12px] font-semibold transition-all duration-[80ms]"
          >
            <LogIn size={13} />
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { open, setOpen } = useSidebarStore();

  // Close on route change (mobile)
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname, setOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setOpen]);

  return (
    <>
      {/* Desktop: always-visible fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[220px] flex-col border-r border-[#21262d] bg-[#0d0e12] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile: backdrop + slide-in drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.22, ease: [0.32, 0, 0.67, 0] }}
              className="lg:hidden fixed left-0 top-0 h-full w-[220px] flex flex-col border-r border-[#21262d] bg-[#0d0e12] z-50"
            >
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
