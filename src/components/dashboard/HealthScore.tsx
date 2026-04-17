"use client";

import { Info } from "lucide-react";
import { useState, useEffect } from "react";

const SCORE = 74;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9

const FACTORS = [
  {
    icon: "✓",
    label: "Narrative diversity",
    detail: "Spread across 4 narratives",
    status: "green" as const,
  },
  {
    icon: "✓",
    label: "Exit levels set",
    detail: "3/4 positions have targets",
    status: "green" as const,
  },
  {
    icon: "⚠",
    label: "Concentration risk",
    detail: "ETH = 42% of portfolio",
    status: "amber" as const,
  },
  {
    icon: "✓",
    label: "Narrative alignment",
    detail: "3/4 narratives currently rising",
    status: "green" as const,
  },
];

const STATUS_COLOR = {
  green: "#3fb950",
  amber: "#fbbf24",
  red: "#f85149",
};

function scoreColor(score: number): string {
  if (score <= 40) return "#f85149";
  if (score <= 70) return "#fbbf24";
  return "#3fb950";
}

export function HealthScore() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animated, setAnimated] = useState(false);
  const color = scoreColor(SCORE);
  const filled = (SCORE / 100) * CIRCUMFERENCE;
  // Animate from 0 on mount
  const displayFilled = animated ? filled : 0;
  const strokeDasharray = `${displayFilled} ${CIRCUMFERENCE - displayFilled}`;

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#161b22", borderColor: "#21262d" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "#21262d" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[13px] font-bold text-[#e6edf3]">
            Portfolio Health
          </span>
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center justify-center text-[#484f58] hover:text-[#8b949e] transition-colors"
          >
            <Info size={13} />
          </button>
          {showTooltip && (
            <div
              className="absolute right-0 top-6 z-10 w-56 rounded-lg px-3 py-2 text-[11px] text-[#8b949e] leading-relaxed shadow-xl"
              style={{ background: "#1c2128", border: "1px solid #30363d" }}
            >
              Based on diversity, exit coverage, concentration risk, and
              narrative alignment
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* SVG Gauge */}
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <svg
              width="110"
              height="110"
              viewBox="0 0 110 110"
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Track */}
              <circle
                cx="55"
                cy="55"
                r={RADIUS}
                fill="none"
                stroke="#21262d"
                strokeWidth="6"
              />
              {/* Arc */}
              <circle
                cx="55"
                cy="55"
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            {/* Inner text — absolute center */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ pointerEvents: "none" }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "#484f58" }}
              >
                HEALTH SCORE
              </span>
              <span
                className="text-[28px] font-black leading-none tabular-nums"
                style={{ color, fontFamily: "var(--font-space-grotesk, sans-serif)" }}
              >
                {SCORE}
              </span>
              <span className="text-[10px] text-[#484f58]">/ 100</span>
            </div>
          </div>
        </div>

        {/* Factor rows */}
        <div className="space-y-2">
          {FACTORS.map((f) => (
            <div key={f.label} className="flex items-start gap-2.5">
              <span
                className="text-[11px] font-bold leading-none mt-[1px] flex-shrink-0"
                style={{ color: STATUS_COLOR[f.status] }}
              >
                {f.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#e6edf3]">
                    {f.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#6e7681] mt-0.5">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
