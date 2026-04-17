"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, Copy, Share2, ShieldCheck, AlertTriangle,
  TrendingUp, BarChart2, Newspaper, Activity, RefreshCw,
} from "lucide-react";
import { NARRATIVES, SEED_SIGNALS, Narrative, Signal } from "@/lib/narratives";
import { PriceData } from "@/app/api/prices/route";

// ─── Risk Flags DB ─────────────────────────────────────────────────────────────

const RISK_FLAGS: Record<string, { warnings: string[]; positives: string[] }> = {
  LINK: {
    warnings: ["Node operator sell pressure on rewards", "Competition from Pyth Network (23% market share)"],
    positives: ["Not classified as security", "Multiple independent audits", "Public, credible team"],
  },
  TAO: {
    warnings: ["High concentration in early validators", "Emission-heavy tokenomics currently"],
    positives: ["Real on-chain revenue (not just emissions)", "Institutional interest growing", "Unique subnet architecture"],
  },
  ETH: {
    warnings: ["Staking concentration (Lido 32% of staked ETH)", "Complex upgrade roadmap"],
    positives: ["Most decentralized large-cap L1", "Massive developer ecosystem", "Regulatory clarity improving"],
  },
  BTC: {
    warnings: ["Energy consumption critique ongoing", "No programmability natively"],
    positives: ["Most liquid, most secure", "Institutional adoption confirmed (ETF)", "Digital gold narrative"],
  },
  ONDO: {
    warnings: ["RWA space still early, regulatory risk", "Depends on TradFi adoption speed"],
    positives: ["First-mover in institutional RWA", "OUSG fully backed by US Treasuries", "TVL up 220% in 30 days"],
  },
  HYPE: {
    warnings: ["Relatively new protocol (< 2 years)", "Perp DEX revenue is market-dependent"],
    positives: ["97% revenue buyback model", "Highest fee revenue per user in DeFi", "ETF filings confirmed"],
  },
  SOL: {
    warnings: ["History of outages (improving)", "High validator hardware requirements"],
    positives: ["Fastest L1 — 100ms finality (Alpenglow)", "Massive developer growth", "Institutional custody now available"],
  },
  RNDR: {
    warnings: ["Revenue tied to GPU render job volume (cyclical)", "Competing with centralized cloud render farms on price"],
    positives: ["Only decentralized GPU network with real film/VFX usage", "AI inference demand adds new revenue vertical", "Merger with io.net expands network capacity"],
  },
};

const DEFAULT_FLAGS = {
  warnings: ["Unknown audit status — verify before investing", "Limited historical data"],
  positives: ["Always verify via official docs and DeFiLlama"],
};

// ─── Example chips ─────────────────────────────────────────────────────────────

const EXAMPLE_TICKERS = ["LINK", "TAO", "ETH", "SOL", "ONDO", "HYPE", "RNDR"];

// ─── Signal activity config ───────────────────────────────────────────────────

const SIGNAL_METRICS = [
  { key: "whale",   label: "Whale Activity", icon: Activity  },
  { key: "social",  label: "Social Velocity", icon: TrendingUp },
  { key: "news",    label: "News Flow",       icon: Newspaper },
  { key: "onchain", label: "On-Chain",        icon: BarChart2 },
] as const;

// Derive signal activity levels from matching SEED_SIGNALS
function getSignalActivity(ticker: string): Record<string, number> {
  const upper = ticker.toUpperCase();
  const matching = SEED_SIGNALS.filter((s) => s.tokens.includes(upper));
  const result: Record<string, number> = { whale: 1, social: 1, news: 1, onchain: 1 };
  matching.forEach((s) => {
    const k = s.type as string;
    if (k in result) result[k] = Math.min(5, result[k] + 2);
  });
  // Boost based on narrative heat
  const narrative = NARRATIVES.find((n) => n.tokens.includes(upper));
  if (narrative) {
    const boost = narrative.heatLevel;
    (Object.keys(result) as string[]).forEach((k) => {
      result[k] = Math.min(5, Math.max(result[k], Math.floor(boost * 0.8)));
    });
  }
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 1)    return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

function formatTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ─── Signal Activity Bars ─────────────────────────────────────────────────────

