"use client";

import { STRATEGIES, RISK_CONFIG, RiskLevel, YieldStrategy } from "@/lib/yield-data";
import { ShieldCheck, TrendingUp, Clock, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StrategyExplorerProps {
  activeRisk: RiskLevel;
}

export function StrategyExplorer({ activeRisk }: StrategyExplorerProps) {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const displayed = filter === "all"
    ? STRATEGIES
    : STRATEGIES.filter((s) => s.risk === filter);

  // Highlight the active risk from hero
  const effectiveFilter = filter === "all" ? activeRisk : filter;

  return (
    <div>
      {/* Header + filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Audited Strategies</h3>
          <p className="text-xs text-[#6e7681] mt-0.5">
            {displayed.length} strategies available — all audited, all non-custodial
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              filter === "all"
                ? "bg-[#7c6af720] text-[#7c6af7]"
                : "bg-[#21262d] text-[#6e7681] hover:text-white"
            )}
          >
            All
          </button>
          {(Object.keys(RISK_CONFIG) as RiskLevel[]).map((level) => {
            const cfg = RISK_CONFIG[level];
            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize",
                  filter === level
                    ? "text-white"
                    : "bg-[#21262d] text-[#6e7681] hover:text-white"
                )}
                style={filter === level ? { backgroundColor: cfg.color + "25", color: cfg.color } : {}}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategy cards */}
      <div className="space-y-3">
        {displayed.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isExpanded={expanded === strategy.id}
            isHighlighted={strategy.risk === effectiveFilter}
            onToggle={() => setExpanded(expanded === strategy.id ? null : strategy.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StrategyCard({
  strategy,
  isExpanded,
  isHighlighted,
  onToggle,
}: {
  strategy: YieldStrategy;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
}) {
  const riskCfg = RISK_CONFIG[strategy.risk];

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-200"
      )}
      style={isHighlighted
        ? { background: "#161b22", borderColor: riskCfg.color + "50" }
        : { background: "#161b22", borderColor: "#21262d" }}
    >
      {/* Main row */}
      <div
        className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
        onClick={onToggle}
      >
        {/* Protocol icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: strategy.protocolColor + "20", color: strategy.protocolColor }}
        >
          {strategy.protocol.slice(0, 2).toUpperCase()}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{strategy.name}</span>
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
              style={{ backgroundColor: riskCfg.color + "18", color: riskCfg.color }}
            >
              {riskCfg.label}
            </span>
            {strategy.audited && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#00e5a0]">
                <ShieldCheck size={10} />
                {strategy.auditor}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px]" style={{ color: strategy.protocolColor }}>
              {strategy.protocol}
            </span>
            <span className="text-[#484f58] text-[10px]">·</span>
            <span className="text-[11px] text-[#484f58]">{strategy.chain}</span>
            <span className="text-[#484f58] text-[10px]">·</span>
            <span className="text-[11px] text-[#484f58]">{strategy.asset}</span>
          </div>
        </div>

        {/* APY */}
        <div className="text-right flex-shrink-0 mr-2">
          <div className="text-lg font-black" style={{ color: "#3fb950" }}>
            {strategy.apy}%
          </div>
          <div className="text-[10px] text-[#484f58]">APY</div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 mr-2">
          <div className="text-right">
            <div className="text-xs font-semibold text-white">{strategy.tvl}</div>
            <div className="text-[10px] text-[#484f58]">TVL</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#00e5a0] justify-end">
              <Clock size={10} />
              {strategy.lockup}
            </div>
            <div className="text-[10px] text-[#484f58]">Lockup</div>
          </div>
        </div>

        {/* Expand */}
        <div className="text-[#484f58]">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t pt-4 space-y-4" style={{ borderColor: "#21262d" }}>
          <p className="text-xs text-[#6e7681] leading-relaxed">{strategy.description}</p>

          {/* APY breakdown */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#484f58] mb-2">
              APY Breakdown
            </p>
            <div className="space-y-1.5">
              {strategy.apyBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6e7681] w-28 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / strategy.apy) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold w-12 text-right" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags + min deposit */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {strategy.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#21262d] text-[#6e7681]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-[#484f58]">
              Min deposit: <span className="text-white font-semibold">{strategy.minDeposit}</span>
            </div>
          </div>

          {/* CTA */}
          <a
            href={strategy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: riskCfg.color + "20", color: riskCfg.color, border: `1px solid ${riskCfg.color}30` }}
          >
            Deposit into {strategy.name}
            <ArrowRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
