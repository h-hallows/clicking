"use client";

import { useState, useCallback } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { GlossaryTooltip } from "@/components/ui/GlossaryTooltip";

const APY_SAFE = 5.8;
const APY_BANK = 0.4;

const PRESETS = [500, 2000, 5000, 10000, 50000];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

function fmtFull(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function YieldPhase0() {
  const [amount, setAmount] = useState(5000);
  const [inputVal, setInputVal] = useState("5000");

  const cryptoYearlyEarnings  = (amount * APY_SAFE) / 100;
  const bankYearlyEarnings    = (amount * APY_BANK) / 100;
  const monthlyDiff           = (cryptoYearlyEarnings - bankYearlyEarnings) / 12;
  const yearlyDiff            = cryptoYearlyEarnings - bankYearlyEarnings;

  const handleInput = useCallback((val: string) => {
    setInputVal(val);
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (!isNaN(n) && n >= 0) setAmount(n);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#161b22", border: "1px solid #21262d" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} style={{ color: "#00DCC8" }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#00DCC8" }}>Yield Opportunity</span>
        </div>
        <h2 className="text-lg font-black text-[#e6edf3]">Your USDC is sitting idle.</h2>
        <p className="text-sm text-[#6e7681] mt-0.5">Here's what it could be earning right now.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
        {/* Left: input */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-[#484f58] block mb-3">
            How much idle USDC do you have?
          </label>

          {/* Preset chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { setAmount(p); setInputVal(String(p)); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: amount === p ? "#00DCC820" : "#0d0e12",
                  color: amount === p ? "#00DCC8" : "#6e7681",
                  border: `1px solid ${amount === p ? "#00DCC840" : "#21262d"}`,
                }}
              >
                {fmt(p)}
              </button>
            ))}
          </div>

          {/* Manual input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6e7681]">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={e => handleInput(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-lg text-sm font-bold text-[#e6edf3] outline-none"
              style={{ background: "#0d0e12", border: "1px solid #30363d" }}
              placeholder="Enter amount"
            />
          </div>

          {/* APY comparison note */}
          <div className="mt-3 p-3 rounded-lg text-[11px] space-y-1" style={{ background: "#0d0e12" }}>
            <div className="flex justify-between">
              <span className="text-[#484f58]">Safe crypto yield (Aave/Compound)</span>
              <span className="font-black" style={{ color: "#00DCC8" }}>{APY_SAFE}% <GlossaryTooltip term="APY">APY</GlossaryTooltip></span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#484f58]">Average bank savings account</span>
              <span className="font-black text-[#484f58]">{APY_BANK}% <GlossaryTooltip term="APY">APY</GlossaryTooltip></span>
            </div>
          </div>
        </div>

        {/* Right: projections */}
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-3">
            {amount > 0 ? `Projections for ${amount >= 1000 ? "$" + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + "k" : "$" + amount}` : "Projections"}
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* DeFi */}
            <div className="rounded-xl p-4" style={{ background: "#0d0e12", border: "1px solid #00DCC830" }}>
              <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "#00DCC8" }}>Crypto (Safe Tier)</div>
              <div className="text-xl font-black text-[#e6edf3]">${fmtFull(cryptoYearlyEarnings)}</div>
              <div className="text-[10px] text-[#6e7681] mt-0.5">per year</div>
              <div className="text-[11px] font-bold mt-2" style={{ color: "#00DCC8" }}>
                ${fmtFull(cryptoYearlyEarnings / 12)}/mo
              </div>
            </div>

            {/* Bank */}
            <div className="rounded-xl p-4" style={{ background: "#0d0e12", border: "1px solid #21262d" }}>
              <div className="text-[9px] font-black uppercase tracking-widest text-[#484f58] mb-2">Bank Savings</div>
              <div className="text-xl font-black text-[#484f58]">${fmtFull(bankYearlyEarnings)}</div>
              <div className="text-[10px] text-[#484f58] mt-0.5">per year</div>
              <div className="text-[11px] font-bold text-[#484f58] mt-2">
                ${fmtFull(bankYearlyEarnings / 12)}/mo
              </div>
            </div>
          </div>

          {/* Difference highlight */}
          <div className="rounded-xl p-3 text-center" style={{ background: "linear-gradient(135deg, #00DCC810, #00DCC820)", border: "1px solid #00DCC830" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6e7681] mb-1">You're leaving on the table</div>
            <div className="text-2xl font-black" style={{ color: "#00DCC8" }}>+${fmtFull(yearlyDiff)}/yr</div>
            <div className="text-[11px] text-[#6e7681]">(${fmtFull(monthlyDiff)}/month)</div>
          </div>

          {/* CTA */}
          <button
            onClick={() => document.getElementById("yield-pool-browser")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:opacity-90"
            style={{ background: "#00DCC8", color: "#0d0e12" }}
          >
            Browse live yield pools <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
