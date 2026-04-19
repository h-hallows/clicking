"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { YieldPool } from "@/app/api/yield/route";
import {
  Zap, TrendingUp, TrendingDown, Shield,
  AlertTriangle, Search, SlidersHorizontal, RefreshCw,
  ArrowUpRight, Bot, Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTVL(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

function apyColor(apy: number): string {
  if (apy >= 30) return "#E879F9"; // magenta — high APY, distinct from red HIGH RISK badge
  if (apy >= 15) return "#F5A623";
  if (apy >= 8)  return "#fbbf24";
  if (apy >= 3)  return "#27C96A";
  return "#4A9EFF";
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627EEA", Arbitrum: "#12AAFF", Base: "#0052FF",
  Solana: "#9945FF", Polygon: "#8247E5", Avalanche: "#E84142",
  "BNB Chain": "#F3BA2F", Optimism: "#FF0420", zkSync: "#1E69FF",
};

const RISK_CONFIG = {
  low:    { label: "LOW RISK",  color: "#27C96A", icon: Shield },
  medium: { label: "MED RISK",  color: "#F5A623", icon: AlertTriangle },
  high:   { label: "HIGH RISK", color: "#FF3D57", icon: AlertTriangle },
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "ALL", stablecoin: "STABLES", eth: "ETH", btc: "BTC", lp: "LP", defi: "DEFI",
};

const SUPPORTED_CHAINS = ["All", "Ethereum", "Arbitrum", "Base", "Solana", "Polygon", "Avalanche"];

// ─── Pool Card ────────────────────────────────────────────────────────────────

function PoolCard({ pool, onAskAtlas }: { pool: YieldPool; onAskAtlas: (q: string) => void }) {
  const riskCfg = RISK_CONFIG[pool.risk];
  const RiskIcon = riskCfg.icon;
  const chainColor = CHAIN_COLORS[pool.chain] ?? "#6b6b80";
  const color = apyColor(pool.apy);

  return (
    <div
      className="group relative rounded-xl border border-white/[0.07] bg-[#09090f] overflow-hidden
                 hover:border-white/[0.14] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]
                 flex flex-col"
      style={{ background: `linear-gradient(135deg, #09090f 0%, ${color}08 100%)` }}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />

      {/* Trending badge */}
      {pool.trending && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#F5A62320] text-[#F5A623] animate-pulse">
          <TrendingUp size={8} />
          HOT
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Protocol + Chain */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4a4a68] mb-0.5">
              {pool.protocolName}
            </p>
            <h3 className="text-base font-black text-white leading-none">{pool.symbol}</h3>
          </div>
          <span
            className="text-[9px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: chainColor + "20", color: chainColor }}
          >
            {pool.chain}
          </span>
        </div>

        {/* APY — big and prominent */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tabular-nums" style={{ color }}>
              {pool.apy.toFixed(1)}%
            </span>
            <span className="text-[11px] text-[#4a4a68] font-semibold">APY</span>
            {pool.apyChange24h != null && (
              <span
                className="flex items-center gap-0.5 text-[9px] font-bold ml-1"
                style={{ color: pool.apyChange24h >= 0 ? "#27C96A" : "#FF3D57" }}
              >
                {pool.apyChange24h >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {pool.apyChange24h >= 0 ? "+" : ""}{pool.apyChange24h.toFixed(1)}%
              </span>
            )}
          </div>
          {(pool.apyBase > 0 || pool.apyReward > 0) && (
            <div className="flex items-center gap-2 mt-0.5">
              {pool.apyBase > 0 && (
                <span className="text-[10px] text-[#4a4a68]">Base {pool.apyBase.toFixed(1)}%</span>
              )}
              {pool.apyReward > 0 && (
                <>
                  <span className="text-[10px] text-[#2a2a3a]">+</span>
                  <span className="text-[10px] text-[#4a4a68]">Rewards {pool.apyReward.toFixed(1)}%</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="text-[9px] text-[#3a3a55] uppercase tracking-wide mb-0.5">TVL</p>
            <p className="text-[11px] font-bold text-[#8888a0]">{formatTVL(pool.tvl)}</p>
          </div>
          <div
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full"
            style={{ background: riskCfg.color + "18", color: riskCfg.color }}
          >
            <RiskIcon size={8} />
            {riskCfg.label}
          </div>
          {pool.stablecoin && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#27C96A12] text-[#27C96A]">
              STABLE
            </span>
          )}
          {pool.ilRisk && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#FF3D5712] text-[#FF3D57]">
              IL RISK
            </span>
          )}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex border-t border-white/[0.05] divide-x divide-white/[0.05]">
        <a
          href={pool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-white
                     hover:bg-white/[0.05] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Visit Pool
          <ArrowUpRight size={11} />
        </a>
        <button
          onClick={() => onAskAtlas(`Tell me about ${pool.symbol} on ${pool.protocolName} (${pool.chain}). APY is ${pool.apy}%. What are the risks?`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-[#a78bfa]
                     hover:bg-[#a78bfa0d] transition-colors"
        >
          <Bot size={11} />
          Ask Atlas
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PoolSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#09090f] overflow-hidden">
      <div className="h-[2px] w-full bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 rounded shimmer" />
            <div className="h-4 w-24 rounded shimmer" />
          </div>
          <div className="h-5 w-16 rounded-full shimmer" />
        </div>
        <div className="h-8 w-28 rounded shimmer" />
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full shimmer" />
          <div className="h-5 w-16 rounded-full shimmer" />
        </div>
      </div>
      <div className="h-10 border-t border-white/[0.05] shimmer" />
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ pools, loading }: { pools: YieldPool[]; loading: boolean }) {
  const stablePools = pools.filter((p) => p.stablecoin);
  const bestStable = stablePools.length > 0 ? Math.max(...stablePools.map((p) => p.apy)) : 0;
  const totalTVL = pools.reduce((a, p) => a + p.tvl, 0);
  const trending = pools.filter((p) => p.trending).length;

  const stats = [
    { label: "Best Stable APY",     value: loading ? "—" : `${bestStable.toFixed(1)}%`, color: "#27C96A" },
    { label: "Opportunities Live",  value: loading ? "—" : pools.length.toString(),     color: "#00DCC8" },
    { label: "Total Value Locked",  value: loading ? "—" : formatTVL(totalTVL),         color: "#a78bfa" },
    { label: "Trending Now",        value: loading ? "—" : trending.toString(),          color: "#F5A623" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/[0.07] bg-[#09090f] p-4"
          style={{ background: `linear-gradient(135deg, #09090f, ${s.color}08)` }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-[#3a3a55] mb-1">{s.label}</p>
          <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  category, setCategory,
  chain, setChain,
  search, setSearch,
  sort, setSort,
  count,
}: {
  category: string; setCategory: (v: string) => void;
  chain: string;    setChain: (v: string) => void;
  search: string;   setSearch: (v: string) => void;
  sort: string;     setSort: (v: string) => void;
  count: number;
}) {
  return (
    <div className="space-y-3 mb-6">
      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setCategory(k)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
              category === k
                ? "bg-[#fbbf2414] border-[#fbbf2460] text-[#fbbf24]"
                : "border-white/[0.06] text-[#3a3a55] hover:text-[#7878a0] hover:border-white/10"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Search + chain + sort row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-colors">
          <Search size={12} className="text-[#3a3a55] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pools, protocols..."
            className="flex-1 bg-transparent text-[12px] text-white placeholder-[#3a3a55] outline-none"
          />
        </div>

        {/* Chain filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {SUPPORTED_CHAINS.map((c) => (
            <button
              key={c}
              onClick={() => setChain(c === "All" ? "all" : c)}
              className={cn(
                "flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                chain === (c === "All" ? "all" : c)
                  ? "bg-white/[0.07] border-white/20 text-white"
                  : "border-white/[0.05] text-[#3a3a55] hover:text-[#6a6a8a] hover:border-white/08"
              )}
              style={
                chain === (c === "All" ? "all" : c) && CHAIN_COLORS[c]
                  ? { borderColor: CHAIN_COLORS[c] + "60", background: CHAIN_COLORS[c] + "12", color: CHAIN_COLORS[c] }
                  : {}
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <SlidersHorizontal size={11} className="text-[#3a3a55]" />
          {[
            { v: "tvl", label: "TVL" },
            { v: "apy", label: "APY" },
            { v: "trending", label: "Trending" },
          ].map((s) => (
            <button
              key={s.v}
              onClick={() => setSort(s.v)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                sort === s.v
                  ? "bg-white/[0.07] border-white/20 text-white"
                  : "border-white/[0.05] text-[#3a3a55] hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-[10px] text-[#2a2a3a]">
        {count} pool{count !== 1 ? "s" : ""} matching filters
      </p>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({ topPools, onAskAtlas }: { topPools: YieldPool[]; onAskAtlas: (q: string) => void }) {
  const [amount, setAmount] = useState("10000");
  const [days, setDays] = useState(365);

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 10000;

  const calcResults = topPools.slice(0, 3).map((p) => ({
    pool: p,
    earned: amountNum * (Math.pow(1 + p.apy / 100 / 365, days) - 1),
  }));

  return (
    <div className="space-y-4">
      {/* Quick Calculator */}
      <div className="rounded-xl border border-white/[0.07] bg-[#09090f] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Calculator size={12} className="text-[#fbbf24]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#fbbf24]">Quick Calculate</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a55] mb-1.5">Deposit Amount</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
              <span className="text-[#3a3a55] text-sm">$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 bg-transparent text-white text-sm font-bold outline-none tabular-nums"
              />
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {["1000", "5000", "10000", "50000"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className="flex-1 text-[9px] font-bold py-1 rounded bg-white/[0.04] text-[#4a4a68] hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  ${parseInt(v) >= 1000 ? `${parseInt(v) / 1000}K` : v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#3a3a55] mb-1.5">Timeframe</p>
            <div className="flex gap-1.5">
              {[30, 90, 182, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "flex-1 text-[9px] font-bold py-1.5 rounded transition-all",
                    days === d ? "bg-[#fbbf2418] text-[#fbbf24] border border-[#fbbf2440]" : "bg-white/[0.04] text-[#4a4a68] hover:text-white"
                  )}
                >
                  {d === 182 ? "6M" : d === 365 ? "1Y" : `${d}D`}
                </button>
              ))}
            </div>
          </div>

          {calcResults.length > 0 && (
            <div className="space-y-2">
              {calcResults.map(({ pool, earned }) => (
                <div key={pool.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                  <div>
                    <p className="text-[10px] font-bold text-[#6868a0]">{pool.protocolName} {pool.symbol}</p>
                    <p className="text-[9px] text-[#3a3a55]">{pool.apy.toFixed(1)}% APY</p>
                  </div>
                  <p className="text-[13px] font-black text-[#27C96A]">
                    +${earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atlas shortcuts */}
      <div className="rounded-xl border border-white/[0.07] bg-[#09090f] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Bot size={12} className="text-[#a78bfa]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#a78bfa]">Ask Atlas</span>
        </div>
        <div className="p-3 space-y-1.5">
          {[
            "What's the safest stablecoin yield right now?",
            "Explain impermanent loss in simple terms",
            "Compare Aave vs Morpho for USDC",
            "What are the best new yield opportunities this week?",
            "How does Pendle fixed-rate yield work?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => onAskAtlas(q)}
              className="w-full text-left text-[11px] text-[#5a5a78] hover:text-[#a78bfa] transition-colors py-1.5 px-2 rounded hover:bg-[#a78bfa0a] leading-snug"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* No custody disclaimer */}
      <div className="rounded-xl border border-white/[0.05] bg-[#07070d] p-4">
        <p className="text-[10px] text-[#3a3a48] leading-relaxed">
          <span className="text-[#4a4a68] font-bold">No custody. No accounts.</span>{" "}
          Clicking never holds your funds. All links go directly to the protocol. Always verify URLs before connecting your wallet.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function YieldDiscoveryInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const [category, setCategory] = useState(() => searchParams.get("cat") ?? "all");
  const [chain, setChain] = useState("all");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? "tvl");
  const [visibleCount, setVisibleCount] = useState(60);

  // Track mount state for async fetch safety
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch live pools
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/yield");
        if (!res.ok) return;
        const { pools: p, fetchedAt } = await res.json();
        if (!mountedRef.current) return;
        setPools(p ?? []);
        setLastFetch(fetchedAt);
      } catch {}
      finally { if (mountedRef.current) setLoading(false); }
    };
    load();
    const iv = setInterval(load, 90_000);
    return () => clearInterval(iv);
  }, []);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(60); }, [category, chain, search, sort]);

  // Filter + sort (no hard cap — pagination handles it)
  const filtered = useMemo(() => {
    let list = [...pools];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (chain !== "all") list = list.filter((p) => p.chain === chain);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.symbol.toLowerCase().includes(q) || p.protocolName.toLowerCase().includes(q)
      );
    }
    if (sort === "apy") list.sort((a, b) => b.apy - a.apy);
    else if (sort === "trending") list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.apy - a.apy);
    else list.sort((a, b) => b.tvl - a.tvl);
    return list;
  }, [pools, category, chain, search, sort]);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const topPools = useMemo(
    () => [...pools].sort((a, b) => b.tvl - a.tvl).slice(0, 3),
    [pools]
  );

  const handleAskAtlas = (q: string) => {
    router.push(`/atlas?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Hero */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-[#fbbf24]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24]">Yield Discovery</span>
            {lastFetch && (
              <span className="flex items-center gap-1 text-[9px] text-[#27C96A] ml-auto" suppressHydrationWarning>
                <span className="w-1 h-1 rounded-full bg-[#27C96A] animate-pulse" />
                Live · Updated {Math.round((Date.now() - lastFetch) / 1000)}s ago
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Find your next yield.</h1>
          <p className="text-[13px] text-[#5a5a78]">
            Browse {pools.length > 0 ? pools.length + "+" : "hundreds of"} live pools across every chain.
            No accounts. No custody. Just opportunities.
          </p>
        </div>

        {/* Stats */}
        <StatsBar pools={pools} loading={loading} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          <div>
            <FilterBar
              category={category} setCategory={setCategory}
              chain={chain} setChain={setChain}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              count={filtered.length}
            />

            {/* Pool grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <PoolSkeleton key={i} />)
                : displayed.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onAskAtlas={handleAskAtlas} />
                  ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#3a3a55] text-sm">No pools match your filters.</p>
                <button
                  onClick={() => { setCategory("all"); setChain("all"); setSearch(""); }}
                  className="mt-3 text-[11px] text-[#fbbf24] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Load more */}
            {!loading && hasMore && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-[11px] text-[#484f58]">
                  Showing {displayed.length} of {filtered.length} pools
                </span>
                <button
                  onClick={() => setVisibleCount((v) => v + 60)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all hover:opacity-90"
                  style={{ background: "#fbbf2418", color: "#fbbf24", border: "1px solid #fbbf2430" }}
                >
                  Load 60 more
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
              <p className="text-[10px] text-[#484f58]">
                Data via DeFiLlama · Updated every 90s
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetch("/api/yield?bust=" + Date.now())
                    .then((r) => r.json())
                    .then(({ pools: p, fetchedAt }) => {
                      if (!mountedRef.current) return;
                      setPools(p ?? []);
                      setLastFetch(fetchedAt);
                    })
                    .finally(() => { if (mountedRef.current) setLoading(false); });
                }}
                className="flex items-center gap-1.5 text-[10px] text-[#3a3a55] hover:text-white transition-colors"
              >
                <RefreshCw size={10} />
                Refresh
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden xl:block">
            <div className="sticky top-4">
              <RightPanel topPools={topPools} onAskAtlas={handleAskAtlas} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function YieldDiscovery() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#3a3a55] text-sm">Loading yield data...</div>}>
      <YieldDiscoveryInner />
    </Suspense>
  );
}
