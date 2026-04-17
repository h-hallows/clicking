"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Radio, Globe, Bot, Zap, LayoutDashboard,
  ArrowRight, Hash, TrendingUp, Sparkles, X,
  ScanSearch, Layers, Bell, BookOpen, Cpu, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NODES } from "@/lib/ecosystem-data";

interface CommandItem {
  id: string;
  type: "nav" | "protocol" | "atlas" | "yield" | "ai";
  label: string;
  description?: string;
  icon: React.ElementType;
  iconColor: string;
  action: () => void;
  keywords?: string;
}

function buildItems(router: ReturnType<typeof useRouter>): CommandItem[] {
  const nav: CommandItem[] = [
    { id: "feed",      type: "nav", label: "The Feed",      description: "Real-time narrative intelligence", icon: Radio,           iconColor: "#00DCC8", action: () => router.push("/feed"),       keywords: "live signals narratives" },
    { id: "scope",     type: "nav", label: "The Scope",     description: "Explore the crypto ecosystem",      icon: Globe,           iconColor: "#7c6af7", action: () => router.push("/scope"),      keywords: "map protocols chains" },
    { id: "atlas",     type: "nav", label: "Atlas AI",      description: "Ask anything about crypto + AI",    icon: Bot,             iconColor: "#a78bfa", action: () => router.push("/atlas"),      keywords: "chat ask question ai" },
    { id: "scan",      type: "nav", label: "Scan",          description: "Token intelligence reports",       icon: ScanSearch,      iconColor: "#00e5a0", action: () => router.push("/scan"),       keywords: "token ticker report analysis" },
    { id: "tools",     type: "nav", label: "Tools",         description: "AI Match, Model Bench, Prompts",   icon: Layers,          iconColor: "#E879F9", action: () => router.push("/tools"),      keywords: "ai match benchmark prompts agents" },
    { id: "watchlist", type: "nav", label: "Watchlist",     description: "Alerts & monitoring",              icon: Bell,            iconColor: "#fbbf24", action: () => router.push("/watchlist"),  keywords: "alerts watch monitor notify" },
    { id: "journal",   type: "nav", label: "Journal",       description: "Trade decision tracker",           icon: BookOpen,        iconColor: "#27C96A", action: () => router.push("/tools/journal"), keywords: "trade log decision quality score" },
    { id: "yield",     type: "nav", label: "The Yield",     description: "Discover yield opportunities",     icon: Zap,             iconColor: "#fbbf24", action: () => router.push("/yield"),      keywords: "apy pools earn staking" },
    { id: "dashboard",  type: "nav", label: "Dashboard",     description: "Your personal home base",          icon: LayoutDashboard, iconColor: "#00d2e6", action: () => router.push("/dashboard"),   keywords: "portfolio watchlist stats" },
    { id: "community",  type: "nav", label: "Community",     description: "On-chain verified activity",       icon: Users,           iconColor: "#3fb950", action: () => router.push("/community"),   keywords: "social leaderboard trending onchain" },
  ];

  const protocols: CommandItem[] = NODES.map((node) => ({
    id: `protocol-${node.id}`,
    type: "protocol" as const,
    label: node.label,
    description: `${node.category} · ${node.primaryChain} · TVL $${node.tvlNum >= 1000 ? (node.tvlNum / 1000).toFixed(1) + "B" : node.tvlNum + "M"}`,
    icon: Hash,
    iconColor: "#8b949e",
    action: () => router.push(`/scope?highlight=${node.id}`),
    keywords: `${node.category} ${node.primaryChain} ${node.chains.join(" ")}`,
  }));

  const atlasPrompts: CommandItem[] = [
    { id: "atlas-stables",  type: "atlas", label: "Best stablecoin yields right now",        description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("What are the best stablecoin yield opportunities right now?")), keywords: "usdc usdt dai stable" },
    { id: "atlas-eth",      type: "atlas", label: "Top ETH staking options",                 description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("What are the top ETH staking and liquid staking options?")), keywords: "ethereum restaking lido rocket" },
    { id: "atlas-solana",   type: "atlas", label: "Solana ecosystem overview",                 description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("Give me an overview of the Solana ecosystem — DeFi, NFTs, memecoins, and AI tokens")), keywords: "sol jupiter raydium marinade" },
    { id: "atlas-risk",     type: "atlas", label: "How to assess protocol risk",               description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("How do I assess risk in crypto protocols?")), keywords: "audit security smart contract" },
    { id: "atlas-trending", type: "atlas", label: "What narratives are trending now",        description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("What crypto narratives are trending right now in 2026?")), keywords: "hot popular narrative" },
    { id: "atlas-tao",      type: "atlas", label: "Explain TAO / Bittensor opportunity",     description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("Explain the TAO/Bittensor opportunity — the crypto angle and the AI infrastructure angle")), keywords: "tao bittensor ai subnet" },
    { id: "atlas-aimarket", type: "atlas", label: "Which AI tokens benefit from ChatGPT hype?", description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("Which crypto tokens are most directly positioned to benefit from continued AI hype and adoption?")), keywords: "ai crypto tokens rndr fet near" },
    { id: "atlas-aivsbtc",  type: "atlas", label: "Compare AI narrative vs BTC dominance",   description: "Ask Atlas →", icon: Sparkles, iconColor: "#a78bfa", action: () => router.push("/atlas?q=" + encodeURIComponent("How does the AI narrative trade versus BTC dominance cycles? When do AI tokens outperform?")), keywords: "btc dominance rotation" },
  ];

  const aiTools: CommandItem[] = [
    { id: "ai-match",     type: "ai", label: "Find the right AI tool for my task",   description: "AI Match →",     icon: Cpu,     iconColor: "#E879F9", action: () => router.push("/tools/ai-match"), keywords: "which ai chatgpt claude gemini cursor" },
    { id: "ai-models",    type: "ai", label: "Which AI model is best right now?",     description: "Model Bench →",  icon: Cpu,     iconColor: "#FB923C", action: () => router.push("/tools/models"),   keywords: "benchmark leaderboard claude gpt4" },
    { id: "ai-prompts",   type: "ai", label: "Get prompts for investing decisions",   description: "Prompt Vault →", icon: Sparkles,iconColor: "#A78BFA", action: () => router.push("/tools/prompts?cat=invest"), keywords: "prompts investing crypto thesis" },
  ];

  const yieldActions: CommandItem[] = [
    { id: "yield-high",   type: "yield", label: "Highest APY pools",   description: "Filter by highest yield → ", icon: TrendingUp, iconColor: "#fbbf24", action: () => router.push("/yield?sort=apy"),   keywords: "high return earn apy" },
    { id: "yield-stable", type: "yield", label: "Stablecoin pools",    description: "Low-risk stable yields →",    icon: TrendingUp, iconColor: "#fbbf24", action: () => router.push("/yield?cat=stablecoin"), keywords: "usdc usdt dai safe" },
    { id: "yield-new",    type: "yield", label: "Trending new pools",  description: "Hot emerging pools →",        icon: TrendingUp, iconColor: "#fbbf24", action: () => router.push("/yield?sort=trending"), keywords: "new hot trending fresh" },
  ];

  return [...nav, ...protocols, ...atlasPrompts, ...yieldActions, ...aiTools];
}

