"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Shield, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const WALLETS = [
  { id: "metamask",      name: "MetaMask",       description: "Browser extension & mobile", color: "#e2761b", icon: "🦊" },
  { id: "coinbase",      name: "Coinbase Wallet", description: "Self-custody by Coinbase",   color: "#0052ff", icon: "🔵" },
  { id: "walletconnect", name: "WalletConnect",   description: "300+ compatible wallets",    color: "#3b99fc", icon: "🔗" },
  { id: "phantom",       name: "Phantom",         description: "Solana & multi-chain",       color: "#ab9ff2", icon: "👻" },
];

function truncate(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// Separate component to avoid JSX-in-createPortal parse ambiguity
function ModalContent({ open, connecting, onClose, onConnect }: {
  open: boolean;
  connecting: string | null;
  onClose: () => void;
  onConnect: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 9990 }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: "380px", zIndex: 9991 }}
          >
            <div className="rounded-2xl border overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)]" style={{ background: "#161b22", borderColor: "#30363d" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
                <div>
                  <h3 className="text-sm font-bold text-[#e6edf3]">Connect a wallet</h3>
                  <p className="text-[11px] text-[#8b949e] mt-0.5">Choose your preferred wallet provider</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all duration-[80ms]">
                  <X size={14} />
                </button>
              </div>
              <div className="p-3 space-y-1">
                {WALLETS.map((wallet) => {
                  const isConnecting = connecting === wallet.id;
                  return (
                    <button
                      key={wallet.id}
                      onClick={() => onConnect(wallet.id)}
                      disabled={!!connecting}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-[80ms]",
                        "border-transparent hover:border-[#30363d] hover:bg-[#21262d]",
                        isConnecting && "border-[#30363d] bg-[#21262d]",
                        !!connecting && !isConnecting && "opacity-40"
                      )}
                    >
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: wallet.color + "18" }}>
                        {wallet.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#e6edf3]">{wallet.name}</div>
                        <div className="text-[11px] text-[#8b949e]">{wallet.description}</div>
                      </div>
                      {isConnecting
                        ? <div className="w-4 h-4 rounded-full border-2 border-[#8b949e] border-t-transparent animate-spin flex-shrink-0" />
                        : <ChevronRight size={14} className="text-[#484f58] flex-shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-3.5 border-t border-[#21262d] flex items-center gap-2">
                <Shield size={11} className="text-[#3fb950] flex-shrink-0" />
                <p className="text-[10px] text-[#484f58]">Clicking is non-custodial. We never hold your funds or keys.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    await new Promise((r) => setTimeout(r, 1200));
    setConnecting(null);
    setConnected("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setOpen(false);
  };

  const modal = mounted ? createPortal(
    <ModalContent open={open} connecting={connecting} onClose={() => setOpen(false)} onConnect={handleConnect} />,
    document.body
  ) : null;

  if (connected) {
    return (
      <>
        <button
          onClick={() => setConnected(null)}
          className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-[80ms]", "border-[#3fb950]/30 bg-[#3fb950]/[0.06] hover:bg-[#3fb950]/[0.12] hover:border-[#3fb950]/50", className)}
          title="Click to disconnect"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[11px] font-mono text-[#3fb950] font-semibold">{truncate(connected)}</span>
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-[80ms]", "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-white/[0.04]", className)}
      >
        <Wallet size={12} />
        Connect
      </button>
      {modal}
    </>
  );
}
