"use client";

import Link from "next/link";
import {
  Wallet,
  Lock,
  ExternalLink,
  Shield,
  Plus,
  ChevronRight,
  Bot,
  X,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectModal";
import { useWalletStore } from "@/store/wallet-store";
import { SUPPORTED_CHAINS } from "@/lib/wagmi-config";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { NARRATIVE_MAP } from "@/lib/narratives";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  token: string;
  amount: number;
  entryPrice: number;
  narrativeId: string;
  target: number;
  stop: number;
}

// ─── Mock positions ───────────────────────────────────────────────────────────

const MOCK_POSITIONS: Position[] = [
  { token: "LINK", amount: 200,  entryPrice: 11.20, narrativeId: "rwa", target: 18.00, stop: 9.50  },
  { token: "TAO",  amount: 1.5,  entryPrice: 380,   narrativeId: "ai",  target: 600,   stop: 300   },
  { token: "SOL",  amount: 4,    entryPrice: 155,   narrativeId: "l1",  target: 220,   stop: 130   },
];

const LS_KEY = "clicking_positions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function pnlPct(entry: number, current: number) {
  return ((current - entry) / entry) * 100;
}

// ─── Add Position Modal ───────────────────────────────────────────────────────

interface AddPositionModalProps {
  onClose: () => void;
  onAdd: (p: Position) => void;
}

