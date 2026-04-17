"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NARRATIVES, HEAT_COLORS, NARRATIVE_MAP } from "@/lib/narratives";
import type { Narrative } from "@/lib/narratives";

const EXPOSURE: { narrativeId: string; pct: number }[] = [
  { narrativeId: "rwa",     pct: 45 },
  { narrativeId: "ai",      pct: 22 },
  { narrativeId: "banking", pct: 16 },
  { narrativeId: "l1",      pct:  8 },
  { narrativeId: "depin",   pct:  4 },
  { narrativeId: "defi",    pct:  5 },
];

const COVERED_IDS = new Set(EXPOSURE.map((e) => e.narrativeId));

export function NarrativeAlignment() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Only show crypto-relevant narratives (no pure "ai" domain) for gap detection
  const gapNarratives = NARRATIVES.filter(
    (n) =>
      !COVERED_IDS.has(n.id) &&
      n.heatLevel >= 3 &&
      n.domain !== "ai" // skip pure AI-industry narratives for the crypto portfolio context
  );

  const coveredCount = EXPOSURE.length;

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
          <span className="text-[13px] font-bold text-[#e6edf3]">
            Narrative Alignment
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "#7c6af720", color: "#7c6af7" }}
          >
            {coveredCount} narratives
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {EXPOSURE.map((entry) => {
          const narrative = NARRATIVE_MAP[entry.narrativeId];
          if (!narrative) return null;
          const heatColor = HEAT_COLORS[narrative.heat];

          return (
            <ExposureRow
              key={entry.narrativeId}
              narrative={narrative}
              pct={entry.pct}
              heatColor={heatColor}
              animated={animated}
            />
          );
        })}

        {/* Gaps section */}
        {gapNarratives.length > 0 && (
          <>
            <div
              className="border-t pt-3 mt-1"
              style={{ borderColor: "#21262d" }}
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#484f58] mb-2.5">
                Coverage Gaps (0% exposure)
              </p>
              <div className="space-y-2.5">
                {gapNarratives.map((n) => (
                  <GapRow key={n.id} narrative={n} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExposureRow({
  narrative,
  pct,
  heatColor,
  animated,
}: {
  narrative: Narrative;
  pct: number;
  heatColor: string;
  animated: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold text-[#e6edf3] truncate">
            {narrative.label}
          </span>
          <HeatBadge heat={narrative.heat} color={heatColor} />
        </div>
        <span className="text-[11px] font-bold tabular-nums text-[#e6edf3] flex-shrink-0 ml-2">
          {pct}%
        </span>
      </div>
      {/* Bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "#21262d" }}
      >
        <div
          className="h-full rounded-full transition-all duration-[600ms] ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            backgroundColor: narrative.color,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

function GapRow({ narrative }: { narrative: Narrative }) {
  const heatColor = HEAT_COLORS[narrative.heat];
  return (
    <Link
      href={`/feed?narrative=${narrative.id}`}
      className="flex items-start justify-between gap-2 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-semibold text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">
            {narrative.label}
          </span>
          <HeatBadge heat={narrative.heat} color={heatColor} />
        </div>
        {/* Token chips */}
        <div className="flex flex-wrap gap-1">
          {narrative.tokens.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: narrative.color + "15",
                color: narrative.color,
                border: `1px solid ${narrative.color}30`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="text-[9px] text-[#484f58] group-hover:text-[#7c6af7] transition-colors flex-shrink-0 mt-0.5">
        →
      </span>
    </Link>
  );
}

function HeatBadge({
  heat,
  color,
}: {
  heat: Narrative["heat"];
  color: string;
}) {
  return (
    <span
      className="text-[8px] font-black px-1 py-0.5 rounded flex-shrink-0"
      style={{
        background: color + "18",
        color,
      }}
    >
      {heat}
    </span>
  );
}
