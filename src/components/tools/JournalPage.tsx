"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, X, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trade {
  id: string;
  token: string;
  action: "buy" | "sell";
  amountUsd: number;
  entryPrice: number;
  exitPrice?: number;
  thesis: string;
  triggers: string[];
  target?: number;
  stop?: number;
  horizon: string;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
  atlasReview?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_TRADES: Trade[] = [
  {
    id: "t1", token: "LINK", action: "buy", amountUsd: 500, entryPrice: 11.20,
    thesis: "RWA narrative + whale accumulation. Bank of England integration = infrastructure lock-in.",
    triggers: ["signal_feed", "atlas"], target: 18.00, stop: 9.50, horizon: "3months",
    status: "open", openedAt: "2026-04-10T09:30:00Z",
  },
  {
    id: "t2", token: "TAO", action: "buy", amountUsd: 800, entryPrice: 380,
    thesis: "AI subnet revenue ATH. First decentralized AI network with real on-chain earnings.",
    triggers: ["scope", "signal_feed"], target: 600, stop: 300, horizon: "3months",
    status: "open", openedAt: "2026-04-08T14:00:00Z",
  },
  {
    id: "t3", token: "PEPE", action: "buy", amountUsd: 200, entryPrice: 0.000012,
    thesis: "", triggers: ["fomo", "social_media"], horizon: "1week",
    status: "closed", openedAt: "2026-03-15T10:00:00Z", closedAt: "2026-03-20T16:00:00Z",
    exitPrice: 0.000008,
    atlasReview: "You entered this trade with social media hype as your only trigger and no written thesis. PEPE belongs to no established narrative on The Scope and showed no institutional backing or whale accumulation. This is the pattern to eliminate — no thesis, no entry.",
  },
];

// ─── Score formula ────────────────────────────────────────────────────────────

