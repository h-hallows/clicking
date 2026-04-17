"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WATCHLIST, formatTVL, WatchlistItem } from "@/lib/dashboard-data";
import { NODES, CATEGORY_CONFIG } from "@/lib/ecosystem-data";
import { TrendingUp, TrendingDown, ShieldCheck, Plus, Star, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "tvl" | "apy" | "change";

// Seeded pseudo-random (mulberry32) — deterministic on both server and client
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate fake 14-point sparkline data around a base value
function genSparkline(base: number, change: number, seed: number): number[] {
  const rand = seededRand(seed);
  const pts: number[] = [];
  let v = base * (1 - Math.abs(change) / 100 * 0.8);
  for (let i = 0; i < 14; i++) {
    v += v * (rand() - 0.48) * 0.035;
    pts.push(v);
  }
  pts[pts.length - 1] = base;
  return pts;
}

function Sparkline({ data, up, color }: { data: number[]; up: boolean; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`);
  const path = "M" + pts.join(" L");
  // Filled area
  const fillPath = path + ` L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2"
        fill={color}
      />
    </svg>
  );
}

// Generate sparklines once with deterministic seeds
const SPARKLINES = WATCHLIST.reduce<Record<string, number[]>>((acc, item, i) => {
  // Stable seed from index + first char code of id
  const seed = (i + 1) * 1000 + (item.id.charCodeAt(0) ?? 42);
  acc[item.id] = genSparkline(item.tvl, item.tvlChange24h, seed);
  return acc;
}, {});

function AddProtocolModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, color: string) => void }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const filtered = NODES.filter((n) =>
    n.label.toLowerCase().includes(q.toLowerCase()) ||
    n.category.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden" style={{ background: "#161b22", borderColor: "#30363d" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#21262d" }}>
          <span className="text-[13px] font-bold text-[#e6edf3]">Add to Watchlist</span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
            <X size={13} />
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border mb-3" style={{ background: "#0d0e12", borderColor: "#30363d" }}>
            <Search size={12} className="text-[#484f58]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search protocols..."
              className="flex-1 bg-transparent text-[12px] text-[#e6edf3] placeholder-[#484f58] outline-none"
            />
          </div>
          <div className="space-y-0.5 max-h-[260px] overflow-y-auto">
            {filtered.map((node) => (
              <button
                key={node.id}
                onClick={() => { onAdd(node.label, CATEGORY_CONFIG[node.category]?.color ?? "#7c6af7"); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#21262d] transition-all text-left"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: (CATEGORY_CONFIG[node.category]?.color ?? "#7c6af7") + "20", color: CATEGORY_CONFIG[node.category]?.color ?? "#7c6af7" }}
                >
                  {node.label.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#e6edf3] truncate">{node.label}</p>
                  <p className="text-[10px] text-[#484f58]">{node.category} · {node.primaryChain}</p>
                </div>
                <Plus size={11} className="ml-auto text-[#484f58] flex-shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-[11px] text-[#484f58] text-center py-6">No protocols match "{q}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Watchlist() {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>("tvl");
  const [items, setItems] = useState(WATCHLIST);
  const [addOpen, setAddOpen] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Simulate live updates every 7s
  useEffect(() => {
    let flashTimeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setItems((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const id = prev[idx].id;
        setFlashIds(new Set([id]));
        clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => setFlashIds(new Set()), 900);
        return prev.map((item) => {
          if (item.id !== id) return item;
          const delta = (Math.random() - 0.48) * 0.4;
          return {
            ...item,
            tvlChange24h: parseFloat((item.tvlChange24h + delta).toFixed(1)),
            apy: item.apy != null
              ? parseFloat((item.apy + (Math.random() - 0.5) * 0.12).toFixed(1))
              : item.apy,
          };
        });
      });
    };

    const interval = setInterval(tick, 7000);
    return () => { clearInterval(interval); clearTimeout(flashTimeout); };
  }, []);

  const sorted = [...items].sort((a, b) => {
    if (sort === "tvl") return b.tvl - a.tvl;
    if (sort === "apy") return (b.apy ?? 0) - (a.apy ?? 0);
    if (sort === "change") return b.tvlChange24h - a.tvlChange24h;
    return 0;
  });

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2">
          <Star size={13} className="text-[#f5c518]" />
          <span className="text-[13px] font-bold text-[#e6edf3]">Watchlist</span>
          <span className="text-[11px] text-[#484f58] px-1.5 py-0.5 rounded-md" style={{ background: "#21262d" }}>
            {items.length}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#4a4a5a]">
            <span className="w-1 h-1 rounded-full bg-[#00e5a0] animate-pulse" />
            Live
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(["tvl", "apy", "change"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-colors",
                sort === key
                  ? "bg-[#7c6af720] text-[#7c6af7]"
                  : "text-[#4a4a5a] hover:text-[#6b6b80]"
              )}
            >
              {key === "change" ? "24h" : key.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => setAddOpen(true)}
            className="ml-1 w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.05] text-[#6b6b80] hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Add protocol to watchlist"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-4 py-2 grid grid-cols-[1fr_60px_80px_80px_80px] gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#484f58]">
        <span>Protocol</span>
        <span className="text-right">7d</span>
        <span className="text-right">TVL</span>
        <span className="text-right">APY</span>
        <span className="text-right">24h</span>
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "#1c2128" }}>
        {sorted.map((item) => {
          const tvlUp = item.tvlChange24h >= 0;
          const isFlashing = flashIds.has(item.id);
          const sparkData = SPARKLINES[item.id];

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/scope?highlight=${item.id}`)}
              className={cn(
                "px-4 py-3 grid grid-cols-[1fr_60px_80px_80px_80px] gap-2 items-center transition-all cursor-pointer group",
                isFlashing ? "bg-[#21262d]" : "hover:bg-[#1c2128]"
              )}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: item.accentColor + "20", color: item.accentColor }}
                >
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-semibold text-[#e6edf3] truncate">
                      {item.name}
                    </span>
                    {item.verified && (
                      <ShieldCheck size={11} style={{ color: item.accentColor }} className="flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: item.accentColor + "15", color: item.accentColor }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#484f58]">{item.chain}</span>
                  </div>
                </div>
              </div>

              {/* Sparkline — client-only to avoid SSR hydration mismatch */}
              <div className="flex justify-end">
                {mounted && sparkData && (
                  <Sparkline data={sparkData} up={tvlUp} color={tvlUp ? "#00e5a0" : "#ff6b6b"} />
                )}
              </div>

              {/* TVL */}
              <div className="text-right">
                <span
                  className={cn(
                    "text-sm font-semibold text-white transition-colors duration-500",
                    isFlashing && "text-[#e8e8ff]"
                  )}
                >
                  {formatTVL(item.tvl)}
                </span>
              </div>

              {/* APY */}
              <div className="text-right">
                {item.apy != null ? (
                  <div>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors duration-500",
                        isFlashing ? "text-white" : ""
                      )}
                      style={{ color: isFlashing ? "#ffffff" : item.accentColor }}
                    >
                      {item.apy}%
                    </span>
                    {item.apyChange24h != null && (
                      <div
                        className="text-[10px]"
                        style={{ color: item.apyChange24h >= 0 ? "#00e5a0" : "#ff6b6b" }}
                      >
                        {item.apyChange24h >= 0 ? "+" : ""}{item.apyChange24h}%
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[#4a4a5a] text-xs">—</span>
                )}
              </div>

              {/* 24h TVL change */}
              <div className="text-right">
                <div
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold transition-all duration-500",
                    isFlashing && "scale-110"
                  )}
                  style={{ color: tvlUp ? "#00e5a0" : "#ff6b6b" }}
                >
                  {tvlUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {tvlUp ? "+" : ""}{item.tvlChange24h}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && (
        <AddProtocolModal
          onClose={() => setAddOpen(false)}
          onAdd={(name, color) => {
            const id = name.toLowerCase().replace(/\s+/g, "-");
            if (items.find((i) => i.id === id)) return;
            setItems((prev) => [
              ...prev,
              {
                id, name, category: "Protocol", chain: "Multi-chain",
                tvl: 0, tvlChange24h: 0, verified: false, accentColor: color,
              },
            ]);
          }}
        />
      )}
    </div>
  );
}
