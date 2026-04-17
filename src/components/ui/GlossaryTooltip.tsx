"use client";

import { useState } from "react";

const GLOSSARY: Record<string, string> = {
  "RWA": "Real World Asset — a traditional asset like bonds, real estate, or stocks tokenized on a blockchain. Makes them faster to trade and accessible to more investors.",
  "TVL": "Total Value Locked — total funds deposited in a DeFi protocol. Higher TVL generally signals more trust and usage.",
  "APY": "Annual Percentage Yield — your yearly return as a percentage, including the effect of compounding.",
  "DeFi": "Decentralized Finance — financial services (lending, trading, yield) that run on blockchains with no company behind them.",
  "DEX": "Decentralized Exchange — a trading platform where you swap tokens directly from your wallet with no intermediary.",
  "Perp": "Perpetual futures — a derivative contract with no expiry date, letting you bet on price direction with leverage.",
  "DePIN": "Decentralized Physical Infrastructure Network — blockchain-incentivized real-world infrastructure like wireless networks or compute grids.",
  "Oracle": "A service that brings real-world data (prices, events) onto a blockchain so smart contracts can use it.",
  "Whale": "A wallet holding a very large amount of cryptocurrency — typically $1M+ in a single token.",
  "On-chain": "Data or activity recorded directly on a blockchain — verifiable by anyone.",
  "Stablecoin": "A crypto token designed to stay at $1.00, backed by dollars, bonds, or algorithmic mechanisms.",
  "Narrative": "The story or thesis driving capital into a sector — e.g. 'RWA tokenization will replace traditional settlement'.",
  "L1": "Layer 1 — a base blockchain like Ethereum or Solana that other protocols are built on.",
  "L2": "Layer 2 — a network built on top of Ethereum to make transactions faster and cheaper.",
  "TAO": "Bittensor's token — powers a decentralized marketplace for AI models and compute.",
  "RNDR": "Render Network token — powers decentralized GPU compute for AI and 3D rendering.",
  "FET": "Fetch.ai token — powers autonomous AI agents that can transact and complete tasks independently.",
};

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);
  const definition = GLOSSARY[term];

  if (!definition) return <>{children}</>;

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dotted border-[#484f58]">{children}</span>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 rounded-lg text-[11px] text-[#8b949e] leading-relaxed z-50 pointer-events-none"
          style={{ background: "#0d0e12", border: "1px solid #30363d", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
        >
          <span className="font-black text-[#e6edf3] text-[10px] uppercase tracking-widest block mb-1">{term}</span>
          {definition}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #30363d",
            }}
          />
        </span>
      )}
    </span>
  );
}

export { GLOSSARY };
