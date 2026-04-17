"use client";

import { useState, useRef, useEffect } from "react";

function TryLink({ url, name, accentColor }: { url: string; name: string; accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-[80ms]"
      style={{
        backgroundColor: accentColor + "20",
        color: accentColor,
        border: `1px solid ${accentColor}40`,
        boxShadow: hovered ? `0 0 10px ${accentColor}50` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Try {name} →
    </a>
  );
}

const CATEGORIES = [
  { id: "write", icon: "✍️", label: "Write something" },
  { id: "code", icon: "💻", label: "Build or code" },
  { id: "research", icon: "🔬", label: "Research a topic" },
  { id: "create", icon: "🎨", label: "Create images or video" },
  { id: "analyze", icon: "📊", label: "Analyze data or documents" },
  { id: "invest", icon: "💰", label: "Make investment decisions" },
  { id: "automate", icon: "⚡", label: "Automate a workflow" },
  { id: "custom", icon: "💬", label: "Something else" },
];

const QUESTIONS: Record<string, { q: string; options: string[] }[]> = {
  write: [
    { q: "What are you writing?", options: ["Blog post", "Email", "Report", "Social media", "Marketing copy"] },
    { q: "Who do you work with?", options: ["Just me", "Small team", "Large team"] },
  ],
  code: [
    { q: "What type of coding?", options: ["Frontend (JS/TS)", "Backend", "Data / Python", "Full-stack", "DevOps"] },
    { q: "How experienced are you?", options: ["Learning to code", "Intermediate", "Senior developer"] },
  ],
  research: [
    { q: "What are you researching?", options: ["Crypto / DeFi", "AI / Tech", "Business / Finance", "Academic", "General"] },
    { q: "How deep do you need to go?", options: ["Quick summary", "Thorough analysis", "Expert-level depth"] },
  ],
  create: [
    { q: "What are you creating?", options: ["Images", "Video", "Audio / Music", "3D assets"] },
    { q: "Commercial or personal?", options: ["Personal project", "Commercial / Client work"] },
  ],
  analyze: [
    { q: "What are you analyzing?", options: ["Spreadsheet / CSV", "PDF / Document", "Code / Codebase", "Market data"] },
    { q: "Output format?", options: ["Summary", "Structured table", "Visualization ideas", "Actionable insights"] },
  ],
  invest: [
    { q: "What asset class?", options: ["Crypto / DeFi", "Stocks", "Real estate", "Mixed portfolio"] },
    { q: "Your experience level?", options: ["Beginner", "Intermediate", "Experienced"] },
  ],
  automate: [
    { q: "What do you want to automate?", options: ["Email / Calendar", "Data processing", "Social media", "Code tasks", "Business workflows"] },
    { q: "Technical comfort level?", options: ["No code", "Low code", "Can code"] },
  ],
  custom: [
    { q: "Tell me what you need:", options: [] },
  ],
};

interface Recommendation {
  name: string;
  provider: string;
  emoji: string;
  accentColor: string;
  matchScore: number;
  why: string;
  caveat: string;
  freeTier: boolean;
  paidPrice: string;
  bestFor: string;
  url: string;
}

export function AIMatch() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<(typeof CATEGORIES)[0] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const questions = category ? QUESTIONS[category.id] ?? [] : [];

  function handleCategorySelect(cat: (typeof CATEGORIES)[0]) {
    setCategory(cat);
    setAnswers([]);
    setStep(2);
  }

  function handleAnswerToggle(questionIndex: number, option: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = option;
      return next;
    });
  }

  async function handleSubmit() {
    if (!category) return;

    const finalAnswers = category.id === "custom"
      ? [customText]
      : answers.filter(Boolean);

    setStep(3);
    setLoading(true);
    setError(null);
    setResult([]);

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const prompt = `User wants to: ${category.label}
Context: ${finalAnswers.join(", ")}

Recommend the top 2 AI tools for this specific need. Format as JSON array exactly like this:
[
  {
    "name": "Claude",
    "provider": "Anthropic",
    "emoji": "🤖",
    "accentColor": "#C2651A",
    "matchScore": 95,
    "why": "One sentence why it's best for this specific use case",
    "caveat": "One sentence honest limitation",
    "freeTier": true,
    "paidPrice": "$20/month",
    "bestFor": "Type of user this suits",
    "url": "https://claude.ai"
  }
]

Only return valid JSON. No other text. Be specific and honest.`;

    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        signal: abort.signal,
      });

      if (!res.ok) throw new Error("Atlas request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) fullText += parsed.text;
          } catch {
            // skip malformed lines
          }
        }
      }

      if (!mountedRef.current) return;
      const match = fullText.match(/\[[\s\S]*\]/);
      if (match) {
        const recs = JSON.parse(match[0]) as Recommendation[];
        setResult(recs);
      } else {
        setError("Atlas couldn't parse the recommendations. Try again.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  function handleReset() {
    setStep(1);
    setCategory(null);
    setAnswers([]);
    setCustomText("");
    setResult([]);
    setError(null);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
              style={
                s === step
                  ? { backgroundColor: "#E879F9", color: "#fff", boxShadow: "0 0 10px #E879F940" }
                  : s < step
                  ? { backgroundColor: "#E879F9", color: "#fff" }
                  : { backgroundColor: "#21262d", color: "#484f58", border: "1px solid #30363d" }
              }
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div
                className="w-8 h-px transition-all duration-300"
                style={{ backgroundColor: s < step ? "#E879F9" : "#21262d" }}
              />
            )}
          </div>
        ))}
        <span className="text-[11px] text-[#6e7681] ml-2">
          {step === 1 ? "Choose a goal" : step === 2 ? "Refine your need" : "Your match"}
        </span>
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-black text-[#e6edf3] mb-1">What are you trying to do?</h2>
          <p className="text-sm text-[#6e7681] mb-6">Pick the closest category — Atlas handles the rest.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#21262d] bg-[#161b22] hover:border-[#E879F940] hover:bg-[#1a1f28] transition-all duration-[80ms] group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[12px] font-semibold text-[#8b949e] group-hover:text-[#e6edf3] text-center leading-tight transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Clarifying questions */}
      {step === 2 && category && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="text-[11px] text-[#6e7681] hover:text-[#e6edf3] mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-xl font-black text-[#e6edf3] mb-1">
            {category.icon} {category.label}
          </h2>
          <p className="text-sm text-[#6e7681] mb-6">Answer these to get a precise match.</p>

          <div className="space-y-6">
            {category.id === "custom" ? (
              <div>
                <p className="text-[13px] font-semibold text-[#e6edf3] mb-3">Tell me what you need:</p>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe your goal in a sentence or two..."
                  rows={4}
                  className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#E879F940] resize-none transition-colors"
                />
              </div>
            ) : (
              questions.map((question, qi) => (
                <div key={qi}>
                  <p className="text-[13px] font-semibold text-[#e6edf3] mb-3">{question.q}</p>
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerToggle(qi, opt)}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-[80ms]"
                        style={
                          answers[qi] === opt
                            ? { borderColor: "#E879F9", backgroundColor: "#E879F920", color: "#E879F9" }
                            : { borderColor: "#21262d", backgroundColor: "#161b22", color: "#6e7681" }
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              category.id === "custom"
                ? customText.trim().length === 0
                : answers.filter(Boolean).length === 0
            }
            className="mt-8 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-[80ms] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#E879F9", color: "#fff" }}
          >
            Find My Match →
          </button>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && (
        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-3xl animate-pulse">🔮</div>
              <p className="text-[#e6edf3] font-semibold">Atlas is finding your perfect match...</p>
              <p className="text-[11px] text-[#6e7681]">Analyzing your goal and context</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-[13px] font-semibold text-[#f85149] mb-2">Something went wrong</p>
              <p className="text-[12px] text-[#6e7681] mb-5 max-w-xs mx-auto">{error}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setStep(2); setError(null); }}
                  className="px-4 py-2 rounded-lg text-[12px] font-bold transition-all duration-[80ms]"
                  style={{ backgroundColor: "#E879F920", color: "#E879F9", border: "1px solid #E879F940" }}
                >
                  ↺ Retry
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-[#21262d] text-[#6e7681] hover:text-[#e6edf3] text-[12px] font-bold transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {!loading && result.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-[#e6edf3] mb-1">Your perfect match</h2>
              <p className="text-sm text-[#6e7681] mb-6">
                Based on: <span className="text-[#8b949e] font-medium">{category?.label}</span>
              </p>

              <div className="space-y-4">
                {result.map((rec, i) => (
                  <div key={i}>
                    {i === 1 && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-[#21262d]" />
                        <span className="text-[10px] font-bold tracking-[0.12em] text-[#484f58] uppercase">Also consider:</span>
                        <div className="flex-1 h-px bg-[#21262d]" />
                      </div>
                    )}
                  <div
                    className="rounded-xl border p-5"
                    style={{ backgroundColor: "#161b22", borderColor: rec.accentColor + "40" }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{rec.emoji}</span>
                        <div>
                          <p className="text-lg font-black text-[#e6edf3]">{rec.name}</p>
                          <p className="text-xs text-[#6e7681]">{rec.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#6e7681] mb-1">Match Score</p>
                        <p className="text-2xl font-black tabular-nums" style={{ color: rec.accentColor }}>
                          {rec.matchScore}%
                        </p>
                      </div>
                    </div>

                    {/* Match score bar */}
                    <div className="h-1.5 rounded-full bg-[#21262d] mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${rec.matchScore}%`, backgroundColor: rec.accentColor }}
                      />
                    </div>

                    {/* Why */}
                    <div className="mb-3">
                      <p className="text-[11px] font-bold text-[#484f58] uppercase tracking-wide mb-1">Why it's best for you</p>
                      <p className="text-sm text-[#e6edf3] leading-relaxed">{rec.why}</p>
                    </div>

                    {/* Caveat */}
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "#fbbf2415" }}>
                      <p className="text-[11px] font-bold text-[#fbbf24] uppercase tracking-wide mb-1">Honest caveat</p>
                      <p className="text-xs text-[#fbbf24]/80 leading-relaxed">{rec.caveat}</p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rec.freeTier && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3fb95020", color: "#3fb950" }}>
                            FREE TIER
                          </span>
                        )}
                        <span className="text-[10px] text-[#6e7681]">{rec.paidPrice}</span>
                      </div>
                      <TryLink url={rec.url} name={rec.name} accentColor={rec.accentColor} />
                    </div>
                  </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="mt-6 w-full py-3 rounded-xl border border-[#21262d] text-[#6e7681] hover:text-[#e6edf3] hover:border-[#30363d] text-sm font-semibold transition-all duration-[80ms]"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