function AddPositionModal({ onClose, onAdd }: AddPositionModalProps) {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [entry, setEntry] = useState("");
  const [target, setTarget] = useState("");
  const [stop, setStop] = useState("");
  const [narrativeId, setNarrativeId] = useState("rwa");

  const cryptoNarratives = Object.values(NARRATIVE_MAP).filter(
    (n) => !n.domain || n.domain === "crypto" || n.domain === "both"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !amount || !entry) return;
    onAdd({
      token: token.toUpperCase().trim(),
      amount: parseFloat(amount),
      entryPrice: parseFloat(entry),
      narrativeId,
      target: parseFloat(target) || parseFloat(entry) * 1.5,
      stop: parseFloat(stop) || parseFloat(entry) * 0.85,
    });
    onClose();
  }

  const overlayRef = useRef<HTMLDivElement>(null);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#161b22", border: "1px solid #30363d" }}
      >
        {/* Modal header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#21262d" }}
        >
          <div className="flex items-center gap-2">
            <Plus size={14} className="text-[#7c6af7]" />
            <span className="text-[13px] font-bold text-[#e6edf3]">
              Add Position
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#484f58] hover:text-[#8b949e] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Token */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
              Token Ticker
            </label>
            <input
              type="text"
              placeholder="e.g. ETH"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-[12px] font-mono font-bold text-[#e6edf3] outline-none transition-colors uppercase placeholder:normal-case placeholder:font-normal"
              style={{
                background: "#0d0e12",
                border: "1px solid #30363d",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#7c6af7")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#30363d")
              }
            />
          </div>

          {/* Narrative */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
              Narrative
            </label>
            <select
              value={narrativeId}
              onChange={(e) => setNarrativeId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[12px] text-[#e6edf3] outline-none"
              style={{
                background: "#0d0e12",
                border: "1px solid #30363d",
              }}
            >
              {cryptoNarratives.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount + Entry row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
                Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="any"
                className="w-full rounded-lg px-3 py-2 text-[12px] font-mono text-[#e6edf3] outline-none"
                style={{ background: "#0d0e12", border: "1px solid #30363d" }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#7c6af7")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#30363d")
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
                Entry Price ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                required
                min="0"
                step="any"
                className="w-full rounded-lg px-3 py-2 text-[12px] font-mono text-[#e6edf3] outline-none"
                style={{ background: "#0d0e12", border: "1px solid #30363d" }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#7c6af7")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#30363d")
                }
              />
            </div>
          </div>

          {/* Target + Stop row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
                Target ($)
              </label>
              <input
                type="number"
                placeholder="Auto"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min="0"
                step="any"
                className="w-full rounded-lg px-3 py-2 text-[12px] font-mono text-[#e6edf3] outline-none"
                style={{ background: "#0d0e12", border: "1px solid #30363d" }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#3fb950")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#30363d")
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484f58] mb-1.5">
                Stop ($)
              </label>
              <input
                type="number"
                placeholder="Auto"
                value={stop}
                onChange={(e) => setStop(e.target.value)}
                min="0"
                step="any"
                className="w-full rounded-lg px-3 py-2 text-[12px] font-mono text-[#e6edf3] outline-none"
                style={{ background: "#0d0e12", border: "1px solid #30363d" }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#f85149")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#30363d")
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-[12px] font-bold text-white transition-opacity hover:opacity-90 mt-1"
            style={{ background: "#7c6af7" }}
          >
            Add Position
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── Position Card ─────────────────────────────────────────────────────────────

function PositionCard({
  position,
  onTargetChange,
}: {
  position: Position;
  onTargetChange: (token: string, target: number) => void;
}) {
  const narrative = NARRATIVE_MAP[position.narrativeId];
  const narrativeColor = narrative?.color ?? "#7c6af7";

  // No live price — show entry as "current" for now
  const currentPrice = position.entryPrice;
  const totalValue = position.amount * currentPrice;
  const pnl = pnlPct(position.entryPrice, currentPrice);
  const pnlPositive = pnl >= 0;

  // Progress bar: 0 = stop, 100 = target
  const range = position.target - position.stop;
  const progressPct =
    range > 0
      ? Math.max(
          0,
          Math.min(100, ((currentPrice - position.stop) / range) * 100)
        )
      : 0;

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState(String(position.target));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTarget && inputRef.current) inputRef.current.focus();
  }, [editingTarget]);

  function commitTarget() {
    const val = parseFloat(targetDraft);
    if (!isNaN(val) && val > 0) onTargetChange(position.token, val);
    setEditingTarget(false);
  }

  return (
    <div
      className="rounded-xl p-3 transition-all duration-150 hover:border-[#30363d]"
      style={{
        background: "#0d0e12",
        border: "1px solid #21262d",
        borderLeft: `3px solid ${narrativeColor}`,
      }}
    >
      {/* Top row: token + narrative + value */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="text-[16px] font-black text-[#e6edf3]"
              style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
            >
              {position.token}
            </span>
            {narrative && (
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded"
                style={{
                  background: narrativeColor + "18",
                  color: narrativeColor,
                }}
              >
                {narrative.label}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#6e7681]">
            {fmt(position.amount, position.amount < 10 ? 3 : 0)} tokens
          </span>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-bold text-[#e6edf3]">
            ${fmt(totalValue, 0)}
          </p>
          <div
            className="flex items-center gap-0.5 text-[10px] font-bold justify-end"
            style={{ color: pnlPositive ? "#3fb950" : "#f85149" }}
          >
            {pnlPositive ? (
              <TrendingUp size={9} />
            ) : (
              <TrendingDown size={9} />
            )}
            {pnlPositive ? "+" : ""}
            {fmt(pnl, 1)}%
          </div>
          <p className="text-[9px] text-[#484f58] mt-0.5">
            entry price
          </p>
        </div>
      </div>

      {/* Entry → Target */}
      <div className="flex items-center gap-1.5 mb-2 text-[10px]">
        <span className="text-[#6e7681]">Entry</span>
        <span className="font-mono font-bold text-[#e6edf3]">
          ${fmt(position.entryPrice)}
        </span>
        <span
          className="font-bold"
          style={{ color: pnl >= 0 ? "#3fb950" : "#f85149" }}
        >
          {pnl >= 0 ? "↑" : "↓"}{Math.abs(pnl).toFixed(1)}%
        </span>
        <span className="text-[#484f58]">→</span>
        <span className="text-[#6e7681]">Target</span>
        {editingTarget ? (
          <input
            ref={inputRef}
            type="number"
            value={targetDraft}
            onChange={(e) => setTargetDraft(e.target.value)}
            onBlur={commitTarget}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTarget();
              if (e.key === "Escape") setEditingTarget(false);
            }}
            className="w-16 rounded px-1 py-0.5 text-[10px] font-mono text-[#3fb950] outline-none"
            style={{ background: "#21262d", border: "1px solid #3fb950" }}
          />
        ) : (
          <button
            onClick={() => {
              setTargetDraft(String(position.target));
              setEditingTarget(true);
            }}
            className="font-mono font-bold transition-colors hover:underline"
            style={{ color: "#3fb950" }}
            title="Click to edit target"
          >
            ${fmt(position.target)}
          </button>
        )}
        <Target size={9} style={{ color: "#3fb950", marginLeft: 1 }} />
      </div>

      {/* Progress bar */}
      <div className="mb-2.5">
        <div
          className="h-1.5 rounded-full overflow-hidden relative"
          style={{ background: "#21262d" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${narrativeColor}80, ${narrativeColor})`,
            }}
          />
          {/* Stop marker at left edge */}
          <div
            className="absolute top-0 h-full w-[2px]"
            style={{ left: 0, background: "#f85149" }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] font-mono text-[#f85149]">
            SL ${fmt(position.stop)}
          </span>
          <span className="text-[9px] font-mono text-[#3fb950]">
            TP ${fmt(position.target)}
          </span>
        </div>
      </div>

      {/* Ask Atlas */}
      <Link
        href={`/atlas?q=${encodeURIComponent(
          `What's the outlook for ${position.token}? I'm in at $${position.entryPrice} with a target of $${position.target}.`
        )}`}
        className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-md transition-colors hover:opacity-90"
        style={{
          background: "#a78bfa10",
          color: "#a78bfa",
          border: "1px solid #a78bfa20",
        }}
      >
        <Bot size={9} />
        Ask Atlas
      </Link>
    </div>
  );
}

// ─── Portfolio ─────────────────────────────────────────────────────────────────

export function Portfolio() {
  const { wallets, activeWalletAddress, setActiveWallet } = useWalletStore();
  const [showAll, setShowAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load custom positions from localStorage + merge with mock
  const [customPositions, setCustomPositions] = useState<Position[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCustomPositions(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function handleAddPosition(p: Position) {
    const next = [...customPositions, p];
    setCustomPositions(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function handleTargetChange(token: string, newTarget: number) {
    // Update in customPositions first, else it's a mock position adjustment
    const inCustom = customPositions.findIndex((p) => p.token === token);
    if (inCustom !== -1) {
      const next = customPositions.map((p) =>
        p.token === token ? { ...p, target: newTarget } : p
      );
      setCustomPositions(next);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    // For mock positions, we can't persist — just shows inline (no-op on re-mount)
  }

  const totalEth = wallets.reduce((sum, w) => {
    const bal = parseFloat(w.ethBalance ?? "0");
    return sum + (isNaN(bal) ? 0 : bal);
  }, 0);

  const displayWallets = showAll ? wallets : wallets.slice(0, 3);
  const allPositions = [...MOCK_POSITIONS, ...customPositions];

  return (
    <>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#21262d", background: "#161b22" }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "#21262d" }}
        >
          <div className="flex items-center gap-2">
            <Wallet size={13} className="text-[#7c6af7]" />
            <span className="text-[13px] font-bold text-[#e6edf3]">
              Portfolio
            </span>
            {wallets.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3fb95018] text-[#3fb950]">
                {wallets.length} wallet{wallets.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {wallets.length > 0 && (
            <WalletConnectButton
              variant="compact"
              className="text-[10px] px-2 py-1"
            />
          )}
        </div>

        {wallets.length === 0 ? (
          /* ── Empty / connect state ── */
          <div className="p-5 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "#7c6af718",
                  border: "1px solid #7c6af730",
                }}
              >
                <Wallet size={24} className="text-[#7c6af7]" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#0d0e12", border: "1px solid #7c6af740" }}
              >
                <Lock size={9} className="text-[#7c6af7]" />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#e6edf3] mb-1">
                Connect your wallets
              </p>
              <p className="text-[11px] text-[#6e7681] leading-relaxed max-w-[200px]">
                Track positions, yields, and net worth across every chain.
                Connect up to 100 wallets.
              </p>
            </div>

            <WalletConnectButton className="w-full justify-center" />

            <div className="w-full space-y-1.5 pt-1">
              {[
                { label: "Total net worth", value: "—", color: "#7c6af7" },
                { label: "Active positions", value: "—", color: "#00d2e6" },
                {
                  label: "Earned yield (30d)",
                  value: "—",
                  color: "#3fb950",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{
                    background: "#21262d",
                    border: "1px solid #30363d",
                  }}
                >
                  <span className="text-[11px] text-[#6e7681]">
                    {row.label}
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-[#484f58] flex items-center gap-1">
              <Shield size={9} />
              Non-custodial · Read-only · We never hold your funds
            </p>
          </div>
        ) : (
          /* ── Connected state ── */
          <div>
            {/* Summary row */}
            <div
              className="grid grid-cols-3 divide-x"
              style={{ borderColor: "#21262d" }}
            >
              <div className="px-4 py-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-[#484f58] mb-1">
                  Wallets
                </p>
                <p className="text-[15px] font-black text-[#e6edf3]">
                  {wallets.length}
                </p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-[#484f58] mb-1">
                  ETH Balance
                </p>
                <p
                  className="text-[15px] font-black"
                  style={{ color: "#627EEA" }}
                >
                  {totalEth > 0 ? totalEth.toFixed(3) : "—"}
                </p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-[#484f58] mb-1">
                  Chains
                </p>
                <p className="text-[15px] font-black text-[#e6edf3]">
                  {new Set(wallets.map((w) => w.chainId)).size}
                </p>
              </div>
            </div>

            {/* Wallet list */}
            <div
              className="divide-y border-t"
              style={{ borderColor: "#21262d" }}
            >
              {displayWallets.map((wallet) => {
                const isActive =
                  activeWalletAddress?.toLowerCase() ===
                  wallet.address.toLowerCase();
                const chain = SUPPORTED_CHAINS.find(
                  (c) => c.id === wallet.chainId
                );
                return (
                  <button
                    key={wallet.address}
                    onClick={() => setActiveWallet(wallet.address)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-[80ms]",
                      isActive ? "bg-[#7c6af710]" : "hover:bg-[#1c2128]"
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                      style={{
                        backgroundColor: isActive ? "#7c6af7" : "#21262d",
                      }}
                    >
                      {wallet.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#e6edf3] font-mono">
                          {truncate(wallet.address)}
                        </span>
                        {isActive && (
                          <span className="text-[8px] font-black px-1 rounded-sm bg-[#7c6af720] text-[#7c6af7]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      {chain && (
                        <span
                          className="text-[9px]"
                          style={{ color: chain.color }}
                        >
                          {chain.name}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {wallet.ethBalance && (
                        <p className="text-[11px] font-bold text-[#e6edf3]">
                          {wallet.ethBalance}
                        </p>
                      )}
                      <a
                        href={`https://etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] text-[#484f58] hover:text-[#7c6af7] flex items-center gap-0.5 ml-auto"
                      >
                        <ExternalLink size={8} />
                      </a>
                    </div>
                  </button>
                );
              })}
            </div>

            {wallets.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2.5 text-[11px] text-[#484f58] hover:text-[#8b949e] flex items-center justify-center gap-1 border-t transition-colors"
                style={{ borderColor: "#21262d" }}
              >
                {showAll ? "Show less" : `+${wallets.length - 3} more wallets`}
                <ChevronRight
                  size={10}
                  className={cn(
                    "transition-transform",
                    showAll && "rotate-90"
                  )}
                />
              </button>
            )}

            {/* ── Positions section ── */}
            <div className="border-t" style={{ borderColor: "#21262d" }}>
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ borderColor: "#21262d" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#484f58]">
                    Positions
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#7c6af720", color: "#7c6af7" }}
                  >
                    {allPositions.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: "#7c6af720", color: "#7c6af7" }}
                >
                  <Plus size={10} />
                  Add Position
                </button>
              </div>

              <div className="p-3 space-y-2.5">
                {allPositions.map((pos, idx) => (
                  <PositionCard
                    key={`${pos.token}-${idx}`}
                    position={pos}
                    onTargetChange={handleTargetChange}
                  />
                ))}
              </div>
            </div>

            <div
              className="px-4 py-3 border-t flex items-center justify-between"
              style={{ borderColor: "#21262d" }}
            >
              <p className="text-[9px] text-[#484f58] flex items-center gap-1">
                <Shield size={9} />
                Read-only · Non-custodial
              </p>
              <WalletConnectButton />
            </div>
          </div>
        )}
      </div>

      {/* Add position modal */}
      {mounted && showAddModal && (
        <AddPositionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPosition}
        />
      )}
    </>
  );
}
