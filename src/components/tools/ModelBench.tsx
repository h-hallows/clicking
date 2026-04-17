"use client";

import { useState } from "react";

const MODELS = [
  {
    id: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    color: "#C2651A",
    scores: { coding: 81, reasoning: 87, writing: 94, speed: 72, cost: 85, context: 95 },
    clickingScore: 86,
    freeTier: true,
    paidTier: "$20/month",
    bestFor: ["Code review", "Long documents", "Analysis", "Writing"],
    notFor: ["Image generation", "Real-time search"],
    trend: "up" as const,
    url: "https://claude.ai",
  },
  {
    id: "gpt-5-1",
    name: "GPT-5.1",
    provider: "OpenAI",
    color: "#10A37F",
    scores: { coding: 78, reasoning: 92, writing: 88, speed: 78, cost: 70, context: 85 },
    clickingScore: 82,
    freeTier: true,
    paidTier: "$20/month",
    bestFor: ["Complex reasoning", "Research", "General purpose"],
    notFor: ["Very long documents", "Cost-sensitive workflows"],
    trend: "up" as const,
    url: "https://chatgpt.com",
  },
  {
    id: "gemini-3",
    name: "Gemini 3 Deep Think",
    provider: "Google",
    color: "#4285F4",
    scores: { coding: 76, reasoning: 95, writing: 82, speed: 65, cost: 75, context: 90 },
    clickingScore: 80,
    freeTier: true,
    paidTier: "$20/month",
    bestFor: ["Science & math", "Multimodal tasks", "Google Workspace"],
    notFor: ["Creative writing", "Fast inference"],
    trend: "up" as const,
    url: "https://gemini.google.com",
  },
  {
    id: "deepseek-r2",
    name: "DeepSeek R2",
    provider: "DeepSeek",
    color: "#7C3AED",
    scores: { coding: 75, reasoning: 90, writing: 78, speed: 82, cost: 98, context: 80 },
    clickingScore: 83,
    freeTier: true,
    paidTier: "Free (open source)",
    bestFor: ["Cost-sensitive", "Self-hosting", "Reasoning tasks"],
    notFor: ["Latest news/events", "Regulated environments"],
    trend: "up" as const,
    url: "https://chat.deepseek.com",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    color: "#20B2AA",
    scores: { coding: 60, reasoning: 78, writing: 72, speed: 88, cost: 80, context: 70 },
    clickingScore: 74,
    freeTier: true,
    paidTier: "$20/month",
    bestFor: ["Real-time research", "Cited answers", "News & current events"],
    notFor: ["Long-form writing", "Complex code"],
    trend: "flat" as const,
    url: "https://perplexity.ai",
  },
];

type SortKey = "clickingScore" | "coding" | "reasoning" | "writing" | "cost";

const SCORE_DIMS = ["coding", "reasoning", "writing", "speed", "cost", "context"] as const;

function RadarChart({ scores, color }: { scores: Record<string, number>; color: string }) {
  const dims = ["coding", "reasoning", "writing", "speed", "cost", "context"];
  const size = 100;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / dims.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const backgroundPoints = dims.map((_, i) => getPoint(i, 100));
  const scorePoints = dims.map((dim, i) => getPoint(i, scores[dim] ?? 50));

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {dims.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#21262d" strokeWidth={1} />
        );
      })}
      <path d={toPath(backgroundPoints)} fill="none" stroke="#21262d" strokeWidth={1} />
      <path d={toPath(scorePoints)} fill={color + "30"} stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

const TREND_ICONS: Record<string, { icon: string; color: string }> = {
  up: { icon: "↑", color: "#3fb950" },
  flat: { icon: "→", color: "#6e7681" },
  down: { icon: "↓", color: "#f85149" },
};

