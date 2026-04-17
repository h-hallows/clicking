"use client";

import { MOCK_POSITIONS, RISK_CONFIG } from "@/lib/yield-data";
import { TrendingUp, ArrowDownToLine, Lock } from "lucide-react";
import { WalletButton } from "@/components/nav/WalletModal";

export function ActivePositions() {
  const totalDeposited = MOCK_POSITIONS.reduce((s, p) => s + p.deposited, 0);
  const totalValue     = MOCK_POSITIONS.reduce((s, p) => s + p.currentValue, 0);
  const totalYield     = MOCK_POSITIONS.reduce((s, p) => s + p.earnedYield, 0);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-[#00e5a0]" />
          <span className="text-sm font-semibold text-white">Active Positions</span>
          <span className="text-[11px] text-[#484f58] px-1.5 py-0.5 rounded-md" style={{ background: "#21262d" }}>
            Preview
          </span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x border-b" style={{ borderColor: "#21262d" }}>
        {[
          { label: "Deposited",   value: `$${totalDeposited.toLocaleString()}`, color: "#6b6b80"  },
          { label: "Current",     value: `$${totalValue.toLocaleString()}`,     color: "#ffffff"  },
          { label: "Yield earned",value: `$${totalYield.toLocaleString()}`,     color: "#00e5a0"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-4 py-3 text-center">
            <div className="text-sm font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] text-[#484f58] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Position rows */}
      <div className="divide-y" style={{ borderColor: "#1c2128" }}>
        {MOCK_POSITIONS.map((pos) => {
          const riskCfg = RISK_CONFIG[pos.strategy.risk];
          const gainPct = (((pos.currentValue - pos.deposited) / pos.deposited) * 100).toFixed(2);

          return (
            <div key={pos.id} className="px-4 py-3.5 transition-colors hover:bg-[#1c2128]/50">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: pos.strategy.protocolColor + "20", color: pos.strategy.protocolColor }}
                  >
                    {pos.strategy.protocol.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{pos.strategy.name}</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: riskCfg.color + "18", color: riskCfg.color }}
                      >
                        {riskCfg.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#484f58] mt-0.5">
                      {pos.strategy.protocol} · {pos.strategy.chain} · since {pos.entryDate}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-white">${pos.currentValue.toLocaleString()}</div>
                  <div className="text-[11px] text-[#00e5a0]">+{gainPct}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2.5">
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (pos.earnedYield / (pos.deposited * (pos.apy / 100))) * 100)}%`,
                      backgroundColor: riskCfg.color,
                    }}
                  />
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#6b6b80]">
                    APY: <span style={{ color: riskCfg.color }} className="font-semibold">{pos.apy}%</span>
                  </span>
                  <span className="text-[11px] text-[#6b6b80]">
                    Earned: <span className="text-[#00e5a0] font-semibold">${pos.earnedYield.toLocaleString()}</span>
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#6b6b80] hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
                >
                  <ArrowDownToLine size={10} />
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked overlay hint */}
      <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: "#21262d", background: "#0d0e12" }}>
        <Lock size={11} className="text-[#484f58]" />
        <span className="text-[11px] text-[#6e7681]">
          Connect wallet to see your real positions
        </span>
        <WalletButton className="ml-auto" />
      </div>
    </div>
  );
}