const TYPE_LABELS: Record<string, string> = {
  nav: "Pages",
  protocol: "Protocols",
  atlas: "Ask Atlas",
  yield: "The Yield",
  ai: "AI Tools",
};

const TYPE_ORDER = ["nav", "atlas", "ai", "yield", "protocol"];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => buildItems(router), [router]);

  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.keywords?.toLowerCase().includes(q)
        );
      })
    : items.filter((i) => i.type === "nav" || i.type === "atlas" || i.type === "ai");

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const runItem = useCallback(
    (item: CommandItem) => {
      item.action();
      close();
    },
    [close]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Scroll selected item into view on keyboard navigation
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>("[data-selected='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) runItem(filtered[selectedIdx]);
    }
  };

  // Group by type, in defined order
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const orderedGroups = [...TYPE_ORDER, ...Object.keys(grouped).filter(k => !TYPE_ORDER.includes(k))]
    .filter(t => !!grouped[t])
    .map(t => ({ type: t, items: grouped[t] }));

  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[9999]"
          >
            <div
              className="rounded-2xl border overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
              style={{
                background: "#161b22",
                borderColor: "#30363d",
              }}
              onKeyDown={onKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#21262d]">
                <Search size={16} className="text-[#8b949e] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, protocols, ask Atlas..."
                  className="flex-1 bg-transparent text-[#e6edf3] text-sm placeholder-[#484f58] outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[#484f58] hover:text-[#8b949e] transition-colors">
                    <X size={14} />
                  </button>
                )}
                <kbd className="text-[10px] text-[#484f58] bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[#484f58]">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  orderedGroups.map(({ type, items: groupItems }) => (
                    <div key={type} className="mb-1">
                      <div className="px-4 py-1.5 text-[10px] font-semibold text-[#484f58] uppercase tracking-widest">
                        {TYPE_LABELS[type] ?? type}
                      </div>
                      {groupItems.map((item) => {
                        const isSelected = flatIdx === selectedIdx;
                        const currentIdx = flatIdx++;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            data-selected={isSelected ? "true" : undefined}
                            onClick={() => runItem(item)}
                            onMouseEnter={() => setSelectedIdx(currentIdx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-[60ms]",
                              isSelected ? "bg-[#21262d]" : "hover:bg-[#1c2128]"
                            )}
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.iconColor + "18", color: item.iconColor }}
                            >
                              <Icon size={13} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm text-[#e6edf3] font-medium truncate">{item.label}</span>
                              {item.description && (
                                <span className="block text-[11px] text-[#8b949e] truncate">{item.description}</span>
                              )}
                            </span>
                            <ArrowRight size={12} className={cn("flex-shrink-0 transition-opacity", isSelected ? "opacity-60" : "opacity-0")} style={{ color: item.iconColor }} />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-[#484f58]">
                  <span className="flex items-center gap-1"><kbd className="bg-[#21262d] border border-[#30363d] px-1 rounded font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-[#21262d] border border-[#30363d] px-1.5 rounded font-mono">↵</kbd> select</span>
                </div>
                <span className="text-[10px] text-[#484f58]">Clicking Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
