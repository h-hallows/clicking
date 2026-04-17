"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Menu } from "lucide-react";
import { PriceData } from "@/app/api/prices/route";
import { UserMenu } from "./UserMenu";
import { NotificationsPanel } from "./NotificationsPanel";
import { useSidebarStore } from "@/store/sidebar-store";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 1)    return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

const TOPBAR_TOKENS = ["BTC", "ETH", "SOL", "TAO"];

export function Topbar({ title, subtitle }: TopbarProps) {
  const { toggle } = useSidebarStore();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});
  const prevRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let flashTimeout: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) return;
        const { prices: p }: { prices: PriceData[] } = await res.json();
        const shown = p.filter((x) => TOPBAR_TOKENS.includes(x.symbol));

        const newFlash: Record<string, "up" | "down"> = {};
        shown.forEach((item) => {
          const prev = prevRef.current[item.symbol];
          if (prev != null && prev !== item.price) {
            newFlash[item.symbol] = item.price > prev ? "up" : "down";
          }
          prevRef.current[item.symbol] = item.price;
        });

        setPrices(shown);
        if (Object.keys(newFlash).length) {
          setFlashMap(newFlash);
          clearTimeout(flashTimeout);
          flashTimeout = setTimeout(() => setFlashMap({}), 600);
        }
      } catch {}
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => { clearInterval(iv); clearTimeout(flashTimeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  };

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-5 border-b border-[#21262d] bg-[#0d0e12]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Left: hamburger (mobile) + title + live prices */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[#30363d] text-[#6e7681] hover:text-[#e6edf3] hover:border-[#484f58] bg-[#161b22] transition-all duration-[80ms] flex-shrink-0"
        >
          <Menu size={14} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[13px] font-bold text-[#e6edf3] leading-none tracking-tight font-display">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-[#6e7681] mt-0.5 truncate max-w-[360px]">{subtitle}</p>
          )}
        </div>

        {/* Live prices */}
        {prices.length > 0 && (
          <div className="hidden lg:flex items-center gap-4 pl-5 border-l border-[#21262d]">
            {prices.map((p) => {
              const flash = flashMap[p.symbol];
              const up = p.change24h >= 0;
              return (
                <div key={p.symbol} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-[#484f58] tracking-wider">{p.symbol}</span>
                  <span
                    className="text-[11px] font-bold tabular-nums transition-colors duration-200"
                    style={{
                      color: flash === "up" ? "#3fb950" : flash === "down" ? "#f85149" : "#8b949e",
                    }}
                  >
                    {formatPrice(p.price)}
                  </span>
                  <span
                    className="text-[10px] font-semibold tabular-nums"
                    style={{ color: up ? "#3fb950" : "#f85149" }}
                  >
                    {up ? "+" : ""}{p.change24h.toFixed(1)}%
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#3fb950] animate-pulse" />
              <span className="text-[9px] text-[#3fb950] font-bold tracking-wider">LIVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search → Command palette */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d]
                     text-[#6e7681] hover:border-[#484f58] hover:text-[#8b949e] transition-all duration-[80ms] cursor-pointer group"
        >
          <Search size={12} />
          <span className="text-[11px] hidden sm:block">Search...</span>
          <kbd className="hidden sm:flex items-center text-[9px] px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[#484f58]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationsPanel />

        {/* User account */}
        <UserMenu />
      </div>
    </header>
  );
}
