"use client";

import { useRef, useEffect, useCallback } from "react";
import { CATEGORY_CONFIG, CHAINS_LIST, NodeCategory, NODES } from "@/lib/ecosystem-data";
import { useScopeStore } from "@/store/scope-store";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = Object.entries(CATEGORY_CONFIG) as [
  NodeCategory,
  (typeof CATEGORY_CONFIG)[NodeCategory]
][];

// Count protocols per category
const catCounts = Object.fromEntries(
  (Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map((cat) => [
    cat,
    NODES.filter((n) => n.category === cat).length,
  ])
);

// Compute total TVL from node data
function formatTotalTVL(totalM: number): string {
  if (totalM >= 1000) return `$${(totalM / 1000).toFixed(0)}B+`;
  return `$${totalM.toFixed(0)}M+`;
}
const totalTVLMillion = NODES.reduce((sum, n) => sum + (n.tvlNum ?? 0), 0);
const totalTVLLabel = formatTotalTVL(totalTVLMillion);

const TIME_FILTERS = ["1H", "24H", "7D", "30D"] as const;

export function ScopeFilters() {
  const { activeCategories, activeChain, searchQuery, timeFilter, toggleCategory, setChain, setSearch, setTimeFilter } =
    useScopeStore();
  const searchRef = useRef<HTMLInputElement>(null);

  // `/` key focuses the search input
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <aside className="w-[210px] flex-shrink-0 border-r overflow-y-auto flex flex-col" style={{ borderColor: "#21262d", background: "#0d0e12" }}>
      {/* Time filter */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#484f58]">Activity Window</span>
          <div className="flex items-center gap-0.5">
            {TIME_FILTERS.map((tf) => {
              const isActive = timeFilter === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-black rounded-md transition-all",
                    isActive
                      ? "bg-[#00DCC820] text-[#00DCC8]"
                      : "text-[#484f58] hover:text-[#6e7681]"
                  )}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-[9px] text-[#30363d]">
          {timeFilter === "1H" && "Hot nodes highlighted · recent signals"}
          {timeFilter === "24H" && "Default view · 24h TVL activity"}
          {timeFilter === "7D" && "Weekly momentum · broader context"}
          {timeFilter === "30D" && "Monthly trends · macro narrative flow"}
        </p>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 border-b" style={{ borderColor: "#21262d" }}>
        <div className="relative flex items-center">
          <Search size={11} className="absolute left-2.5 text-[#484f58] pointer-events-none" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search protocols... (/)"
            className="w-full rounded-lg pl-7 pr-7 py-2 text-[11px] text-[#e6edf3] placeholder-[#484f58] outline-none transition-all"
            style={{ background: "#161b22", border: "1px solid #30363d" }}
            onFocus={e => (e.target as HTMLElement).style.borderColor = "#7c6af750"}
            onBlur={e => (e.target as HTMLElement).style.borderColor = "#30363d"}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearch(""); searchRef.current?.focus(); }}
              className="absolute right-2.5 text-[#6b6b80] hover:text-white transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484f58]">
              Category
            </p>
            <button
              onClick={() => {
                const allActive = categories.every(([cat]) => activeCategories.includes(cat));
                if (allActive) {
                  categories.forEach(([cat]) => {
                    if (activeCategories.includes(cat)) toggleCategory(cat);
                  });
                } else {
                  categories.forEach(([cat]) => {
                    if (!activeCategories.includes(cat)) toggleCategory(cat);
                  });
                }
              }}
              className="text-[9px] text-[#4a4a5a] hover:text-[#7c6af7] transition-colors"
            >
              {categories.every(([cat]) => activeCategories.includes(cat)) ? "none" : "all"}
            </button>
          </div>
          <div className="space-y-0.5">
            {categories.map(([cat, config]) => {
              const isActive = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all duration-[80ms] text-left group",
                    isActive
                      ? "text-[#e6edf3]"
                      : "text-[#6e7681] hover:text-[#8b949e] hover:bg-[#161b22]"
                  )}
                  style={isActive ? { backgroundColor: config.color + "14" } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: config.color,
                      opacity: isActive ? 1 : 0.35,
                      boxShadow: isActive ? `0 0 6px ${config.color}` : "none",
                    }}
                  />
                  <span className="flex-1 truncate">{config.label}</span>
                  <span
                    className="text-[9px] tabular-nums flex-shrink-0 opacity-50"
                    style={{ color: isActive ? config.color : undefined }}
                  >
                    {catCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chains */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#4a4a5a] mb-2.5">
            Chain
          </p>
          <div className="space-y-0.5">
            {CHAINS_LIST.map((chain) => {
              const isActive = activeChain === chain.id;
              return (
                <button
                  key={chain.id}
                  onClick={() => setChain(chain.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all text-left",
                    isActive
                      ? "bg-[#7c6af7]/15 text-white"
                      : "text-[#4a4a5a] hover:text-[#8888a0] hover:bg-white/[0.03]"
                  )}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] flex-shrink-0" style={{ boxShadow: "0 0 6px #7c6af7" }} />
                  )}
                  {!isActive && <span className="w-1.5 h-1.5 flex-shrink-0" />}
                  {chain.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-white/[0.06] space-y-2.5">
        <StatRow label="Protocols"  value={`${NODES.length}`}                                  color="#818cf8" />
        <StatRow label="Categories" value={`${Object.keys(CATEGORY_CONFIG).length}`}          color="#22d3ee" />
        <StatRow label="Total TVL"  value={totalTVLLabel}                                     color="#34d399" />
      </div>
    </aside>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-[#4a4a5a]">{label}</span>
      <span className="text-[10px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
