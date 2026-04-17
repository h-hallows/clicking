"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect, useAccount, useDisconnect, useBalance, useChainId } from "wagmi";
import { X, Shield, CheckCircle2, ChevronRight, Wallet, AlertCircle, ExternalLink } from "lucide-react";
import { useWalletStore } from "@/store/wallet-store";
import { SUPPORTED_CHAINS } from "@/lib/wagmi-config";
import { cn } from "@/lib/utils";
import { formatEther } from "viem";

// ─── Connector icons ──────────────────────────────────────────────────────────

const CONNECTOR_META: Record<string, { emoji: string; color: string; description: string }> = {
  "MetaMask":        { emoji: "🦊", color: "#e2761b", description: "Browser extension & mobile" },
  "Phantom":         { emoji: "👻", color: "#ab9ff2", description: "Solana & multi-chain" },
  "Coinbase Wallet": { emoji: "🔵", color: "#0052ff", description: "Self-custody by Coinbase" },
  "WalletConnect":   { emoji: "🔗", color: "#3b99fc", description: "300+ compatible wallets" },
};

function truncate(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// ─── Balance fetcher ──────────────────────────────────────────────────────────

function WalletBalanceFetcher({ address }: { address: `0x${string}` }) {
  const { data } = useBalance({ address });
  const updateWallet = useWalletStore((s) => s.updateWallet);
  const chainId = useChainId();

  useEffect(() => {
    if (data) {
      const eth = parseFloat(formatEther(data.value)).toFixed(4);
      updateWallet(address, { ethBalance: eth, chainId });
    }
  }, [data, address, updateWallet, chainId]);

  return null;
}

// ─── Modal inner ─────────────────────────────────────────────────────────────

function ModalContent({ onClose }: { onClose: () => void }) {
  const { connectors, connect, isPending, error } = useConnect();
  const { address: connectedAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { wallets, addWallet, removeWallet, activeWalletAddress, setActiveWallet } = useWalletStore();
  const chainId = useChainId();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [tab, setTab] = useState<"connect" | "manage">(wallets.length > 0 ? "manage" : "connect");

  // When wagmi connects a new wallet, add it to our store
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (isConnected && connectedAddress) {
      const exists = wallets.find((w) => w.address.toLowerCase() === connectedAddress.toLowerCase());
      if (!exists) {
        const connector = connectors.find((c) => c.id === connectingId || c.name === connectingId);
        addWallet({
          address: connectedAddress,
          connector: connector?.name ?? "Unknown",
          chainId,
          addedAt: new Date().toISOString(),
        });
        setJustAdded(connectedAddress);
        setConnectingId(null);
        setTab("manage");
        t = setTimeout(() => setJustAdded(null), 2500);
      }
    }
    return () => clearTimeout(t);
  }, [isConnected, connectedAddress, chainId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) return;
    setConnectingId(connectorId);
    connect({ connector });
  };

  const chainInfo = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const totalUsdValue = wallets.reduce((sum, w) => sum + (w.usdValue ?? 0), 0);

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 9990 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: "440px", zIndex: 9991, padding: "0 16px" }}
        >
          <div className="rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden" style={{ background: "#161b22", borderColor: "#30363d" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#21262d" }}>
              <div>
                <h3 className="text-sm font-bold text-[#e6edf3]">Wallets</h3>
                <p className="text-[11px] text-[#6e7681] mt-0.5">
                  {wallets.length}/100 connected
                  {wallets.length > 0 && " · Portfolio tracked"}
                </p>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "#21262d" }}>
              {(["connect", "manage"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-2.5 text-[12px] font-semibold transition-colors",
                    tab === t ? "text-[#e6edf3] border-b-2 border-[#7c6af7]" : "text-[#484f58] hover:text-[#8b949e]"
                  )}
                  style={{ marginBottom: -1 }}
                >
                  {t === "connect" ? "Connect Wallet" : `My Wallets (${wallets.length})`}
                </button>
              ))}
            </div>

            {/* Connect tab */}
            {tab === "connect" && (
              <div className="p-3">
                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mb-3 text-[11px]" style={{ background: "#f8514910", border: "1px solid #f8514920", color: "#f85149" }}>
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    {error.message.includes("User rejected") ? "Request cancelled." : error.message.slice(0, 80)}
                  </div>
                )}
                <div className="space-y-1">
                  {connectors.map((connector) => {
                    const meta = CONNECTOR_META[connector.name] ?? { emoji: "🔌", color: "#8b949e", description: "Web3 wallet" };
                    const isConnecting = isPending && connectingId === connector.id;
                    return (
                      <button
                        key={connector.id}
                        onClick={() => handleConnect(connector.id)}
                        disabled={isPending}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-[80ms]",
                          "border-transparent hover:border-[#30363d] hover:bg-[#21262d]",
                          isConnecting && "border-[#30363d] bg-[#21262d]",
                          isPending && !isConnecting && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: meta.color + "18" }}>
                          {meta.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-[#e6edf3]">{connector.name}</div>
                          <div className="text-[11px] text-[#6e7681]">{meta.description}</div>
                        </div>
                        {isConnecting
                          ? <div className="w-4 h-4 rounded-full border-2 border-[#7c6af7] border-t-transparent animate-spin flex-shrink-0" />
                          : <ChevronRight size={14} className="text-[#484f58] flex-shrink-0" />
                        }
                      </button>
                    );
                  })}
                </div>
                <div className="px-1 pt-3 flex items-start gap-2">
                  <Shield size={11} className="text-[#3fb950] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#484f58] leading-relaxed">
                    Clicking is <strong className="text-[#6e7681]">non-custodial</strong> and read-only. We never request transaction signing or hold your keys.
                  </p>
                </div>
              </div>
            )}

            {/* Manage tab */}
            {tab === "manage" && (
              <div>
                {wallets.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#7c6af718", border: "1px solid #7c6af730" }}>
                      <Wallet size={20} className="text-[#7c6af7]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#8b949e]">No wallets connected</p>
                      <p className="text-[11px] text-[#484f58] mt-1">Connect a wallet to track your portfolio</p>
                    </div>
                    <button
                      onClick={() => setTab("connect")}
                      className="text-[12px] font-bold px-4 py-2 rounded-lg transition-all"
                      style={{ background: "#7c6af7", color: "white" }}
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="divide-y max-h-[300px] overflow-y-auto" style={{ borderColor: "#21262d" }}>
                    {wallets.map((wallet) => {
                      const isActive = activeWalletAddress?.toLowerCase() === wallet.address.toLowerCase();
                      const isJustAdded = justAdded?.toLowerCase() === wallet.address.toLowerCase();
                      const chain = SUPPORTED_CHAINS.find((c) => c.id === wallet.chainId);
                      return (
                        <div key={wallet.address}>
                          <WalletBalanceFetcher address={wallet.address as `0x${string}`} />
                          <div
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                              isActive ? "bg-[#7c6af710]" : "hover:bg-[#1c2128]"
                            )}
                            onClick={() => setActiveWallet(wallet.address)}
                          >
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white"
                                style={{ backgroundColor: isActive ? "#7c6af7" : "#21262d" }}
                              >
                                {(wallet.label ?? wallet.address).slice(0, 2).toUpperCase()}
                              </div>
                              {isJustAdded && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3fb950] flex items-center justify-center">
                                  <CheckCircle2 size={10} className="text-white" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-bold text-[#e6edf3] font-mono">{truncate(wallet.address)}</span>
                                {isActive && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#7c6af720] text-[#7c6af7]">ACTIVE</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#484f58]">{wallet.connector}</span>
                                {chain && (
                                  <span className="flex items-center gap-1 text-[10px]" style={{ color: chain.color }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chain.color }} />
                                    {chain.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              {wallet.ethBalance && (
                                <p className="text-[12px] font-bold text-[#e6edf3]">{wallet.ethBalance} {chain?.symbol ?? "ETH"}</p>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://etherscan.io/address/${wallet.address}`, "_blank"); }}
                                className="text-[9px] text-[#484f58] hover:text-[#7c6af7] flex items-center gap-0.5 ml-auto"
                              >
                                View <ExternalLink size={8} />
                              </button>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); removeWallet(wallet.address); }}
                              className="w-6 h-6 flex items-center justify-center rounded-md text-[#484f58] hover:text-[#f85149] hover:bg-[#f8514910] transition-all flex-shrink-0"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {wallets.length > 0 && (
                  <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "#21262d" }}>
                    <span className="text-[10px] text-[#484f58]">{wallets.length} wallet{wallets.length > 1 ? "s" : ""} · {100 - wallets.length} slots remaining</span>
                    <button
                      onClick={() => setTab("connect")}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "#7c6af718", color: "#7c6af7", border: "1px solid #7c6af730" }}
                    >
                      + Add Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

// ─── Exported button ──────────────────────────────────────────────────────────

interface WalletConnectButtonProps {
  className?: string;
  variant?: "default" | "compact";
}

export function WalletConnectButton({ className, variant = "default" }: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { wallets, activeWalletAddress } = useWalletStore();
  const active = wallets.find((w) => w.address === activeWalletAddress);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const modal = mounted ? createPortal(
    open ? <ModalContent onClose={() => setOpen(false)} /> : null,
    document.body
  ) : null;

  if (!mounted) return null;

  if (wallets.length > 0) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-[80ms]",
            "border-[#3fb950]/30 bg-[#3fb950]/[0.06] hover:bg-[#3fb950]/[0.12] hover:border-[#3fb950]/50",
            className
          )}
          title={`${wallets.length} wallet${wallets.length > 1 ? "s" : ""} connected`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#3fb950] font-mono">
            {active ? `${active.address.slice(0, 6)}…${active.address.slice(-4)}` : `${wallets.length} wallet${wallets.length > 1 ? "s" : ""}`}
          </span>
          {wallets.length > 1 && (
            <span className="text-[9px] font-black px-1 py-0.5 rounded-full bg-[#3fb95018] text-[#3fb950]">
              +{wallets.length - 1}
            </span>
          )}
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-[80ms]",
          "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#7c6af7]/40 hover:bg-[#7c6af7]/[0.06]",
          className
        )}
      >
        <Wallet size={12} />
        Connect Wallets
      </button>
      {modal}
    </>
  );
}
