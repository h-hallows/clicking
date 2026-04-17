"use client";

import { useState } from "react";
import Link from "next/link";

const PROMPTS = [
  // Investing
  {
    id: "p1",
    cat: "invest",
    title: "Stress-test a crypto thesis",
    bestWith: ["Claude", "ChatGPT"],
    prompt:
      "I'm considering [TOKEN] because [MY THESIS].\nPlay devil's advocate. List the 3 strongest arguments AGAINST this thesis. Be specific. Use real risks, not generic 'crypto is volatile' disclaimers.",
  },
  {
    id: "p2",
    cat: "invest",
    title: "Review my trade decision quality",
    bestWith: ["Claude"],
    prompt:
      "I made this trade: [WHAT YOU BOUGHT/SOLD]\nMy thesis was: [WHY]\nThe trigger was: [WHAT SIGNAL]\nThe outcome was: [WHAT HAPPENED]\n\nReview my decision quality. Was my reasoning sound even if the outcome was bad? What should I do differently?",
  },
  {
    id: "p3",
    cat: "invest",
    title: "Explain this DeFi protocol simply",
    bestWith: ["Claude", "ChatGPT"],
    prompt:
      "Explain [PROTOCOL NAME] to me like I'm smart but have no DeFi background. Cover: what it does, how it makes money, who uses it, main risks, and whether the token has value. Under 150 words.",
  },
  // Writing
  {
    id: "p4",
    cat: "write",
    title: "Cold email that gets responses",
    bestWith: ["Claude", "ChatGPT"],
    prompt:
      "Write a cold email. I'm [WHO YOU ARE], reaching out to [WHO THEY ARE] at [COMPANY]. My goal: [WHAT YOU WANT]. My value prop: [WHY THEY CARE]. Keep it under 5 sentences. No fluff. End with one clear ask.",
  },
  {
    id: "p5",
    cat: "write",
    title: "Turn notes into a tight summary",
    bestWith: ["Claude"],
    prompt:
      "Here are my raw notes: [PASTE NOTES]\n\nCreate a tight summary (under 200 words) that captures the key decisions, action items, and context. Format as: KEY DECISIONS / ACTION ITEMS / CONTEXT.",
  },
  // Research
  {
    id: "p6",
    cat: "research",
    title: "Find the strongest counterargument",
    bestWith: ["Claude", "GPT"],
    prompt:
      "I believe: [YOUR POSITION]\n\nGive me the 3 strongest counterarguments from someone who deeply disagrees. Make them steelman arguments, not strawmen. I want to truly understand the other side.",
  },
  {
    id: "p7",
    cat: "research",
    title: "Competitive analysis one-pager",
    bestWith: ["Claude"],
    prompt:
      "Compare [PRODUCT A] vs [PRODUCT B] for [USE CASE]. Cover: core strengths, weaknesses, pricing, ideal user, and one thing each does better than the other. Format as a side-by-side table. Under 300 words.",
  },
  // Thinking
  {
    id: "p8",
    cat: "think",
    title: "Pre-mortem: what could go wrong?",
    bestWith: ["Claude", "ChatGPT"],
    prompt:
      "I'm about to [DECISION/PROJECT]. Assume it fails completely in 12 months. What are the 5 most likely reasons it failed? Be brutally honest. Include things I might be in denial about.",
  },
  {
    id: "p9",
    cat: "think",
    title: "Second-order consequences",
    bestWith: ["Claude"],
    prompt:
      "I'm considering [DECISION]. Walk me through the second and third-order consequences — not just the obvious first effects, but what those effects cause in turn. Focus on non-obvious downstream effects.",
  },
  // Build
  {
    id: "p10",
    cat: "build",
    title: "Review my code architecture",
    bestWith: ["Claude"],
    prompt:
      "[PASTE CODE OR DESCRIBE SYSTEM]\n\nReview the architecture. What are the main structural weaknesses? What would make this harder to maintain at scale? What would you change and why?",
  },
  {
    id: "p11",
    cat: "build",
    title: "Explain this codebase to a new dev",
    bestWith: ["Claude"],
    prompt:
      "[PASTE CODEBASE STRUCTURE OR KEY FILES]\n\nExplain this codebase to a new developer joining the team. Cover: what it does, how it's organized, the key abstractions, and what they need to read first to get productive.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "invest", label: "💰 Invest" },
  { id: "write", label: "✍️ Write" },
  { id: "research", label: "🔬 Research" },
  { id: "think", label: "🧠 Think" },
  { id: "build", label: "⚡ Build" },
];

const BEST_WITH_COLORS: Record<string, string> = {
  Claude: "#C2651A",
  ChatGPT: "#10A37F",
  GPT: "#10A37F",
  Gemini: "#4285F4",
};

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5" style={{ backgroundColor: "#A78BFA40", color: "#A78BFA" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function PromptVault() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = PROMPTS.filter((p) => {
    const matchesCat = category === "all" || p.cat === category;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.bestWith.some((b) => b.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  async function handleCopy(id: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // fallback — silently fail
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#484f58] uppercase mb-1">
          Prompt Vault
        </p>
        <h2 className="text-xl font-black text-[#e6edf3] mb-1">
          The right prompt unlocks the right answer.
        </h2>
        <p className="text-sm text-[#6e7681]">
          Curated, tested. Works with Claude, ChatGPT, Gemini.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="w-full bg-[#161b22] border border-[#21262d] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#30363d] transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-[80ms]"
            style={
              category === cat.id
                ? { backgroundColor: "#A78BFA", borderColor: "#A78BFA", color: "#fff" }
                : { backgroundColor: "transparent", borderColor: "#21262d", color: "#6e7681" }
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Prompt count */}
      <p className="text-[11px] text-[#484f58] mb-4 font-medium">
        {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#484f58] text-sm">No prompts match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const isExpanded = expanded === p.id;
            const isCopied = copied === p.id;
            const preview = p.prompt.replace(/\n/g, " ").slice(0, 100) + (p.prompt.length > 100 ? "..." : "");

            return (
              <div
                key={p.id}
                className="rounded-xl border transition-all duration-[120ms]"
                style={{ backgroundColor: "#161b22", borderColor: isExpanded ? "#484f58" : "#21262d" }}
              >
                {/* Card header — clickable to expand */}
                <button
                  className="w-full flex flex-col gap-2 p-4 text-left"
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-[#e6edf3] leading-tight">
                      <HighlightMatch text={p.title} query={search} />
                    </p>
                    <span className="text-[#484f58] text-sm flex-shrink-0 mt-0.5">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* bestWith badges */}
                  <div className="flex items-center gap-1.5">
                    {p.bestWith.map((tool) => (
                      <span
                        key={tool}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: (BEST_WITH_COLORS[tool] ?? "#484f58") + "20",
                          color: BEST_WITH_COLORS[tool] ?? "#6e7681",
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Preview */}
                  {!isExpanded && (
                    <p className="text-[11px] text-[#6e7681] leading-relaxed">{preview}</p>
                  )}
                </button>

                {/* Expanded: full prompt + actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#21262d] pt-4">
                    <pre className="text-[12px] text-[#8b949e] leading-relaxed whitespace-pre-wrap font-mono bg-[#0d0e12] rounded-lg p-3 mb-4 border border-[#21262d]">
                      {p.prompt}
                    </pre>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(p.id, p.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-[80ms]"
                        style={
                          isCopied
                            ? { borderColor: "#3fb95040", backgroundColor: "#3fb95015", color: "#3fb950" }
                            : { borderColor: "#21262d", backgroundColor: "#161b22", color: "#6e7681" }
                        }
                      >
                        {isCopied ? "✓ Copied!" : "Copy"}
                      </button>
                      <Link
                        href={`/atlas?q=${encodeURIComponent(p.prompt)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#A78BFA40] bg-[#A78BFA10] text-[#A78BFA] transition-all duration-[80ms] hover:bg-[#A78BFA20]"
                      >
                        Try in Atlas →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