export function ModelBench() {
  const [sortBy, setSortBy] = useState<SortKey>("clickingScore");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...MODELS].sort((a, b) => {
    if (sortBy === "clickingScore") return b.clickingScore - a.clickingScore;
    return (b.scores[sortBy] ?? 0) - (a.scores[sortBy] ?? 0);
  });

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "clickingScore", label: "Clicking Score" },
    { key: "coding", label: "Coding" },
    { key: "reasoning", label: "Reasoning" },
    { key: "writing", label: "Writing" },
    { key: "cost", label: "Cost" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#484f58] uppercase">
            Model Leaderboard
          </p>
          <p className="text-[10px] text-[#484f58]">
            Last updated: <span className="text-[#6e7681] font-semibold" suppressHydrationWarning>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>
        <h2 className="text-xl font-black text-[#e6edf3] mb-1">Which model is best right now?</h2>
        <p className="text-sm text-[#6e7681]">
          <span className="font-semibold text-[#8b949e]">Clicking Score</span> weights:{" "}
          cost (20%), reasoning (20%), coding (20%), writing (15%), speed (15%), context (10%)
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[11px] text-[#484f58] font-semibold">Sort by:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className="px-3 py-1.5 text-[11px] font-semibold transition-all duration-[80ms] border-b-2"
            style={
              sortBy === opt.key
                ? { color: "#00DCC8", borderBottomColor: "#00DCC8" }
                : { color: "#6e7681", borderBottomColor: "transparent" }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Model rows */}
      <div className="space-y-3">
        {sorted.map((model, rank) => {
          const isExpanded = expanded === model.id;
          const trend = TREND_ICONS[model.trend];

          return (
            <div
              key={model.id}
              className="rounded-xl border transition-all duration-[120ms]"
              style={{ backgroundColor: "#161b22", borderColor: isExpanded ? model.color + "40" : "#21262d" }}
            >
              {/* Main row */}
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isExpanded ? null : model.id)}
              >
                {/* Rank */}
                <span className="text-[13px] font-black text-[#484f58] w-5 flex-shrink-0">
                  #{rank + 1}
                </span>

                {/* Color dot + name */}
                <div className="flex items-center gap-2 w-44 flex-shrink-0 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: model.color }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#e6edf3] truncate">{model.name}</p>
                    <p className="text-[10px] text-[#6e7681] truncate">{model.provider}</p>
                    <div className="hidden lg:flex items-center gap-1 mt-0.5 flex-wrap">
                      {model.bestFor.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] font-semibold px-1 py-0.5 rounded"
                          style={{ backgroundColor: model.color + "15", color: model.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score bars — hidden on small screens */}
                <div className="hidden md:flex flex-1 gap-2 items-center">
                  {SCORE_DIMS.map((dim) => {
                    const val = model.scores[dim] ?? 0;
                    return (
                      <div key={dim} className="flex-1 min-w-0">
                        <p className="text-[8px] text-[#484f58] font-bold uppercase tracking-wide mb-0.5 truncate">
                          {dim}
                        </p>
                        <div className="h-1 rounded-full bg-[#21262d] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${val}%`, backgroundColor: model.color + "90" }}
                          />
                        </div>
                        <p className="text-[9px] text-[#6e7681] mt-0.5 tabular-nums">{val}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Clicking Score circle */}
                <div className="flex flex-col items-center gap-0.5 ml-auto flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2"
                    style={{ borderColor: model.color, color: model.color }}
                  >
                    {model.clickingScore}
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: trend.color }}>
                    {trend.icon}
                  </span>
                </div>

                {/* Try button */}
                <a
                  href={model.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hidden sm:flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-[80ms] flex-shrink-0 ml-2"
                  style={{ borderColor: model.color + "40", color: model.color, backgroundColor: model.color + "10" }}
                >
                  Try →
                </a>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#21262d] pt-4 flex flex-col md:flex-row gap-6">
                  {/* Radar chart */}
                  <div className="flex-shrink-0">
                    <RadarChart scores={model.scores} color={model.color} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#484f58] uppercase tracking-wide mb-1.5">Best for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {model.bestFor.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: model.color + "15", color: model.color }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#484f58] uppercase tracking-wide mb-1.5">Not ideal for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {model.notFor.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#21262d] text-[#6e7681]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      {model.freeTier && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#3fb95020", color: "#3fb950" }}>
                          FREE TIER
                        </span>
                      )}
                      <span className="text-[11px] text-[#6e7681]">{model.paidTier}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
