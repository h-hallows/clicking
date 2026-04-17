"use client";

import { useEffect, useRef, useState } from "react";
import { MARKET_STATS } from "@/lib/dashboard-data";
import { TrendingUp, TrendingDown } from "lucide-react";

// Animate a number from 0 → target over ~1.2s
function useCountUp(target: string, duration = 1200) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Parse numeric value from formatted string like "$132.4B" or "21.4M"
    const match = target.match(/^([$]?)(\d+(?:\.\d+)?)(B|M|K|%)?$/);
    if (!match) { setDisplay(target); return; }

    const prefix = match[1];
    const num = parseFloat(match[2]);
    const suffix = match[3] ?? "";

    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      const decimals = target.includes(".") ? (target.split(".")[1]?.replace(/\D/g, "").length ?? 1) : 0;
      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function StatCard({ stat }: { stat: typeof MARKET_STATS[number] }) {
  const isPositive = stat.change >= 0;
  const animatedValue = useCountUp(stat.value, 1400);

  return (
    <div
      className="rounded-xl border p-4 relative overflow-hidden group transition-all duration-200"
      style={{ background: "#161b22", borderColor: "#21262d", boxShadow: `0 0 0 0 ${stat.color}00` }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#30363d"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#21262d"}
    >
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-[0.08] group-hover:opacity-[0.14] transition-opacity -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: stat.color }}
      />

      {/* Live dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: stat.color }}
        />
      </div>

      <div className="relative">
        <p className="text-[11px] text-[#6e7681] font-medium mb-2">{stat.sublabel}</p>

        <p className="text-2xl font-bold text-[#e6edf3] tracking-tight mb-1 tabular-nums"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
          {animatedValue}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#484f58]">{stat.label}</p>
          <div
            className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{
              color: isPositive ? "#3fb950" : "#f85149",
              backgroundColor: (isPositive ? "#3fb950" : "#f85149") + "15",
            }}
          >
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? "+" : ""}{stat.change}%
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {MARKET_STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
