"use client";

import { useState } from "react";
import { RiskLevel } from "@/lib/yield-data";
import { YieldHero } from "./YieldHero";
import { StrategyExplorer } from "./StrategyExplorer";
import { ActivePositions } from "./ActivePositions";
import { YieldCalculator } from "./YieldCalculator";
import { YieldPhase0 } from "./YieldPhase0";

export function YieldPageClient() {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>("moderate");

  return (
    <div className="flex-1 p-5 space-y-6 max-w-[1200px] w-full mx-auto">
      {/* Phase 0: opportunity cost calculator */}
      <YieldPhase0 />

      {/* Hero: connect wallet + risk config */}
      <YieldHero selectedRisk={selectedRisk} onRiskSelect={setSelectedRisk} />

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Strategy explorer */}
        <StrategyExplorer activeRisk={selectedRisk} />

        {/* Right: calculator + positions */}
        <div className="space-y-5">
          <YieldCalculator activeRisk={selectedRisk} />
          <ActivePositions />
        </div>
      </div>
    </div>
  );
}
