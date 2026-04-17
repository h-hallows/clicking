"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  NARRATIVES, SEED_SIGNALS, LIVE_SIGNAL_POOL, HEAT_COLORS,
  Signal, Narrative,
} from "@/lib/narratives";
import { PriceData } from "@/app/api/prices/route";
import Link from "next/link";
import {
  BarChart2, RefreshCw, ChevronDown, ExternalLink, Zap,
  TrendingUp, Newspaper, Activity, Radio, Bot, Globe, Star, Clock, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WATCHED_KEY = "clicking_watched";

function getWatched(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WATCHED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistWatched(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WATCHED_KEY, JSON.stringify(ids));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 1)    return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

const TYPE_CONFIG: Record<Signal["type"], { icon: typeof Zap; label: string; color: string }> = {
  whale:   { icon: Activity,   label: "WHALE",    color: "#9F7AFA" },
  onchain: { icon: BarChart2,  label: "ON-CHAIN", color: "#00DCC8" },
  news:    { icon: Newspaper,  label: "NEWS",     color: "#4A9EFF" },
  social:  { icon: Radio,      label: "SOCIAL",   color: "#FF6B9D" },
  yield:   { icon: TrendingUp, label: "YIELD",    color: "#fbbf24" },
  tvl:     { icon: BarChart2,  label: "TVL",      color: "#27C96A" },
};

const HEAT_LEVEL: Record<Narrative["heat"], number> = {
  EXPLODING: 5, HOT: 4, RISING: 3, BUILDING: 2, WATCH: 1,
};

// ─── Price Ticker ─────────────────────────────────────────────────────────────

function PriceTicker({ prices }: { prices: PriceData[] }) {
  const [flashing, setFlashing] = useState<Record<string, "up" | "down">>({});
  const [paused, setPaused] = useState(false);
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const newFlash: Record<string, "up" | "down"> = {};
    prices.forEach((p) => {
      const prev = prevPrices.current[p.symbol];
      if (prev != null && prev !== p.price) {
        newFlash[p.symbol] = p.price > prev ? "up" : "down";
      }
      prevPrices.current[p.symbol] = p.price;
    });
    if (Object.keys(newFlash).length) {
      setFlashing(newFlash);
      const t = setTimeout(() => setFlashing({}), 700);
      return () => clearTimeout(t);
    }
  }, [prices]);

  return (
    <div className="border-b border-white/[0.06] bg-[#06060c] overflow-hidden flex items-stretch h-9">
      {/* LIVE badge — fixed left */}
      <div className="flex items-center gap-1.5 px-3 border-r border-white/[0.06] flex-shrink-0 bg-[#06060c] z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#27C96A] animate-pulse" />
        <span className="text-[10px] font-black text-[#27C96A] tracking-widest uppercase">Live</span>
      </div>

      {/* Scrolling track */}
      <div
        className="flex-1 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex h-full"
          style={{
            animation: "ticker-scroll 45s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {[...prices, ...prices].map((p, i) => {
            const up = p.change24h >= 0;
            const flash = flashing[p.symbol];
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 px-4 border-r border-white/[0.04] flex-shrink-0 transition-colors duration-300",
                  flash === "up"   && "bg-[#27C96A0d]",
                  flash === "down" && "bg-[#FF3D570d]",
                )}
              >
                <span className="text-[10px] font-black text-[#3a3a5a] tracking-wide">{p.symbol}</span>
                <span
                  className={cn(
                    "text-[11px] font-bold tabular-nums transition-colors duration-300",
                    flash === "up"   ? "text-[#27C96A]"
                    : flash === "down" ? "text-[#FF3D57]"
                    : "text-[#c8c8e0]",
                  )}
                >
                  {formatPrice(p.price)}
                </span>
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: up ? "#27C96A" : "#FF3D57" }}
                >
                  {up ? "+" : ""}{p.change24h.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Domain Tabs ──────────────────────────────────────────────────────────────

function DomainTabs({ active, onChange }: { active: "crypto" | "ai" | "both"; onChange: (d: "crypto" | "ai" | "both") => void }) {
  return (
    <div className="flex items-center gap-0 border-b px-4" style={{ borderColor: "#21262d", background: "#0d0e12" }}>
      {[
        { id: "crypto", label: "⛓ CRYPTO" },
        { id: "both",   label: "ALL SIGNALS" },
        { id: "ai",     label: "🤖 AI" },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id as "crypto" | "ai" | "both")}
          className={cn(
            "px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
            active === id
              ? id === "ai" ? "text-[#E879F9] border-[#E879F9]"
                : id === "crypto" ? "text-[#00DCC8] border-[#00DCC8]"
                : "text-[#e6edf3] border-[#e6edf3]"
              : "text-[#484f58] border-transparent hover:text-[#6e7681]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Narrative Bar ────────────────────────────────────────────────────────────

function NarrativeBar({
  active, onSelect, signalCounts, myNarrativesActive, onMyNarrativesToggle, feedDomain,
}: {
  active: string | null;
  onSelect: (id: string | null) => void;
  signalCounts: Record<string, number>;
  myNarrativesActive: boolean;
  onMyNarrativesToggle: () => void;
  feedDomain: "crypto" | "ai" | "both";
}) {
  const total = Object.values(signalCounts).reduce((a, b) => a + b, 0);

  const visibleNarratives = NARRATIVES.filter((nar) => {
    if (feedDomain === "both") return true;
    if (feedDomain === "crypto") return !nar.domain || nar.domain === "crypto";
    if (feedDomain === "ai") return nar.domain === "ai" || nar.domain === "both";
    return true;
  });

  return (
    <div className="border-b border-white/[0.06] bg-[#07070d] pl-4 pr-20 py-2.5">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* ALL pill */}
        <button
          onClick={() => { onSelect(null); if (myNarrativesActive) onMyNarrativesToggle(); }}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
            active === null && !myNarrativesActive
              ? "bg-white/[0.07] border-white/20 text-white"
              : "border-white/[0.06] text-[#3a3a55] hover:text-[#7878a0] hover:border-white/10"
          )}
        >
          ALL
          <span className="opacity-40 text-[9px]">{total}</span>
        </button>

        {/* MY NARRATIVES chip */}
        <button
          onClick={() => { onSelect(null); onMyNarrativesToggle(); }}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
            myNarrativesActive
              ? "border-[#fbbf2460] text-[#fbbf24]"
              : "border-white/[0.06] text-[#3a3a55] hover:text-[#7878a0] hover:border-white/10",
          )}
          style={myNarrativesActive ? { background: "#fbbf2414" } : {}}
        >
          <Star size={9} className={cn(myNarrativesActive && "fill-[#fbbf24]")} />
          My Narratives
        </button>

        {visibleNarratives.map((nar) => {
          const isActive = active === nar.id;
          const heatColor = HEAT_COLORS[nar.heat];
          const count = signalCounts[nar.id] ?? 0;
          const isHot = nar.heat === "EXPLODING" || nar.heat === "HOT";

          return (
            <button
              key={nar.id}
              onClick={() => { onSelect(isActive ? null : nar.id); if (myNarrativesActive) onMyNarrativesToggle(); }}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                isActive
                  ? "text-white"
                  : "border-white/[0.06] text-[#3a3a55] hover:text-[#7878a0] hover:border-white/10",
              )}
              style={isActive
                ? { borderColor: nar.color + "60", background: nar.color + "14", color: nar.color }
                : {}
              }
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isHot && !isActive && "animate-pulse")}
                style={{ background: heatColor }}
              />
              {nar.label}
              {count > 0 && (
                <span className="text-[9px] opacity-50">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Signal Card ──────────────────────────────────────────────────────────────

function SignalCard({ signal, isNew }: { signal: Signal; isNew: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showWatch, setShowWatch] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("10");
  const [alertSaved, setAlertSaved] = useState(false);
  const watchRef = useRef<HTMLDivElement>(null);
  const cfg = TYPE_CONFIG[signal.type];

  // Close WATCH popover on outside click
  useEffect(() => {
    if (!showWatch) return;
    const handler = (e: MouseEvent) => {
      if (watchRef.current && !watchRef.current.contains(e.target as Node)) {
        setShowWatch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showWatch]);
  const TypeIcon = cfg.icon;
  const heatColor = HEAT_COLORS[signal.heat];
  const level = HEAT_LEVEL[signal.heat];
  const isExploding = signal.heat === "EXPLODING";

  function saveAlert(e: React.MouseEvent) {
    e.stopPropagation();
    const alerts = JSON.parse(localStorage.getItem("cc_alerts") || "[]");
    alerts.push({
      id: `alert-${Date.now()}`,
      type: "whale_buy",
      narrativeId: signal.narrativeId,
      narrativeLabel: signal.narrativeLabel,
      threshold: Number(alertThreshold),
      active: true,
      triggered: [],
    });
    localStorage.setItem("cc_alerts", JSON.stringify(alerts));
    setAlertSaved(true);
    setTimeout(() => { setShowWatch(false); setAlertSaved(false); }, 1200);
  }

  const accentColor = signal.domain === "ai" ? "#E879F9"
    : signal.domain === "both" ? "#F5A623"
    : signal.narrativeColor;

  return (
    <article
      className={cn(
        "group relative rounded-xl border overflow-hidden cursor-pointer select-none transition-all duration-200",
        isNew ? "border-white/[0.18]" : "border-[#21262d]",
        "hover:border-[#30363d] hover:-translate-y-px",
      )}
      style={{
        background: `linear-gradient(140deg, #090910 0%, ${signal.narrativeColor}0c 100%)`,
        boxShadow: isNew ? `0 0 32px ${signal.narrativeColor}12` : undefined,
        animation: isNew ? "signal-enter 0.3s ease-out" : undefined,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left accent — glowing */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}28 100%)`,
          boxShadow: `0 0 14px ${accentColor}70, 0 0 4px ${accentColor}`,
        }}
      />

      <div className="pl-5 pr-4 pt-3.5 pb-3.5">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span
            className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: signal.narrativeColor + "1e", color: signal.narrativeColor }}
          >
            {signal.narrativeLabel}
          </span>

          {signal.domain === "ai" && (
            <span className="text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "#E879F908", color: "#E879F9", border: "1px solid #E879F920" }}>
              🤖 AI
            </span>
          )}
          {signal.domain === "both" && (
            <span className="text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "#F5A62308", color: "#F5A623", border: "1px solid #F5A62320" }}>
              ⛓×🤖
            </span>
          )}

          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full flex-shrink-0",
              isExploding && "animate-pulse",
            )}
            style={{ background: heatColor + "22", color: heatColor }}
          >
            {isExploding ? "🔥 " : ""}{signal.heat}
          </span>

          <span
            className="flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: cfg.color + "18", color: cfg.color }}
          >
            <TypeIcon size={8} />
            {cfg.label}
          </span>

          <div className="flex-1" />

          {/* Signal strength bars */}
          <div className="flex items-end gap-[2px] mr-1.5 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[2.5px] rounded-sm"
                style={{
                  height: `${5 + i * 2}px`,
                  backgroundColor: i <= level ? heatColor : "#1e1e2e",
                }}
              />
            ))}
          </div>

          <span className="text-[10px] text-[#333350] font-mono tabular-nums flex-shrink-0" suppressHydrationWarning>
            {timeAgo(signal.timestamp)}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-[13px] font-bold text-white leading-snug mb-2 pr-1 group-hover:text-[#ebebff] transition-colors">
          {signal.headline}
        </h3>

        {/* Body — line-clamped, expands on click */}
        <p
          className={cn(
            "text-[11px] text-[#68688a] leading-relaxed mb-3 transition-all duration-200",
            !expanded && "line-clamp-2"
          )}
        >
          {signal.body}
        </p>

        {/* Crypto impact — shown for intersection signals */}
        {signal.cryptoImpact && signal.domain === "both" && (
          <div
            className="rounded-lg px-3 py-2 mb-3"
            style={{ background: "#F5A62307", border: "1px solid #F5A62330" }}
          >
            <div className="text-[8.5px] font-black uppercase tracking-widest text-[#F5A623] mb-1 font-mono">
              ⛓ CRYPTO IMPACT
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#8b949e" }}>
              {signal.cryptoImpact}
            </p>
          </div>
        )}

        {/* Signal tags */}
        {signal.sigs.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {signal.sigs.map(([emoji, label], i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: signal.narrativeColor + "10", color: signal.narrativeColor + "cc" }}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Footer — tokens + source + expand */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            {signal.tokens.slice(0, 4).map((tok) => (
              <span
                key={tok}
                className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono tracking-wide"
                style={{ background: signal.narrativeColor + "18", color: signal.narrativeColor }}
              >
                {tok}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {signal.source && (
              <span className="text-[9px] text-[#252535] font-mono">{signal.source}</span>
            )}
            {signal.url && (
              <a
                href={signal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#333350] hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={10} />
              </a>
            )}
            {/* Watch button */}
            <div ref={watchRef} className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowWatch(v => !v)}
                className="text-[9px] font-black px-2 py-0.5 rounded transition-all"
                style={{
                  background: showWatch ? signal.narrativeColor + "20" : "transparent",
                  color: showWatch ? signal.narrativeColor : "#333350",
                  border: `1px solid ${showWatch ? signal.narrativeColor + "40" : "transparent"}`,
                }}
              >
                + WATCH
              </button>
              {showWatch && (
                <div
                  className="absolute right-0 bottom-full mb-1.5 w-52 rounded-lg p-3 z-20 space-y-2"
                  style={{ background: "#161b22", border: "1px solid #30363d", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
                >
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#484f58]">Alert me when...</div>
                  <div className="space-y-1.5">
                    {["Any signal for this narrative", `Whale buy above $${alertThreshold}M`].map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`watch-${signal.id}`} defaultChecked={i === 0}
                          className="accent-[#00DCC8] w-3 h-3" />
                        <span className="text-[11px] text-[#8b949e]">{opt}</span>
                      </label>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#484f58]">Whale $</span>
                      <input
                        type="number"
                        value={alertThreshold}
                        onChange={e => setAlertThreshold(e.target.value)}
                        className="w-16 px-2 py-0.5 rounded text-[11px] text-[#e6edf3] outline-none"
                        style={{ background: "#0d0e12", border: "1px solid #30363d" }}
                      />
                      <span className="text-[10px] text-[#484f58]">M+</span>
                    </div>
                  </div>
                  <button
                    onClick={saveAlert}
                    className="w-full py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: alertSaved ? "#3fb950" : "#00DCC8", color: "#0d0e12" }}
                  >
                    {alertSaved ? "✓ Alert Set" : "Set Alert"}
                  </button>
                </div>
              )}
            </div>
            <ChevronDown
              size={12}
              className={cn(
                "text-[#333350] group-hover:text-[#5a5a7a] transition-all duration-200",
                expanded && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* Cross-app actions — shown on expand */}
        {expanded && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/atlas?q=${encodeURIComponent(`Tell me more about: ${signal.headline}`)}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-[80ms] hover:opacity-90"
              style={{ background: "#a78bfa18", color: "#a78bfa", border: "1px solid #a78bfa25" }}
            >
              <Bot size={10} />
              Ask Atlas
            </Link>
            {signal.tokens[0] && (
              <Link
                href={`/scope?highlight=${signal.tokens[0].toLowerCase()}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-[80ms] hover:opacity-90"
                style={{ background: "#7c6af718", color: "#7c6af7", border: "1px solid #7c6af725" }}
              >
                <Globe size={10} />
                View in Scope
              </Link>
            )}
            {signal.tokens[0] && (
              <Link
                href={`/yield?search=${signal.tokens[0]}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-[80ms] hover:opacity-90"
                style={{ background: "#fbbf2418", color: "#fbbf24", border: "1px solid #fbbf2425" }}
              >
                <Zap size={10} />
                Find Yield
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Narrative Heat Panel ─────────────────────────────────────────────────────

function NarrativeHeatPanel({
  signals,
  activeNarrative,
  onSelect,
  watched,
  onToggleWatch,
  feedDomain,
}: {
  signals: Signal[];
  activeNarrative: string | null;
  onSelect: (id: string | null) => void;
  watched: string[];
  onToggleWatch: (id: string) => void;
  feedDomain: "crypto" | "ai" | "both";
}) {
  const counts = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.narrativeId] = (acc[s.narrativeId] ?? 0) + 1;
    return acc;
  }, {});

  const visibleNarratives = NARRATIVES.filter((nar) => {
    if (feedDomain === "both") return true;
    if (feedDomain === "crypto") return !nar.domain || nar.domain === "crypto";
    if (feedDomain === "ai") return nar.domain === "ai" || nar.domain === "both";
    return true;
  });

  const tokenFreq = signals.reduce<Record<string, { count: number; color: string }>>((acc, s) => {
    s.tokens.forEach((tok) => {
      if (!acc[tok]) acc[tok] = { count: 0, color: s.narrativeColor };
      acc[tok].count++;
    });
    return acc;
  }, {});

  const trending = Object.entries(tokenFreq)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  return (
    <div className="h-full overflow-y-auto border-l border-white/[0.05] bg-[#05050b]">
      <div className="p-4 space-y-6">

        {/* Narrative Heat */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-[#484f58]">
              Narrative Heat
            </h4>
            <div className="flex items-center gap-1">
              <span className="relative flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27C96A] animate-ping absolute opacity-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27C96A]" />
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[#27C96A]">LIVE</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {visibleNarratives.map((nar) => {
              const count = counts[nar.id] ?? 0;
              const heatColor = HEAT_COLORS[nar.heat];
              const isActive = activeNarrative === nar.id;
              const isWatched = watched.includes(nar.id);

              return (
                <div key={nar.id} className="group/row relative">
                  <button
                    onClick={() => onSelect(isActive ? null : nar.id)}
                    className={cn(
                      "w-full text-left rounded-lg px-2.5 py-2 pr-8 transition-all",
                      isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.025]",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isWatched && (
                          <Star
                            size={8}
                            className="fill-[#fbbf24] text-[#fbbf24] flex-shrink-0"
                          />
                        )}
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide"
                          style={{ color: isActive ? nar.color : "#4a4a68" }}
                        >
                          {nar.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[8px] font-black uppercase"
                          style={{ color: heatColor }}
                        >
                          {nar.heat}
                        </span>
                        {count > 0 && (
                          <span
                            className="text-[8px] font-bold px-1 py-0.5 rounded"
                            style={{ background: nar.color + "1e", color: nar.color }}
                          >
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Heat bar */}
                    <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(nar.heatLevel / 5) * 100}%`,
                          background: nar.color,
                          boxShadow: nar.heatLevel >= 4 ? `0 0 8px ${nar.color}80` : undefined,
                        }}
                      />
                    </div>
                  </button>

                  {/* Star toggle — shows on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWatch(nar.id); }}
                    className={cn(
                      "absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded transition-all duration-[80ms]",
                      isWatched
                        ? "opacity-100 text-[#fbbf24]"
                        : "opacity-0 group-hover/row:opacity-100 text-[#3a3a58] hover:text-[#fbbf24]",
                    )}
                    title={isWatched ? "Unwatch narrative" : "Watch narrative"}
                  >
                    <Star
                      size={10}
                      className={cn(isWatched && "fill-[#fbbf24]")}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Tokens */}
        {trending.length > 0 && (
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-[#2e2e48] mb-3">
              Trending
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {trending.map(([tok, { count, color }]) => (
                <span
                  key={tok}
                  className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full font-mono"
                  style={{ background: color + "18", color }}
                >
                  {tok}
                  <span className="opacity-40 text-[7px]">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data Sources */}
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-[#2e2e48] mb-3">
            Data Sources
          </h4>
          <div className="space-y-2">
            {[
              { name: "DeFiLlama",    color: "#27C96A", status: "live"      },
              { name: "CoinGecko",    color: "#27C96A", status: "live"      },
              { name: "Whale Events", color: "#F5A623", status: "simulated" },
            ].map((src) => (
              <div key={src.name} className="flex items-center justify-between">
                <span className="text-[10px] text-[#3a3a58]">{src.name}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1 h-1 rounded-full animate-pulse"
                    style={{ background: src.color }}
                  />
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: src.color }}
                  >
                    {src.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Narrative Summary ────────────────────────────────────────────────────────

function NarrativeSummary({ narrative }: { narrative: Narrative }) {
  const heatColor = HEAT_COLORS[narrative.heat];
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: narrative.color + "30", background: narrative.color + "07" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-[13px] font-black text-white uppercase tracking-wide">{narrative.label}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                narrative.heat === "EXPLODING" && "animate-pulse",
              )}
              style={{ background: heatColor + "22", color: heatColor }}
            >
              {narrative.heat}
            </span>
            <span className="text-[10px] text-[#3a3a55]">Level {narrative.heatLevel}/5</span>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end flex-shrink-0">
          {narrative.tokens.map((t) => (
            <span
              key={t}
              className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono"
              style={{ background: narrative.color + "18", color: narrative.color }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-[#68688a] leading-relaxed">{narrative.summary}</p>
    </div>
  );
}

// ─── Proactive Atlas Insights ─────────────────────────────────────────────────

const ATLAS_INSIGHTS = [
  "RWA tokenization is growing 4× faster than DeFi did in 2020. LINK is the most undervalued infrastructure asset — $51T in value secured at an $8.7B market cap.",
  "AI×Crypto convergence is accelerating. TAO and RNDR are the two clearest plays: TAO for model ownership, RNDR for the compute infrastructure that runs them.",
  "Institutional money is flowing into regulated DeFi — ONDO's T-bill product has $340M TVL in 90 days. The RWA narrative is early innings.",
  "Stablecoin perp DEX volume just hit ATH. HYPE and JUP are splitting the market — HYPE on perpetuals, JUP on spot. Watch for the next catalyst.",
  "DeepSeek's efficiency breakthrough matters for crypto: if frontier AI gets 10× cheaper, inference demand patterns shift — decentralized GPU networks benefit from more total usage.",
  "Three narratives heating simultaneously (RWA, AI×Crypto, DePIN) is rare. Last time two heated at once was March 2024 — BTC ran 40% in 30 days.",
];

function AtlasInsightCard({ insight, onDismiss }: { insight: string; onDismiss: () => void }) {
  return (
    <div className="rounded-xl px-4 py-3 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #00DCC808, #00DCC814)", border: "1px solid #00DCC828" }}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <Bot size={12} style={{ color: "#00DCC8" }} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#00DCC8" }}>Atlas Insight</span>
        </div>
        <p className="text-[12px] text-[#8b949e] leading-relaxed flex-1">{insight}</p>
        <button onClick={onDismiss} className="shrink-0 mt-0.5" style={{ color: "#484f58" }}>
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function SignalFeedInner() {
  const searchParams = useSearchParams();
  const [signals, setSignals] = useState<Signal[]>(SEED_SIGNALS);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [activeNarrative, setActiveNarrative] = useState<string | null>(() => searchParams.get("narrative"));
  const [myNarrativesActive, setMyNarrativesActive] = useState(false);
  const [watched, setWatched] = useState<string[]>([]);
  const [feedDomain, setFeedDomain] = useState<"crypto" | "ai" | "both">("both");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingSignals, setPendingSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [allSignals, setAllSignals] = useState<Signal[]>([...SEED_SIGNALS]);
  const [historySearch, setHistorySearch] = useState("");
  const [atlasInsight, setAtlasInsight] = useState<string | null>(null);
  const insightIdxRef = useRef(0);
  const livePoolIdx = useRef(0);
  const mountedRef = useRef(true);
  const signalsRef = useRef(signals);

  // Keep signalsRef in sync so fetchFeed always reads fresh signals without stale closure
  useEffect(() => { signalsRef.current = signals; }, [signals]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Load watched from localStorage on mount
  useEffect(() => {
    setWatched(getWatched());
  }, []);

  const toggleWatch = useCallback((id: string) => {
    setWatched((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
  }, []);

  // Persist watched to localStorage whenever it changes
  const watchedStr = watched.join(",");
  useEffect(() => {
    persistWatched(watched);
  }, [watchedStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // Proactive Atlas insights — show one on load, rotate every 10 mins
  useEffect(() => {
    const idx = Math.floor(Math.random() * ATLAS_INSIGHTS.length);
    insightIdxRef.current = idx;
    setAtlasInsight(ATLAS_INSIGHTS[idx]);
    const timer = setInterval(() => {
      insightIdxRef.current = (insightIdxRef.current + 1) % ATLAS_INSIGHTS.length;
      setAtlasInsight(ATLAS_INSIGHTS[insightIdxRef.current]);
    }, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) return;
      const { prices: p } = await res.json();
      if (mountedRef.current) setPrices(p);
    } catch {}
  }, []);

  // fetchFeed no longer closes over `signals` — uses signalsRef for stale-free reads
  const fetchFeed = useCallback(async (showLoading = false) => {
    if (showLoading && mountedRef.current) setIsLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (!res.ok) return;
      const { signals: fresh, fetchedAt } = await res.json();
      if (!fresh?.length || !mountedRef.current) return;

      const current = signalsRef.current;
      const oldest = current[current.length - 1]?.timestamp ?? 0;
      const reallyNew = (fresh as Signal[]).filter(
        (s) => s.timestamp > oldest && !current.some((ex) => ex.id === s.id)
      );

      if (reallyNew.length > 0) {
        setPendingSignals((prev) => [...reallyNew, ...prev]);
        setPendingCount((c) => c + reallyNew.length);
      } else {
        setSignals((prev) => {
          const merged = [...fresh, ...prev];
          const seen = new Set<string>();
          return merged
            .filter((s: Signal) => {
              if (seen.has(s.id)) return false;
              seen.add(s.id);
              return true;
            })
            .slice(0, 80);
        });
      }
      setLastFetch(fetchedAt);
    } catch {}
    finally { if (mountedRef.current) setIsLoading(false); }
  }, []); // stable — no signals in closure

  // First live signal after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      const sig: Signal = {
        ...LIVE_SIGNAL_POOL[livePoolIdx.current % LIVE_SIGNAL_POOL.length],
        id: `live-${Date.now()}`,
        timestamp: Date.now(),
      };
      livePoolIdx.current++;
      setPendingSignals((prev) => [sig, ...prev]);
      setPendingCount((c) => c + 1);
    }, 8_000);
    return () => clearTimeout(t);
  }, []);

  // Periodic signal injection loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        const sig: Signal = {
          ...LIVE_SIGNAL_POOL[livePoolIdx.current % LIVE_SIGNAL_POOL.length],
          id: `live-${Date.now()}`,
          timestamp: Date.now(),
        };
        livePoolIdx.current++;
        setPendingSignals((prev) => [sig, ...prev]);
        setPendingCount((c) => c + 1);
        loop();
      }, 18_000 + Math.random() * 10_000);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchFeed(true);
    const priceInterval = setInterval(fetchPrices, 30_000);
    const feedInterval  = setInterval(() => fetchFeed(false), 60_000);
    return () => {
      clearInterval(priceInterval);
      clearInterval(feedInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showPending = () => {
    const ids = new Set(pendingSignals.map((s) => s.id));
    setSignals((prev) => {
      const merged = [...pendingSignals, ...prev];
      const seen = new Set<string>();
      return merged
        .filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        })
        .slice(0, 80);
    });
    setAllSignals((prev) => {
      const merged = [...pendingSignals, ...prev];
      const seen = new Set<string>();
      return merged.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
    });
    setNewIds(ids);
    setPendingSignals([]);
    setPendingCount(0);
    setTimeout(() => setNewIds(new Set()), 3000);
  };

  const filtered = signals
    .filter((s) => {
      if (myNarrativesActive) return watched.includes(s.narrativeId);
      if (activeNarrative) return s.narrativeId === activeNarrative;
      return true;
    })
    .filter((s) => {
      if (feedDomain === "both") return true;
      if (feedDomain === "crypto") return !s.domain || s.domain === "crypto";
      if (feedDomain === "ai") return s.domain === "ai" || s.domain === "both";
      return true;
    });

  const signalCounts = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.narrativeId] = (acc[s.narrativeId] ?? 0) + 1;
    return acc;
  }, {});

  const activeNarrativeObj = activeNarrative && !myNarrativesActive
    ? NARRATIVES.find((n) => n.id === activeNarrative) ?? null
    : null;

  return (
    <div className="flex flex-col h-full bg-[#07070d]">
      {/* Price ticker */}
      {prices.length > 0 && <PriceTicker prices={prices} />}

      {/* Domain tabs */}
      <DomainTabs active={feedDomain} onChange={setFeedDomain} />

      {/* Narrative filter bar + history toggle */}
      <div className="relative">
        <NarrativeBar
          active={activeNarrative}
          onSelect={setActiveNarrative}
          signalCounts={signalCounts}
          myNarrativesActive={myNarrativesActive}
          onMyNarrativesToggle={() => setMyNarrativesActive((v) => !v)}
          feedDomain={feedDomain}
        />
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all"
          style={
            showHistory
              ? { background: "#7c6af720", color: "#7c6af7" }
              : { color: "#484f58" }
          }
        >
          <Clock size={11} />
          HISTORY
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_240px]">

        {/* Feed column */}
        <div className="overflow-y-auto">
          {showHistory ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#6e7681]">
                  Signal History
                  <span className="ml-2 text-[10px] text-[#484f58] font-normal normal-case tracking-normal">
                    {allSignals.length} signals this session
                  </span>
                </h3>
              </div>
              <input
                placeholder="Search history..."
                className="w-full rounded-lg px-3 py-2 text-sm mb-4 outline-none"
                style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3" }}
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
              <div className="space-y-1.5">
                {allSignals
                  .filter(
                    (s) =>
                      !historySearch ||
                      s.headline.toLowerCase().includes(historySearch.toLowerCase()) ||
                      s.narrativeLabel.toLowerCase().includes(historySearch.toLowerCase())
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg px-3 py-2 border"
                      style={{ background: "#161b22", borderColor: "#21262d" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: s.narrativeColor + "18",
                            color: s.narrativeColor,
                          }}
                        >
                          {s.narrativeLabel}
                        </span>
                        <span className="text-[9px] text-[#484f58] ml-auto flex-shrink-0" suppressHydrationWarning>
                          {timeAgo(s.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8b949e] line-clamp-1">{s.headline}</p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
          <div className="max-w-[720px] mx-auto px-4 py-4 space-y-2.5">

            {/* Pending banner */}
            {pendingCount > 0 && (
              <button
                onClick={showPending}
                className="relative w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl overflow-hidden text-[12px] font-bold transition-all hover:scale-[1.005] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #00DCC809, #00DCC814)",
                  border: "1px solid #00DCC828",
                  color: "#00DCC8",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="relative flex flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-ping absolute opacity-75" />
                    <span className="w-2 h-2 rounded-full bg-[#00DCC8]" />
                  </span>
                  {pendingCount} new signal{pendingCount > 1 ? "s" : ""} — tap to load
                </span>
              </button>
            )}

            {/* Atlas proactive insight */}
            {atlasInsight && !activeNarrativeObj && (
              <AtlasInsightCard insight={atlasInsight} onDismiss={() => setAtlasInsight(null)} />
            )}

            {/* Narrative summary */}
            {activeNarrativeObj && <NarrativeSummary narrative={activeNarrativeObj} />}

            {/* Loading state */}
            {isLoading && signals.length === SEED_SIGNALS.length && (
              <div className="flex items-center gap-2 text-[11px] text-[#2e2e48] py-2 px-1">
                <RefreshCw size={11} className="animate-spin" />
                Fetching live intelligence from DeFiLlama...
              </div>
            )}

            {/* Signal cards */}
            {filtered.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                isNew={newIds.has(signal.id)}
              />
            ))}

            {filtered.length === 0 && !isLoading && (
              myNarrativesActive && watched.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "#fbbf2414", border: "1px solid #fbbf2430" }}
                  >
                    <Star size={20} className="text-[#fbbf24]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[#6e7681] mb-1">Your feed is empty</p>
                    <p className="text-[11px] text-[#484f58] max-w-[260px] leading-relaxed">
                      Star any narrative in the right panel to track its signals here — or explore the full ecosystem map.
                    </p>
                  </div>
                  <Link
                    href="/scope"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all"
                    style={{ background: "#7c6af718", color: "#7c6af7", border: "1px solid #7c6af730" }}
                  >
                    <Globe size={11} />
                    Explore The Scope
                  </Link>
                </div>
              ) : (
                <div className="text-center py-16 text-[#484f58] text-[12px]">
                  No signals for this narrative yet.
                </div>
              )
            )}

            {lastFetch && (
              <p className="text-[10px] text-[#1a1a28] text-center py-4" suppressHydrationWarning>
                DeFiLlama · CoinGecko · Last sync {timeAgo(lastFetch)}
              </p>
            )}
          </div>
          )}
        </div>

        {/* Narrative heat panel */}
        <NarrativeHeatPanel
          signals={signals}
          activeNarrative={activeNarrative}
          onSelect={setActiveNarrative}
          watched={watched}
          onToggleWatch={toggleWatch}
          feedDomain={feedDomain}
        />
      </div>
    </div>
  );
}

export function SignalFeed() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#3a3a55] text-sm">Loading feed...</div>}>
      <SignalFeedInner />
    </Suspense>
  );
}
