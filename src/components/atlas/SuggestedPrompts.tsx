"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Prompt {
  text: string;
  icon: string;
}

const ALL_PROMPTS: Prompt[] = [
  // Narratives & signals
  { text: "What's driving the RWA narrative right now?", icon: "🏦" },
  { text: "Which narrative is heating up fastest this week?", icon: "🔥" },
  { text: "Why is the AI×Crypto narrative so hot right now?", icon: "⚡" },
  { text: "What should I be watching in crypto this week?", icon: "📊" },
  // Token deep dives
  { text: "Is LINK undervalued given its oracle dominance?", icon: "⛓" },
  { text: "Explain the TAO/Bittensor opportunity in plain English", icon: "🧠" },
  { text: "What's the bear case for HYPE right now?", icon: "⚖️" },
  // AI × Crypto intersection
  { text: "How does Claude Sonnet 4.6's dominance affect TAO price?", icon: "🤖" },
  { text: "Will AI agent payments use crypto as the settlement layer?", icon: "💳" },
  { text: "What crypto tokens benefit most from the GPU compute race?", icon: "💻" },
  // AI tools
  { text: "Which AI model is best for crypto research right now?", icon: "🔬" },
  // Yield
  { text: "Best safe stablecoin yield right now with no lockup?", icon: "💰" },
  // Journal / decisions
  { text: "Review my thesis: I bought ONDO for RWA + institutional flows", icon: "📓" },
];

// Returns 3 prompts starting at index, wrapping around
function getSlice(index: number): Prompt[] {
  const len = ALL_PROMPTS.length;
  const start = index % len;
  const result: Prompt[] = [];
  for (let i = 0; i < 3; i++) {
    result.push(ALL_PROMPTS[(start + i) % len]);
  }
  return result;
}

interface SuggestedPromptsProps {
  onSelect: (text: string) => void;
  compact?: boolean;
}

export function SuggestedPrompts({ onSelect, compact }: SuggestedPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [visiblePrompts, setVisiblePrompts] = useState<Prompt[]>(() => getSlice(0));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setFading(true);
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 3;
          setVisiblePrompts(getSlice(next));
          return next;
        });
        setFading(false);
      }, 250);
    }, 30_000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  if (compact) {
    return (
      <div
        className="flex gap-2 flex-wrap transition-opacity duration-[250ms]"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {visiblePrompts.map(({ text, icon }) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-[#6b6b80] hover:text-white hover:border-white/[0.15] transition-all truncate max-w-[240px] flex items-center gap-1.5"
          >
            <span>{icon}</span>
            <span>{text}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl transition-opacity duration-[250ms]"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {visiblePrompts.map(({ text, icon }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="group text-left px-4 py-3 rounded-xl border transition-all"
          style={{ background: "#161b22", borderColor: "#21262d" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "#484f58"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "#21262d"}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{icon}</span>
          </div>
          <p className="text-xs text-[#8888a0] group-hover:text-white transition-colors leading-relaxed">
            {text}
          </p>
        </button>
      ))}
    </div>
  );
}
