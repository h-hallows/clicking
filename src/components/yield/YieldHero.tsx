"use client";

import { useState } from "react";
import { RISK_CONFIG, RiskLevel } from "@/lib/yield-data";
import { Wallet, SlidersHorizontal, Zap, ArrowDownToLine, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/wallet/WalletConnectModal";

const STEPS = [
  { n: 1, icon: Wallet,             label: "Connect Wallet",  sub: "Non-custodial. Your keys, always." },
  { n: 2, icon: SlidersHorizontal,  label: "Set Risk + APR",  sub: "Choose your comfort level."        },
  { n: 3, icon: Zap,                label: "Atlas Routes",    sub: "Auto-routes to audited farms."     },
  { n: 4, icon: ArrowDownToLine,    label: "Earn & Withdraw", sub: "Anytime. No lockups."              },
];

interface YieldHeroProps {
  onRiskSelect: (risk: RiskLevel) => void;
  selectedRisk: RiskLevel;
}

export function YieldHero({ onRiskSelect, selectedRisk }: YieldHeroProps) {
  const [targetApy, setTargetApy] = useState(15);
  const riskConfig = RISK_CONFIG[selectedRisk];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header banner */}
      <div className="relative px-6 py-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, #161b22 0%, ${riskConfig.color}08 100%)` }}
      >
        {/* Glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ backgroundColor: riskConfig.color }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
              style={{ backgroundColor: riskConfig.color + "20", color: riskConfig.color }}>
              Non-custodial
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md text-[#6e7681]" style={{ background: "#21262d" }}>
              Atlas-powered
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Earn on idle capital.</h2>
          <p className="text-sm text-[#6e7681] max-w-md">
            Set your risk level and target APR. Atlas finds the best audited strategy and routes your stablecoins automatically.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-0">
          {STEPS.map(({ n, icon: Icon, label, sub }, i) => (
            <div key={n} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5 flex-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: riskConfig.color + "20", color: riskConfig.color }}
                >
                  <Icon size={14} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-semibold text-white leading-none">{label}</p>
                  <p className="text-[10px] text-[#484f58] mt-0.5">{sub}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight size={12} className="text-[#30363d] mx-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk selector */}
        <div>
          <p className="text-xs font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Risk Level
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(RISK_CONFIG) as [RiskLevel, typeof RISK_CONFIG[RiskLevel]][]).map(([level, cfg]) => (
              <button
                key={level}
                onClick={() => onRiskSelect(level)}
                className={cn(
                  "rounded-xl p-3 border text-left transition-all duration-150",
                  selectedRisk === level
                    ? "border-opacity-100"
                    : "bg-transparent hover:border-[#30363d]"
                )}
                style={
                  selectedRisk === level
                    ? { borderColor: cfg.color, backgroundColor: cfg.bg }
                    : {}
                }
              >
                <p className="text-xs font-bold mb-1" style={{ color: cfg.color }}>
                  {cfg.label}
                </p>
                <p className="text-sm font-black text-white">{cfg.apyRange}</p>
                <p className="text-[10px] text-[#484f58] mt-1 leading-tight">
                  {cfg.description.split(".")[0]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* APR target + CTA */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#6e7681] uppercase tracking-widest">
                Target APY
              </p>
              <span className="text-lg font-black" style={{ color: riskConfig.color }}>
                {targetApy}%
              </span>
            </div>

            {/* Slider */}
            <div className="relative mb-2">
              <input
                type="range"
                min={4}
                max={60}
                value={targetApy}
                onChange={(e) => setTargetApy(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${riskConfig.color} 0%, ${riskConfig.color} ${((targetApy - 4) / 56) * 100}%, #ffffff15 ${((targetApy - 4) / 56) * 100}%, #ffffff15 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#484f58]">
              <span>4% (Safe)</span>
              <span>60%+ (Degen)</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full">
              <WalletConnectButton
                className="w-full justify-center py-3 rounded-xl text-sm font-bold"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#484f58]">
              <Lock size={9} />
              Non-custodial — your keys, always. No licensing wall.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
