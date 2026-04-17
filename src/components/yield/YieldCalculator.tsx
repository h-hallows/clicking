"use client";

import { useState, useMemo, useRef } from "react";
import { RISK_CONFIG, RiskLevel } from "@/lib/yield-data";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface YieldCalcProps {
  activeRisk: RiskLevel;
}

const PERIODS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 182 },
  { label: "1 year", days: 365 },
];

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function YieldCalculator({ activeRisk }: YieldCalcProps) {
  const [deposit, setDeposit] = useState("10000");
  const [customApy, setCustomApy] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const riskCfg = RISK_CONFIG[activeRisk];

  // Derive APY from risk level or custom
  const apyMin = parseFloat(riskCfg.apyRange.split("–")[0]) || 8;
  const apyMax = parseFloat(riskCfg.apyRange.split("–")[1]?.replace("+", "")) || apyMin * 2;
  const midApy = customApy ?? ((apyMin + apyMax) / 2);

  const depositNum = parseFloat(deposit.replace(/,/g, "")) || 0;

  const results = useMemo(() =>
    PERIODS.map(({ label, days }) => {
      const rate = midApy / 100;
      // Compound daily
      const earned = depositNum * (Math.pow(1 + rate / 365, days) - 1);
      const total = depositNum + earned;
      return { label, days, earned, total };
    }),
  [depositNum, midApy]);

  const bestResult = results[results.length - 1];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center gap-3"
        style={{ borderColor: "#21262d", background: `linear-gradient(135deg, #161b22 0%, ${riskCfg.color}08 100%)` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: riskCfg.color + "20", color: riskCfg.color }}
        >
          <Calculator size={15} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Yield Calculator</p>
          <p className="text-[11px] text-[#6e7681]">Project your earnings at current rates</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Deposit input */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6e7681] block mb-2">
            Deposit Amount
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              type="text"
              value={deposit}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setDeposit(raw ? Number(raw).toLocaleString() : "");
              }}
              placeholder="10,000"
              className="w-full rounded-lg pl-8 pr-4 py-2.5 text-sm font-semibold text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
              style={{ background: "#0d0e12", border: "1px solid #30363d" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#484f58"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#30363d"}
            />
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mt-2">
            {[1000, 5000, 10000, 50000].map((amt) => (
              <button
                key={amt}
                onClick={() => setDeposit(amt.toLocaleString())}
                className="flex-1 py-1 rounded-md text-[10px] font-semibold bg-white/[0.04] text-[#6e7681] hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                ${amt >= 1000 ? `${amt / 1000}K` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* APY selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6e7681]">
              Target APY
            </label>
            <span className="text-sm font-black" style={{ color: riskCfg.color }}>
              {midApy.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            {showTooltip && (
              <div
                className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-black text-white pointer-events-none z-10 -translate-x-1/2"
                style={{
                  backgroundColor: riskCfg.color,
                  left: `${(((customApy ?? midApy) - apyMin) / (Math.min(apyMax, 80) - apyMin)) * 100}%`,
                }}
              >
                {(customApy ?? midApy).toFixed(1)}%
              </div>
            )}
            <input
              ref={sliderRef}
              type="range"
              min={apyMin}
              max={Math.min(apyMax, 80)}
              step={0.5}
              value={customApy ?? midApy}
              onChange={(e) => setCustomApy(parseFloat(e.target.value))}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onMouseDown={() => setShowTooltip(true)}
              onMouseUp={() => setShowTooltip(false)}
              onTouchStart={() => setShowTooltip(true)}
              onTouchEnd={() => setShowTooltip(false)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${riskCfg.color} 0%, ${riskCfg.color} ${
                  (((customApy ?? midApy) - apyMin) / (Math.min(apyMax, 80) - apyMin)) * 100
                }%, #ffffff15 ${
                  (((customApy ?? midApy) - apyMin) / (Math.min(apyMax, 80) - apyMin)) * 100
                }%, #ffffff15 100%)`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#484f58] mt-1">
            <span>{apyMin}% (low)</span>
            <span>{Math.min(apyMax, 80)}%+ (max)</span>
          </div>
        </div>

        {/* Results grid */}
        {depositNum > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#484f58] mb-3 flex items-center gap-1.5">
              <TrendingUp size={10} style={{ color: riskCfg.color }} />
              Projected Returns (compounded daily)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {results.map(({ label, earned, total }, i) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg p-3 border transition-all",
                    i === results.length - 1
                      ? "border-opacity-40 col-span-2"
                      : "border-white/[0.06] bg-white/[0.02]"
                  )}
                  style={
                    i === results.length - 1
                      ? { borderColor: riskCfg.color + "40", backgroundColor: riskCfg.color + "08" }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6e7681] flex items-center gap-1">
                      <Clock size={9} />
                      {label}
                    </span>
                    {i === results.length - 1 && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: riskCfg.color + "20", color: riskCfg.color }}
                      >
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white">{formatUSD(total)}</div>
                  <div className="text-[11px] font-semibold" style={{ color: riskCfg.color }}>
                    +{formatUSD(earned)} yield
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 text-center text-[12px] text-[#484f58]">
            Enter a deposit amount to see your projected returns
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-[#484f58] leading-relaxed">
          Estimates assume constant APY and daily compounding. Actual returns vary. Not financial advice.
        </p>
      </div>
    </div>
  );
}
