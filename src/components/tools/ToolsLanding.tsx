"use client";

import { useState } from "react";
import Link from "next/link";

const TOOLS = [
  {
    id: "ai-match",
    icon: "🤖",
    name: "AI Match",
    tagline: "Which AI should I use?",
    description: "Describe what you're trying to do. Get the exact right tool recommended in seconds.",
    color: "#E879F9",
    href: "/tools/ai-match",
    domain: "ai",
    badge: "NEW",
  },
  {
    id: "models",
    icon: "📊",
    name: "Model Bench",
    tagline: "Live AI model leaderboard",
    description: "Which model is actually best right now? Ranked by coding, reasoning, writing, speed, and cost.",
    color: "#FB923C",
    href: "/tools/models",
    domain: "ai",
    badge: null,
  },
  {
    id: "prompts",
    icon: "📖",
    name: "Prompt Vault",
    tagline: "Best prompts for every goal",
    description: "Curated, tested prompts organized by outcome. Works with Claude, ChatGPT, Gemini.",
    color: "#A78BFA",
    href: "/tools/prompts",
    domain: "ai",
    badge: null,
  },
  {
    id: "scan",
    icon: "🔍",
    name: "Scan",
    tagline: "Token intelligence reports",
    description: "Paste any ticker. Get a full signal report — narrative fit, risks, Atlas verdict.",
    color: "#00e5a0",
    href: "/scan",
    domain: "crypto",
    badge: null,
  },
  {
    id: "agents",
    icon: "⚡",
    name: "Agent Builder",
    tagline: "Build your own signal agents",
    description: "No code. Set conditions. Your agent watches the market 24/7.",
    color: "#fbbf24",
    href: "/tools/agents",
    domain: "both",
    badge: "NEW",
  },
  {
    id: "journal",
    icon: "📓",
    name: "Journal",
    tagline: "Trade + decision tracker",
    description: "Log trades with thesis. Track decision quality. Learn from every move.",
    color: "#27C96A",
    href: "/tools/journal",
    domain: "crypto",
    badge: "NEW",
  },
];

type DomainFilter = "all" | "crypto" | "ai";

export function ToolsLanding() {
  const [filter, setFilter] = useState<DomainFilter>("all");

  const filtered = filter === "all"
    ? TOOLS
    : TOOLS.filter((t) => t.domain === filter || t.domain === "both");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#484f58] uppercase">
            Intelligence Toolkit
          </p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "#00DCC820", color: "#00DCC8" }}>
            v1.1 — AI + Crypto Intelligence
          </span>
        </div>
        <h2 className="text-xl font-black text-[#e6edf3]">
          Build smarter. Trade sharper.
        </h2>
        <p className="text-sm text-[#6e7681] mt-1">
          AI and crypto tools built for people who think before they click.
        </p>
      </div>

      {/* Domain filters */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: "all" as DomainFilter, label: "All" },
          { id: "crypto" as DomainFilter, label: "⛓ Crypto" },
          { id: "ai" as DomainFilter, label: "🤖 AI" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-[80ms] border"
            style={
              filter === btn.id
                ? { backgroundColor: "#161b22", borderColor: "#484f58", color: "#e6edf3" }
                : { backgroundColor: "transparent", borderColor: "#21262d", color: "#6e7681" }
            }
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => (
          <Link key={tool.id} href={tool.href} className="block">
            <div
              className="group rounded-xl border p-5 flex flex-col gap-3 transition-all duration-[120ms]"
              style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = tool.color + "66";
                el.style.boxShadow = `0 0 20px ${tool.color}12, inset 0 0 20px ${tool.color}06`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "#21262d";
                el.style.boxShadow = "";
              }}
            >
              {/* Icon + badge row */}
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: tool.color + "18" }}
                >
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: tool.color + "20", color: tool.color }}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-lg font-black text-[#e6edf3] leading-none">{tool.name}</p>
                <p className="text-xs font-bold mt-1" style={{ color: tool.color }}>
                  {tool.tagline}
                </p>
                <p className="text-sm text-[#6e7681] mt-2 leading-relaxed">{tool.description}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-[#21262d]">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                  style={{ backgroundColor: tool.color + "15", color: tool.color }}
                >
                  {tool.domain === "both" ? "AI + Crypto" : tool.domain === "ai" ? "AI" : "Crypto"}
                </span>
                <span className="text-[#484f58] group-hover:text-[#e6edf3] transition-colors text-sm font-bold">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