function SignalActivityBars({
  ticker,
  narrativeColor,
}: {
  ticker: string;
  narrativeColor: string;
}) {
  const activity = getSignalActivity(ticker);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [ticker]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {SIGNAL_METRICS.map(({ key, label, icon: Icon }) => {
        const level = activity[key] ?? 1;
        return (
          <div
            key={key}
            className="rounded-lg p-3 flex flex-col gap-2"
            style={{ background: "#161b22", border: "1px solid #21262d" }}
          >
            <div className="flex items-center gap-1.5">
              <Icon size={11} style={{ color: narrativeColor }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6e7681]">
                {label}
              </span>
            </div>
            <div className="flex items-end gap-[3px] h-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-700"
                  style={{
                    height: mounted ? `${40 + i * 12}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                    backgroundColor: i <= level ? narrativeColor : "#21262d",
                    boxShadow: mounted && i <= level && i === level ? `0 0 6px ${narrativeColor}60` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] font-black uppercase tracking-[0.18em]"
          style={{ color: accent ?? "#484f58" }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: accent ? accent + "25" : "#21262d" }} />
      </div>
      {children}
    </div>
  );
}

// ─── Inline bold renderer ─────────────────────────────────────────────────────

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-white">{part}</strong> : part
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ScanPage() {
  const [input, setInput] = useState("");
  const [ticker, setTicker] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [verdict, setVerdict] = useState("");
  const [verdictDone, setVerdictDone] = useState(false);
  const [scannedAt, setScannedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight scan on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const runScan = useCallback(async (sym: string) => {
    const upper = sym.trim().toUpperCase();
    if (!upper) return;

    // Cancel any previous scan
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setTicker(upper);
    setScanning(true);
    setVerdict("");
    setVerdictDone(false);
    setScannedAt(new Date());

    // Find narrative
    const nar = NARRATIVES.find((n) => n.tokens.includes(upper)) ?? null;
    setNarrative(nar);

    // Filter signals
    const matching = SEED_SIGNALS.filter((s) => s.tokens.includes(upper));
    setSignals(matching);

    // Fetch prices
    try {
      const res = await fetch("/api/prices", { signal: abort.signal });
      if (res.ok) {
        const { prices: p }: { prices: PriceData[] } = await res.json();
        setPrices(p);
      }
    } catch {}

    // Atlas verdict via SSE
    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a 2-3 sentence investment verdict for $${upper}. Be specific about the narrative fit, key catalyst, and one risk. Format as a direct statement, not a question.`,
            },
          ],
        }),
        signal: abort.signal,
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") {
              setVerdictDone(true);
              break;
            }
            try {
              const parsed = JSON.parse(raw);
              if (parsed.text) {
                setVerdict((prev) => prev + parsed.text);
              }
            } catch {}
          }
        }
        setVerdictDone(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setVerdict("Atlas is unavailable — check your API key configuration.");
        setVerdictDone(true);
      }
    }

    setScanning(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) runScan(input.trim());
  };

  const handleShare = () => {
    if (!ticker) return;
    const text = `📊 SCAN REPORT: $${ticker} via Clicking\nNarrative: ${narrative?.label ?? "Unknown"}\nAtlas: "${verdict.slice(0, 100)}..."\n#crypto #${ticker}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = narrative?.color ?? "#00e5a0";
  const riskData = ticker ? (RISK_FLAGS[ticker] ?? DEFAULT_FLAGS) : DEFAULT_FLAGS;
  const tokenPrice = ticker ? prices.find((p) => p.symbol === ticker) : null;

  return (
    <div
      className="min-h-full px-4 py-8"
      style={{ background: "#0d0e12" }}
    >
      <div className="max-w-[720px] mx-auto space-y-8">

        {/* Search input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="relative flex items-center rounded-xl overflow-hidden"
            style={{ border: `1px solid ${ticker ? accentColor + "40" : "#30363d"}`, background: "#161b22" }}
          >
            <Search
              size={16}
              className="absolute left-4 flex-shrink-0"
              style={{ color: ticker ? accentColor : "#484f58" }}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Enter ticker symbol... LINK, TAO, SOL, ETH"
              className="flex-1 bg-transparent pl-11 pr-4 py-4 text-[15px] font-bold text-[#e6edf3] placeholder-[#484f58] outline-none font-mono tracking-wider"
              autoFocus
              autoCapitalize="characters"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!input.trim() || scanning}
              className="mr-3 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-[80ms] disabled:opacity-40"
              style={{
                background: accentColor + "20",
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              {scanning ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={10} className="animate-spin" />
                  Scanning
                </span>
              ) : "Scan"}
            </button>
          </div>

          {/* Example chips — only show when no ticker scanned */}
          {!ticker && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#484f58]">Try:</span>
              {EXAMPLE_TICKERS.map((sym) => {
                const nar = NARRATIVES.find((n) => n.tokens.includes(sym));
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => { setInput(sym); runScan(sym); }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all hover:opacity-80"
                    style={{
                      background: (nar?.color ?? "#484f58") + "18",
                      color: nar?.color ?? "#6e7681",
                      border: `1px solid ${(nar?.color ?? "#484f58")}30`,
                    }}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          )}
        </form>

        {/* Empty state — no scan yet */}
        {!ticker && !scanning && (
          <div className="space-y-6 pt-4">
            {/* What you get */}
            <div className="rounded-xl p-5" style={{ background: "#161b22", border: "1px solid #21262d" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#484f58] mb-3">What you get</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🎯", label: "Narrative Fit", desc: "Which story is this token part of?" },
                  { icon: "🐋", label: "Signal Activity", desc: "Whale, social, news, on-chain strength" },
                  { icon: "⚠️", label: "Risk Flags", desc: "Real risks, not generic disclaimers" },
                  { icon: "✦", label: "Atlas Verdict", desc: "2-3 sentence AI read on the opportunity" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-2.5 p-3 rounded-lg" style={{ background: "#0d0e12" }}>
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-[11px] font-bold text-[#e6edf3]">{item.label}</p>
                      <p className="text-[10px] text-[#484f58] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent scans hint */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#484f58] mb-2">Popular scans today</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { sym: "LINK", note: "RWA oracle #1" },
                  { sym: "TAO", note: "AI×Crypto breakout" },
                  { sym: "HYPE", note: "Perp DEX revenue ATH" },
                  { sym: "ONDO", note: "Institutional RWA" },
                  { sym: "RNDR", note: "Decentralized GPU" },
                ].map(({ sym, note }) => {
                  const nar = NARRATIVES.find((n) => n.tokens.includes(sym));
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => { setInput(sym); runScan(sym); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:opacity-80"
                      style={{ background: (nar?.color ?? "#484f58") + "12", border: `1px solid ${(nar?.color ?? "#484f58")}25` }}
                    >
                      <span className="text-[11px] font-black" style={{ color: nar?.color ?? "#6e7681" }}>{sym}</span>
                      <span className="text-[10px] text-[#484f58]">{note}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scanning state */}
        {scanning && (
          <div className="flex items-center gap-3 py-4">
            <div className="flex items-end gap-[3px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${8 + i * 4}px`,
                    background: accentColor,
                    animation: `signal-pulse 1s ease-in-out ${i * 0.15}s infinite alternate`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
            <span className="text-[12px] font-bold text-[#6e7681]">
              Scanning <span style={{ color: accentColor }}>${ticker}</span> — fetching narrative, signals, and Atlas verdict
            </span>
          </div>
        )}

        {/* Report */}
        {ticker && !scanning && (
          <div className="space-y-6">

            {/* Report header */}
            <div
              className="rounded-xl p-5 font-mono space-y-2"
              style={{ background: "#161b22", border: `1px solid ${accentColor}30` }}
            >
              <div className="text-[10px] text-[#484f58]">{'━'.repeat(40)}</div>
              <div>
                <span className="text-[14px] font-black tracking-widest text-[#e6edf3]">
                  SCAN REPORT:{" "}
                </span>
                <span className="text-[14px] font-black tracking-widest" style={{ color: accentColor }}>
                  ${ticker}
                </span>
              </div>
              {scannedAt && (
                <div className="text-[10px] text-[#6e7681]">
                  Generated: {formatTime(scannedAt)}
                </div>
              )}
              <div className="text-[10px] text-[#484f58]">{'━'.repeat(40)}</div>
            </div>

            {/* 1. NARRATIVE FIT */}
            <Section label="Narrative Fit" accent={accentColor}>
              {narrative ? (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: narrative.color + "0a", border: `1px solid ${narrative.color}25` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="text-[13px] font-black uppercase tracking-wide"
                        style={{ color: narrative.color }}
                      >
                        {narrative.label}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: narrative.color + "22", color: narrative.color }}
                        >
                          {narrative.heat}
                        </span>
                        <span className="text-[10px] text-[#6e7681]">
                          Heat Level {narrative.heatLevel}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end flex-shrink-0">
                      {narrative.tokens.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono tracking-wide"
                          style={{
                            background: narrative.color + "18",
                            color: t === ticker ? narrative.color : "#6e7681",
                            border: t === ticker ? `1px solid ${narrative.color}50` : "1px solid transparent",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    {narrative.summary}
                  </p>
                  {narrative.connected.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9px] text-[#484f58] uppercase tracking-widest font-bold">Connected:</span>
                      {narrative.connected.map((c) => {
                        const cn2 = NARRATIVES.find((n) => n.id === c);
                        return (
                          <span
                            key={c}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: (cn2?.color ?? "#484f58") + "18", color: cn2?.color ?? "#6e7681" }}
                          >
                            {cn2?.label ?? c.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 text-[12px] text-[#6e7681]"
                  style={{ background: "#161b22", border: "1px solid #21262d" }}
                >
                  No narrative classification found for <span className="text-[#e6edf3] font-bold">${ticker}</span>. This token may be emerging or outside tracked narratives.
                </div>
              )}
            </Section>

            {/* 2. SIGNAL ACTIVITY */}
            <Section label="Signal Activity" accent={accentColor}>
              <SignalActivityBars ticker={ticker} narrativeColor={accentColor} />
            </Section>

            {/* 3. RECENT SIGNALS */}
            <Section label="Recent Signals" accent={accentColor}>
              {signals.length > 0 ? (
                <div className="space-y-2">
                  {signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="rounded-lg p-3 relative overflow-hidden"
                      style={{ background: "#161b22", border: `1px solid ${sig.narrativeColor}20` }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ background: sig.narrativeColor }}
                      />
                      <div className="pl-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                            style={{ background: sig.narrativeColor + "20", color: sig.narrativeColor }}
                          >
                            {sig.type.toUpperCase()}
                          </span>
                          {sig.tokens.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono"
                              style={{
                                background: sig.narrativeColor + "15",
                                color: t === ticker ? sig.narrativeColor : "#6e7681",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[12px] font-semibold text-[#e6edf3] leading-snug">
                          {sig.headline}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {sig.sigs.map(([emoji, label], i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: sig.narrativeColor + "10", color: sig.narrativeColor + "cc" }}
                            >
                              <span>{emoji}</span>
                              <span>{label}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 text-[12px] text-[#6e7681]"
                  style={{ background: "#161b22", border: "1px solid #21262d" }}
                >
                  No recent signals tagged <span className="text-[#e6edf3] font-bold">${ticker}</span> in the current intelligence window.
                </div>
              )}
            </Section>

            {/* 4. RISK FLAGS */}
            <Section label="Risk Flags" accent={accentColor}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Warnings */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: "#161b22", border: "1px solid #FF3D5725" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} style={{ color: "#FF3D57" }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FF3D57]">Warnings</span>
                  </div>
                  {riskData.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-[13px] leading-tight">⚠️</span>
                      <span className="text-[11px] text-[#8b949e] leading-snug">{w}</span>
                    </div>
                  ))}
                </div>

                {/* Positives */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: "#161b22", border: "1px solid #27C96A25" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldCheck size={12} style={{ color: "#27C96A" }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#27C96A]">Positives</span>
                  </div>
                  {riskData.positives.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-[13px] leading-tight">✅</span>
                      <span className="text-[11px] text-[#8b949e] leading-snug">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* 5. MARKET DATA */}
            <Section label="Market Data" accent={accentColor}>
              {tokenPrice ? (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#161b22", border: "1px solid #21262d" }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[11px] text-[#6e7681] uppercase tracking-widest font-bold mb-1">
                        {ticker}
                      </div>
                      <div className="text-[28px] font-black text-[#e6edf3] leading-none font-mono tabular-nums">
                        {formatPrice(tokenPrice.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#6e7681] mb-1">24h Change</div>
                      <div
                        className="text-[20px] font-black font-mono tabular-nums"
                        style={{ color: tokenPrice.change24h >= 0 ? "#27C96A" : "#FF3D57" }}
                      >
                        {tokenPrice.change24h >= 0 ? "+" : ""}{tokenPrice.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#27C96A] animate-pulse" />
                      <span className="text-[9px] text-[#27C96A] font-bold uppercase tracking-widest">Live · CoinGecko</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 text-[12px] text-[#6e7681]"
                  style={{ background: "#161b22", border: "1px solid #21262d" }}
                >
                  Price data not available for <span className="text-[#e6edf3] font-bold">${ticker}</span>. This token may not be in the tracked price feed.
                </div>
              )}
            </Section>

            {/* 6. ATLAS VERDICT */}
            <Section label="Atlas Verdict" accent={accentColor}>
              <div
                className="rounded-xl p-5 relative overflow-hidden"
                style={{
                  background: accentColor + "06",
                  border: `1px solid ${accentColor}30`,
                }}
              >
                {/* Glow */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                  style={{ background: accentColor + "08" }}
                />
                <div className="flex items-start gap-3 relative">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                    style={{ background: accentColor + "20" }}
                  >
                    <span className="text-[12px]">⚡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {verdict ? (
                      <p className="text-[13px] text-[#e6edf3] leading-relaxed">
                        {renderBold(verdict)}
                        {!verdictDone && (
                          <span
                            className="inline-block w-[2px] h-[13px] ml-0.5 align-middle animate-pulse rounded-sm"
                            style={{ background: accentColor }}
                          />
                        )}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-[12px] text-[#6e7681]">
                        <span className="flex items-center gap-[3px]" aria-label="Loading">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: accentColor,
                                animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                              }}
                            />
                          ))}
                        </span>
                        Atlas generating verdict for ${ticker}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Share button */}
            <div className="flex items-center justify-end pt-2 pb-8">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-[80ms] hover:opacity-80"
                style={{
                  background: accentColor + "18",
                  color: accentColor,
                  border: `1px solid ${accentColor}35`,
                }}
              >
                {copied ? (
                  <>
                    <Copy size={12} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 size={12} />
                    Share Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes signal-pulse {
          from { transform: scaleY(0.6); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