function calculateScore(trades: Trade[]): number {
  if (!trades.length) return 0;
  let total = 0;
  for (const t of trades) {
    if (t.thesis && t.thesis.length > 10) total += 10;
    if (t.triggers.includes("signal_feed")) total += 5;
    if (t.triggers.includes("atlas")) total += 5;
    if (t.target) total += 5;
    if (t.triggers.includes("fomo")) total -= 10;
    if (!t.thesis || t.thesis.length < 5) total -= 15;
    if (t.status === "closed" && t.exitPrice && t.exitPrice > t.entryPrice && t.action === "buy") total += 10;
    if (t.stop && t.status === "closed" && t.exitPrice) total += 5;
  }
  return Math.max(0, Math.min(100, Math.round(total / Math.max(trades.length, 1) * 3)));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 71) return "#3fb950";
  if (score >= 41) return "#fbbf24";
  return "#f85149";
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  if (p >= 0.01) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(8)}`;
}

function pnlPct(entry: number, exit: number, action: "buy" | "sell"): number {
  if (action === "buy") return ((exit - entry) / entry) * 100;
  return ((entry - exit) / entry) * 100;
}

const TRIGGER_LABELS: Record<string, string> = {
  signal_feed: "Signal Feed",
  atlas: "Atlas",
  scope: "The Scope",
  own_research: "Own Research",
  social_media: "Social Media",
  fomo: "FOMO ⚠️",
};

const HORIZON_LABELS: Record<string, string> = {
  "1week": "1 Week",
  "1month": "1 Month",
  "3months": "3 Months",
  "1year": "1 Year",
};

// ─── Score Gauge ──────────────────────────────────────────────────────────────

const SCORE_FACTORS = [
  { label: "Wrote thesis", mod: "+10", color: "#3fb950", tooltip: "Writing a thesis before entering forces you to articulate your reason. Trades with written theses close with better outcomes on average." },
  { label: "Used signal feed", mod: "+5", color: "#3fb950", tooltip: "Entering based on a signal from the feed means data-driven conviction, not noise." },
  { label: "Set price target", mod: "+5", color: "#3fb950", tooltip: "Having a target price forces you to define your exit before emotion can override logic." },
  { label: "Used Atlas signal", mod: "+5", color: "#3fb950", tooltip: "Atlas-confirmed trades have institutional narrative backing — a strong edge in crypto." },
  { label: "FOMO entry", mod: "−10", color: "#f85149", tooltip: "FOMO-driven entries typically come after a significant move has already happened. You're usually buying someone else's exit." },
  { label: "No thesis", mod: "−15", color: "#f85149", tooltip: "No thesis means no plan. If you can't write down why you're entering, you likely don't have a real edge." },
];

function ScoreGauge({ score, tradeCount }: { score: number; tradeCount: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = scoreColor(score);
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const displayDash = animated ? dash : 0;

  return (
    <div className="rounded-2xl border border-[#21262d] bg-[#161b22] p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#21262d" strokeWidth="8" />
            <circle
              cx="70" cy="70" r={radius} fill="none"
              stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${displayDash} ${circumference}`}
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums" style={{ color }}>{score}</span>
            <span className="text-[10px] font-bold text-[#484f58] mt-0.5 uppercase tracking-wide">DQ Score</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 relative">
          <p className="text-[11px] text-[#6e7681] mb-3">Based on {tradeCount} logged trade{tradeCount !== 1 ? "s" : ""}</p>
          <div className="space-y-1.5">
            {SCORE_FACTORS.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between cursor-help group relative"
                onMouseEnter={() => setTooltip(f.label)}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className="text-[11px] text-[#8b949e] group-hover:text-[#e6edf3] transition-colors flex items-center gap-1">
                  {f.label}
                  <span className="text-[9px] text-[#484f58] group-hover:text-[#6e7681]">ⓘ</span>
                </span>
                <span
                  className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md"
                  style={{
                    color: f.color,
                    backgroundColor: f.color === "#3fb950" ? "#3fb95018" : "#f8514918",
                  }}
                >{f.mod}</span>
                {tooltip === f.label && (
                  <div
                    className="absolute left-0 bottom-full mb-1.5 z-20 w-56 rounded-lg px-3 py-2 text-[11px] text-[#8b949e] leading-relaxed shadow-xl pointer-events-none"
                    style={{ background: "#1c2128", border: "1px solid #30363d" }}
                  >
                    {f.tooltip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trade Card ───────────────────────────────────────────────────────────────

function TradeCard({
  trade,
  onClose,
  onAskAtlas,
}: {
  trade: Trade;
  onClose: (t: Trade) => void;
  onAskAtlas: (t: Trade) => void;
}) {
  // Fake current price drift for open trades
  const fakeDrift = 1 + (((trade.token.charCodeAt(0) % 7) - 3) * 0.02);
  const currentPrice = trade.status === "open" ? trade.entryPrice * fakeDrift : (trade.exitPrice ?? trade.entryPrice);
  const pct = pnlPct(trade.entryPrice, currentPrice, trade.action);
  const isWin = trade.status === "closed"
    ? (trade.exitPrice ? pnlPct(trade.entryPrice, trade.exitPrice, trade.action) >= 0 : false)
    : pct >= 0;

  const leftBorderColor = trade.status === "open"
    ? "#3fb95040"
    : isWin
    ? "#3fb95040"
    : "#f8514940";

  return (
    <div
      className="rounded-xl border border-[#21262d] bg-[#161b22] p-4 space-y-3 hover:border-[#30363d] transition-colors duration-[80ms]"
      style={{ borderLeft: `3px solid ${leftBorderColor}` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-black text-[#e6edf3]">{trade.token}</span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide"
            style={
              trade.action === "buy"
                ? { backgroundColor: "#3fb95018", color: "#3fb950" }
                : { backgroundColor: "#f8514918", color: "#f85149" }
            }
          >
            {trade.action}
          </span>
          {trade.status === "closed" && (
            <span
              className="text-[11px] font-black"
              style={{ color: isWin ? "#3fb950" : "#f85149" }}
            >
              {isWin ? "✓ WIN" : "✗ LOSS"}
            </span>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[12px] font-bold text-[#e6edf3] tabular-nums">
            {formatPrice(trade.entryPrice)}
            {trade.status === "open" && (
              <span className="text-[#484f58]"> → {formatPrice(currentPrice)}</span>
            )}
            {trade.status === "closed" && trade.exitPrice && (
              <span className="text-[#484f58]"> → {formatPrice(trade.exitPrice)}</span>
            )}
          </p>
          <p
            className="text-[12px] font-black tabular-nums mt-0.5"
            style={{ color: pct >= 0 ? "#3fb950" : "#f85149" }}
          >
            {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Thesis */}
      {trade.thesis ? (
        <p className="text-[12px] text-[#8b949e] italic leading-relaxed line-clamp-2">
          &ldquo;{trade.thesis}&rdquo;
        </p>
      ) : (
        <p className="text-[12px] text-[#484f58] italic">No thesis written.</p>
      )}

      {/* Triggers */}
      <div className="flex flex-wrap gap-1">
        {trade.triggers.map((trig) => (
          <span
            key={trig}
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={
              trig === "fomo" || trig === "social_media"
                ? { backgroundColor: "#f8514912", color: "#f85149" }
                : { backgroundColor: "#21262d", color: "#8b949e" }
            }
          >
            {TRIGGER_LABELS[trig] ?? trig}
          </span>
        ))}
      </div>

      {/* Target / Stop */}
      {(trade.target || trade.stop) && (
        <div className="flex items-center gap-4 text-[11px]">
          {trade.target && (
            <span className="text-[#3fb950]">Target: {formatPrice(trade.target)}</span>
          )}
          {trade.stop && (
            <span className="text-[#f85149]">Stop: {formatPrice(trade.stop)}</span>
          )}
          <span className="text-[#484f58]">{HORIZON_LABELS[trade.horizon] ?? trade.horizon}</span>
        </div>
      )}

      {/* Atlas review (closed trades) */}
      {trade.atlasReview && (
        <div className="flex gap-2 p-3 rounded-lg border border-[#a78bfa]/20 bg-[#a78bfa]/[0.04]">
          <span className="text-base flex-shrink-0">🤖</span>
          <p className="text-[11px] text-[#8b949e] leading-relaxed italic">{trade.atlasReview}</p>
        </div>
      )}

      {/* Actions */}
      {trade.status === "open" && (
        <div className="flex items-center gap-2 pt-1 border-t border-[#21262d]">
          <button
            onClick={() => onClose(trade)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3] transition-all duration-[80ms]"
          >
            Close Trade
          </button>
          <button
            onClick={() => onAskAtlas(trade)}
            className="py-1.5 px-3 rounded-lg text-[11px] font-bold border border-[#a78bfa]/30 bg-[#a78bfa]/[0.06] text-[#a78bfa] hover:bg-[#a78bfa]/[0.12] hover:border-[#a78bfa]/50 transition-all duration-[80ms]"
          >
            Ask Atlas
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Log Trade Modal ──────────────────────────────────────────────────────────

const TRIGGER_OPTIONS = [
  { id: "signal_feed", label: "Whale signal from the feed" },
  { id: "atlas", label: "Atlas recommendation" },
  { id: "scope", label: "Scope narrative heat" },
  { id: "own_research", label: "My own research" },
  { id: "social_media", label: "Friend / social media" },
  { id: "fomo", label: "FOMO", warn: true },
];

const HORIZON_OPTIONS = [
  { value: "1week", label: "1 Week" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months" },
  { value: "1year", label: "1 Year" },
];

function LogTradeModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Trade) => void }) {
  const [token, setToken] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [amountUsd, setAmountUsd] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [thesis, setThesis] = useState("");
  const [target, setTarget] = useState("");
  const [stop, setStop] = useState("");
  const [horizon, setHorizon] = useState("3months");

  const hasFomo = triggers.includes("fomo");
  const canSubmit = token.trim().length > 0 && thesis.trim().length > 0 && entryPrice.length > 0;

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const newTrade: Trade = {
      id: `t${Date.now()}`,
      token: token.toUpperCase(),
      action,
      amountUsd: parseFloat(amountUsd) || 0,
      entryPrice: parseFloat(entryPrice),
      thesis,
      triggers,
      target: target ? parseFloat(target) : undefined,
      stop: stop ? parseFloat(stop) : undefined,
      horizon,
      status: "open",
      openedAt: new Date().toISOString(),
    };
    onSave(newTrade);
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d] flex-shrink-0">
          <h2 className="text-[14px] font-black text-[#e6edf3]">Log Trade</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Token */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Token</label>
            <input
              type="text"
              placeholder="e.g. LINK"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
            />
          </div>

          {/* Action */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Action</label>
            <div className="flex gap-2">
              {(["buy", "sell"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className="flex-1 py-2 rounded-lg border text-[12px] font-bold uppercase transition-all duration-[80ms]"
                  style={
                    action === a
                      ? a === "buy"
                        ? { borderColor: "#3fb950", backgroundColor: "#3fb95018", color: "#3fb950" }
                        : { borderColor: "#f85149", backgroundColor: "#f8514918", color: "#f85149" }
                      : { borderColor: "#21262d", backgroundColor: "transparent", color: "#6e7681" }
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Entry Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Amount (USD)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Entry Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 11.20"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-2 uppercase tracking-wide">Why are you entering?</label>
            <div className="space-y-2">
              {TRIGGER_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={triggers.includes(opt.id)}
                    onChange={() => toggleTrigger(opt.id)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-[80ms]"
                    style={
                      triggers.includes(opt.id)
                        ? { borderColor: "#7c6af7", backgroundColor: "#7c6af7" }
                        : { borderColor: "#30363d", backgroundColor: "transparent" }
                    }
                  >
                    {triggers.includes(opt.id) && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-[12px]"
                    style={
                      opt.warn && triggers.includes(opt.id)
                        ? { color: "#f85149", fontWeight: 700 }
                        : { color: "#8b949e" }
                    }
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {hasFomo && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-[#f8514912] border border-[#f85149]/20 text-[11px] text-[#f85149]">
                ⚠️ FOMO trades have the worst decision quality scores. Are you sure?
              </div>
            )}
          </div>

          {/* Thesis */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">
              Thesis <span className="text-[#f85149]">*</span>
            </label>
            <textarea
              placeholder="What do you expect to happen? Why this token, why now?"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={3}
              className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors resize-none"
            />
          </div>

          {/* Target + Stop */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Target Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 18.00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Stop Loss ($)</label>
              <input
                type="number"
                placeholder="e.g. 9.50"
                value={stop}
                onChange={(e) => setStop(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
            </div>
          </div>

          {/* Horizon */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Time Horizon</label>
            <div className="relative">
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="w-full appearance-none bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] focus:outline-none focus:border-[#7c6af7]/50 transition-colors pr-8"
              >
                {HORIZON_OPTIONS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#21262d] flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-lg text-[13px] font-black transition-all duration-[80ms] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#27C96A", color: "white" }}
          >
            LOG TRADE
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

// ─── Close Trade Modal ────────────────────────────────────────────────────────

function CloseTradeModal({
  trade,
  onClose,
  onSave,
}: {
  trade: Trade;
  onClose: () => void;
  onSave: (exitPrice: number, atlasReview: string) => void;
}) {
  const [exitPrice, setExitPrice] = useState("");
  const [atlasReview, setAtlasReview] = useState("");
  const [loadingAtlas, setLoadingAtlas] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleGenerateAtlas = async () => {
    if (!exitPrice) return;
    setLoadingAtlas(true);
    setAtlasReview("");
    const exit = parseFloat(exitPrice);
    const prompt = `Trade: ${trade.action.toUpperCase()} $${trade.token} at $${trade.entryPrice}, closed at $${exit}\nThesis was: "${trade.thesis}"\nTriggers: ${trade.triggers.join(", ")}\nOutcome: ${exit > trade.entryPrice ? "WIN" : "LOSS"}\n\nWrite a 2-3 sentence Atlas review of this trade's decision quality. Be honest and specific. Focus on the reasoning, not just the outcome.`;

    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setAtlasReview((prev) => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setAtlasReview("Atlas review unavailable. Check your API key.");
      }
    } finally {
      setLoadingAtlas(false);
    }
  };

  const handleSave = () => {
    if (!exitPrice) return;
    onSave(parseFloat(exitPrice), atlasReview);
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-[14px] font-black text-[#e6edf3]">Close Trade — {trade.token}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
            <X size={13} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Exit price */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Exit Price ($)</label>
            <input
              type="number"
              placeholder={`Entry was ${formatPrice(trade.entryPrice)}`}
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
            />
            {exitPrice && (
              <p className="text-[11px] mt-1" style={{
                color: parseFloat(exitPrice) > trade.entryPrice ? "#3fb950" : "#f85149"
              }}>
                P&L: {pnlPct(trade.entryPrice, parseFloat(exitPrice), trade.action).toFixed(2)}%
              </p>
            )}
          </div>

          {/* Atlas review */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[#6e7681] uppercase tracking-wide">Atlas Review</label>
              <button
                onClick={handleGenerateAtlas}
                disabled={!exitPrice || loadingAtlas}
                className="text-[10px] font-bold px-2 py-1 rounded-md border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loadingAtlas ? "Generating..." : "Generate Atlas Review"}
              </button>
            </div>
            <div className="min-h-[80px] bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[12px] text-[#8b949e] italic leading-relaxed">
              {atlasReview || (
                <span className="text-[#484f58]">Click &quot;Generate Atlas Review&quot; for AI feedback on your decision quality.</span>
              )}
              {loadingAtlas && <span className="animate-pulse">▊</span>}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!exitPrice}
            className="w-full py-2.5 rounded-lg text-[13px] font-black transition-all duration-[80ms] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#7c6af7", color: "white" }}
          >
            CLOSE TRADE
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function JournalPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("cc_journal");
      if (stored) {
        setTrades(JSON.parse(stored));
      } else {
        setTrades(SEED_TRADES);
        localStorage.setItem("cc_journal", JSON.stringify(SEED_TRADES));
      }
    } catch {
      setTrades(SEED_TRADES);
    }
  }, []);

  const save = (updated: Trade[]) => {
    setTrades(updated);
    try {
      localStorage.setItem("cc_journal", JSON.stringify(updated));
    } catch {}
  };

  const addTrade = (t: Trade) => save([...trades, t]);

  const closeTrade = (id: string, exitPrice: number, atlasReview: string) => {
    save(trades.map((t) =>
      t.id === id
        ? { ...t, status: "closed", exitPrice, closedAt: new Date().toISOString(), atlasReview: atlasReview || undefined }
        : t
    ));
  };

  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const score = calculateScore(trades);

  const handleAskAtlas = (trade: Trade) => {
    router.push(`/atlas?q=${encodeURIComponent(`Review my ${trade.action} on ${trade.token}: ${trade.thesis}`)}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* DQ Score */}
      <ScoreGauge score={score} tradeCount={trades.length} />

      {/* Log Trade button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#484f58] uppercase">Trade Log</p>
          <h2 className="text-lg font-black text-[#e6edf3] mt-0.5">MY JOURNAL</h2>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all duration-[80ms] border border-[#27C96A]/40 bg-[#27C96A]/[0.08] text-[#27C96A] hover:bg-[#27C96A]/[0.15] hover:border-[#27C96A]/60"
        >
          <Plus size={13} />
          LOG TRADE
        </button>
      </div>

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-[0.15em] text-[#3fb950] uppercase">Open Trades</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#3fb95018] text-[#3fb950]">{openTrades.length}</span>
          </div>
          <div className="space-y-3">
            {openTrades.map((t) => (
              <TradeCard
                key={t.id}
                trade={t}
                onClose={(trade) => setClosingTrade(trade)}
                onAskAtlas={handleAskAtlas}
              />
            ))}
          </div>
        </section>
      )}

      {/* Closed Trades */}
      {closedTrades.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-[0.15em] text-[#484f58] uppercase">Closed Trades</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#21262d] text-[#484f58]">{closedTrades.length}</span>
          </div>
          <div className="space-y-3">
            {closedTrades.map((t) => (
              <TradeCard
                key={t.id}
                trade={t}
                onClose={(trade) => setClosingTrade(trade)}
                onAskAtlas={handleAskAtlas}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {trades.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#30363d] p-10 flex flex-col items-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "#7c6af718", border: "1px solid #7c6af730" }}
          >
            📓
          </div>
          <div>
            <p className="text-[15px] font-black text-[#e6edf3] mb-1">No trades logged yet</p>
            <p className="text-[12px] text-[#6e7681] leading-relaxed max-w-xs">
              Every logged trade builds your Decision Quality Score. Write your thesis, track your triggers, and let Atlas review your calls.
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold transition-all duration-[80ms] border border-[#27C96A]/40 bg-[#27C96A]/[0.08] text-[#27C96A] hover:bg-[#27C96A]/[0.15] hover:border-[#27C96A]/60"
          >
            <Plus size={13} />
            Log your first trade
          </button>
        </div>
      )}

      {/* Modals */}
      {mounted && showLogModal && (
        <LogTradeModal onClose={() => setShowLogModal(false)} onSave={addTrade} />
      )}
      {mounted && closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onClose={() => setClosingTrade(null)}
          onSave={(exitPrice, atlasReview) => {
            closeTrade(closingTrade.id, exitPrice, atlasReview);
            setClosingTrade(null);
          }}
        />
      )}
    </div>
  );
}
