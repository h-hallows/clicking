"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MARKET_MOVERS, formatTVL } from "@/lib/dashboard-data";
import { TrendingUp, TrendingDown, Flame, Activity, Bot } from "lucide-react";

export function MarketMovers() {
  const [items, setItems] = useState(MARKET_MOVERS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  // Simulate live market movement every 8s
  useEffect(() => {
    mountedRef.current = true;
    setLastUpdated(new Date());
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          tvlChange7d: parseFloat(
            (item.tvlChange7d + (Math.random() - 0.5) * 0.8).toFixed(1)
          ),
        }))
      );
      setLastUpdated(new Date());
    }, 8000);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, []);

  const gainers = [...items].filter((m) => m.tvlChange7d > 0).sort((a, b) => b.tvlChange7d - a.tvlChange7d);
  const losers  = [...items].filter((m) => m.tvlChange7d < 0).sort((a, b) => a.tvlChange7d - b.tvlChange7d);

  const timeStr = lastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) ?? "—";

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2">
          <Flame size={13} className="text-[#f85149]" />
          <span className="text-sm font-semibold text-[#e6edf3]">Market Movers</span>
          <span className="text-[11px] text-[#6e7681]">7-day TVL</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#6e7681]">
          <Activity size={9} className="text-[#00DCC8]" />
          <span className="font-mono" suppressHydrationWarning>{timeStr}</span>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Gainers */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3fb950] mb-2.5 flex items-center gap-1.5">
            <TrendingUp size={10} /> Top Gainers
          </p>
          <div className="space-y-2.5">
            {gainers.map((item) => <MoverRow key={item.id} item={item} />)}
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#21262d" }} />

        {/* Losers */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#f85149] mb-2.5 flex items-center gap-1.5">
            <TrendingDown size={10} /> Notable Declines
          </p>
          <div className="space-y-2.5">
            {losers.map((item) => <MoverRow key={item.id} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MoverRow({ item }: { item: typeof MARKET_MOVERS[number] }) {
  const router = useRouter();
  const isUp = item.tvlChange7d > 0;
  const barWidth = Math.min(100, Math.abs(item.tvlChange7d) * 1.8);

  return (
    <div className="group cursor-pointer">
      <div className="flex items-center justify-between mb-1.5" onClick={() => router.push(`/scope?highlight=${item.id}`)}>
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ backgroundColor: item.accentColor + "20", color: item.accentColor }}
          >
            {item.name.slice(0, 1)}
          </span>
          <div>
            <span className="text-xs font-semibold text-[#e6edf3]">{item.name}</span>
            <span className="text-[10px] text-[#6e7681] ml-1.5">{item.chain}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-[#6e7681]">{formatTVL(item.tvl)}</span>
          <span
            className="text-xs font-bold tabular-nums min-w-[44px] text-right"
            style={{ color: isUp ? "#3fb950" : "#f85149" }}
          >
            {isUp ? "+" : ""}{item.tvlChange7d}%
          </span>
        </div>
      </div>
      {/* Animated bar */}
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "#21262d" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${barWidth}%`, backgroundColor: isUp ? "#3fb950" : "#f85149", opacity: 0.75 }}
        />
      </div>
      {/* Atlas link — appears on hover */}
      <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-[80ms]">
        <Link
          href={`/atlas?q=${encodeURIComponent(`Why is ${item.name} TVL ${isUp ? "surging" : "declining"}? What's driving the ${Math.abs(item.tvlChange7d)}% ${isUp ? "gain" : "drop"} this week?`)}`}
          className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-md"
          style={{ background: "#a78bfa10", color: "#a78bfa", border: "1px solid #a78bfa20" }}
        >
          <Bot size={9} /> Ask Atlas
        </Link>
      </div>
    </div>
  );
}
