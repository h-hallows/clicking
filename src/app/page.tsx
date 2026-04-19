"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Radio, Globe, Bot, Zap, LayoutDashboard,
  ArrowRight, TrendingUp, Shield, ChevronRight,
  Activity, Sparkles, ExternalLink, User, Users,
  ScanSearch, Bell, BookOpen, Layers
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { NARRATIVES } from "@/lib/narratives";

// ─── Types ──────────────────────────────────────────────────────────
interface PriceTick { symbol: string; price: number; change24h: number; }

function formatPrice(p: number) {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (p >= 1)    return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

// ─── Features ───────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "feed", href: "/feed", icon: Radio, color: "#00DCC8",
    label: "Signal Feed", tagline: "Real-time intelligence",
    description: "Whale moves, narrative shifts, on-chain flows, and institutional news — all in one live feed.",
    badge: "LIVE",
  },
  {
    id: "scope", href: "/scope", icon: Globe, color: "#7c6af7",
    label: "The Scope", tagline: "Narrative ecosystem map",
    description: `Visual force map of ${NARRATIVES.length} narratives. See which sectors are exploding vs cooling.`,
    badge: null,
  },
  {
    id: "atlas", href: "/atlas", icon: Bot, color: "#a78bfa",
    label: "Atlas AI", tagline: "Your crypto intelligence layer",
    description: "Ask anything about crypto or AI. Atlas has full context of current signals and narratives.",
    badge: "AI",
  },
  {
    id: "scan", href: "/scan", icon: ScanSearch, color: "#00DCC8",
    label: "Scan", tagline: "Instant token intelligence",
    description: "Paste any ticker — get narrative fit, signal activity, risk flags, and an Atlas verdict in seconds.",
    badge: null,
  },
  {
    id: "dashboard", href: "/dashboard", icon: LayoutDashboard, color: "#00d2e6",
    label: "Portfolio", tagline: "Health score + gap analysis",
    description: "Portfolio health score, narrative alignment, position cards, and performance vs benchmarks.",
    badge: null,
  },
  {
    id: "watchlist", href: "/watchlist", icon: Bell, color: "#f59e0b",
    label: "Watchlist", tagline: "Smart alerts",
    description: "Set price, whale, and narrative alerts. Get notified the moment conditions are met.",
    badge: null,
  },
  {
    id: "journal", href: "/tools/journal", icon: BookOpen, color: "#3fb950",
    label: "Journal", tagline: "Decision quality tracker",
    description: "Log trades with thesis. Track your Decision Quality Score. Get Atlas reviews on every close.",
    badge: null,
  },
  {
    id: "tools", href: "/tools", icon: Layers, color: "#E879F9",
    label: "Tools", tagline: "AI match, model bench, agents",
    description: "Find the right AI tool, benchmark models, build signal agents, and access the Prompt Vault.",
    badge: "NEW",
  },
  {
    id: "yield", href: "/yield", icon: Zap, color: "#fbbf24",
    label: "The Yield", tagline: "Earn on idle capital",
    description: "Browse hundreds of live yield pools across every chain. Calculate returns, compare protocols, and discover where your idle capital can work.",
    badge: null,
  },
  {
    id: "community", href: "/community", icon: Users, color: "#3fb950",
    label: "Community", tagline: "On-chain verified social",
    description: "Leaderboard of traders ranked by PnL and yield. Activity feed of verified on-chain moves you can actually trust.",
    badge: null,
  },
];

// ─── Mock live signals for preview window ────────────────────────────
const MOCK_SIGNALS = [
  { type: "WHALE",   color: "#a78bfa", title: "Bittensor Subnet 64 reports $22K daily revenue",       time: "2m ago",  badge: "AI + CRYPTO" },
  { type: "NEWS",    color: "#00DCC8", title: "Chainlink secures $3B institutional RWA contracts",    time: "8m ago",  badge: "RWA"         },
  { type: "ON-CHAIN",color: "#fbbf24", title: "HYPE buyback: $12M executed in 24hrs",                 time: "14m ago", badge: "PERP DEX"    },
  { type: "YIELD",   color: "#3fb950", title: "Ethena sUSDe APY up 3.2% across 5 chains",             time: "21m ago", badge: "STABLECOIN"  },
  { type: "TVL",     color: "#00d2e6", title: "Aave V3 TVL surpasses $20B milestone",                 time: "35m ago", badge: "LENDING"     },
];

// ─── Background ──────────────────────────────────────────────────────
function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 20%, #7c6af712 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 90% 15%, #00d2e610 0%, transparent 55%)," +
            "radial-gradient(ellipse 70% 60% at 50% 80%, #00e5a008 0%, transparent 60%)",
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #0d0e12 100%)",
        }}
      />
    </div>
  );
}

// ─── Live preview window ──────────────────────────────────────────────
function LivePreviewWindow() {
  const [visible, setVisible] = useState([0, 1, 2]);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible((v) => {
        const next = (v[v.length - 1] + 1) % MOCK_SIGNALS.length;
        return [...v.slice(1), next];
      });
    }, 2400);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      style={{ border: "1px solid #21262d", background: "#0d0e12" }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "#21262d", background: "#161b22" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f5c518]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/60" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[10px] font-bold text-[#3fb950] tracking-wider">LIVE FEED</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#484f58]">
          <Activity size={10} />
          <span>clicking.app/feed</span>
        </div>
      </div>

      {/* Signal list */}
      <div className="p-3 space-y-2 min-h-[220px]">
        {visible.map((idx, i) => {
          const sig = MOCK_SIGNALS[idx];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i === 0 ? 1 : 0.55 - i * 0.12, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-2.5 p-2.5 rounded-xl"
              style={{
                background: i === 0 ? sig.color + "0a" : "transparent",
                border: `1px solid ${i === 0 ? sig.color + "20" : "transparent"}`,
              }}
            >
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded-md mt-0.5 flex-shrink-0 tracking-wider"
                style={{ backgroundColor: sig.color + "20", color: sig.color }}
              >
                {sig.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#e6edf3] font-medium leading-snug truncate">{sig.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-[#484f58]">{sig.time}</span>
                  <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: "#21262d", color: "#8b949e" }}>
                    {sig.badge}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: "#21262d", background: "#161b22" }}
      >
        <span className="text-[9px] text-[#484f58]">Updating every 30s · {NARRATIVES.length} narratives tracked</span>
        <Link href="/feed" className="flex items-center gap-1 text-[9px] font-semibold text-[#00DCC8] hover:opacity-80 transition-opacity">
          Open <ExternalLink size={8} />
        </Link>
      </div>
    </div>
  );
}

// ─── Feature card ────────────────────────────────────────────────────
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const Icon = f.icon;
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + i * 0.07, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={f.href}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative h-full rounded-2xl p-5 transition-all duration-150 overflow-hidden cursor-pointer"
          style={{
            background: hovered ? "#1c2128" : "#161b22",
            border: `1px solid ${hovered ? f.color + "35" : "#21262d"}`,
            boxShadow: hovered ? `0 0 32px ${f.color}0c` : "none",
          }}
        >
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-150"
            style={{
              background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
              opacity: hovered ? 1 : 0,
            }}
          />

          <div className="flex items-start justify-between mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: f.color + "18", color: f.color }}
            >
              <Icon size={16} />
            </div>
            {f.badge && (
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-widest"
                style={{ background: f.color + "20", color: f.color }}
              >
                {f.badge}
              </span>
            )}
          </div>

          <h3
            className="text-[14px] font-bold text-[#e6edf3] mb-1"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            {f.label}
          </h3>
          <p className="text-[10px] font-semibold mb-2" style={{ color: f.color }}>{f.tagline}</p>
          <p className="text-[11px] text-[#6e7681] leading-relaxed">{f.description}</p>

          <div
            className="flex items-center gap-1 mt-4 text-[10px] font-semibold transition-all duration-150"
            style={{ color: f.color, opacity: hovered ? 1 : 0, transform: hovered ? "translateX(2px)" : "none" }}
          >
            Open {f.label} <ArrowRight size={10} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [prices, setPrices] = useState<PriceTick[]>([]);
  const { user, signInAsGuest } = useAuthStore();

  const handleBrowseAsGuest = () => {
    signInAsGuest();
    router.push("/feed");
  };

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.prices) setPrices(d.prices.slice(0, 8)); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0e12" }}>

      {/* ── NAV ── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-[#21262d] sticky top-0 z-30 bg-[#0d0e12]/92 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-[17px] font-black tracking-[0.12em] text-[#e6edf3] uppercase"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Clicking
            </span>
          </Link>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#7c6af718] text-[#7c6af7] border border-[#7c6af730] tracking-widest">
            BETA
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {[
            { href: "/feed",      label: "Feed"      },
            { href: "/scope",     label: "Scope"     },
            { href: "/atlas",     label: "Atlas"     },
            { href: "/scan",      label: "Scan"      },
            { href: "/dashboard", label: "Portfolio" },
            { href: "/tools",     label: "Tools"     },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#161b22] transition-all duration-[80ms]"
            >
              {f.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/feed"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#30363d] text-[12px] font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-[#161b22] transition-all duration-[80ms]"
              >
                <User size={12} />
                {user.name.split(" ")[0]}
              </Link>
              <Link
                href="/feed"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold text-white transition-all duration-150 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c6af7, #6a5ae0)" }}
              >
                Open Suite
                <ArrowRight size={12} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[12px] font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors px-2 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold text-white transition-all duration-150 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #7c6af7, #6a5ae0)" }}
              >
                Get Started
                <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── TICKER ── */}
      {prices.length > 0 && (
        <div className="overflow-hidden border-b border-[#21262d] bg-[#0d0e12]">
          <div
            className="flex gap-8 py-2 px-4 w-max"
            style={{ animation: "ticker-scroll 40s linear infinite" }}
          >
            {[...prices, ...prices].map((p, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[9px] font-black text-[#484f58] tracking-widest">{p.symbol}</span>
                <span className="text-[11px] font-bold tabular-nums text-[#8b949e]">{formatPrice(p.price)}</span>
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: p.change24h >= 0 ? "#3fb950" : "#f85149" }}
                >
                  {p.change24h >= 0 ? "+" : ""}{p.change24h.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative flex-shrink-0 px-6 pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <Background />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#21262d] bg-[#161b22] mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                <span className="text-[11px] font-semibold text-[#8b949e]">Live · {NARRATIVES.length} narratives · Whale + AI signals</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5 }}
                className="text-[48px] md:text-[58px] font-black leading-[1.05] tracking-[-0.03em] text-[#e6edf3] mb-5"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                The Intelligence
                <br />
                Layer for
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #7c6af7 0%, #00d2e6 55%, #00e5a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Crypto + AI.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="text-[16px] text-[#6e7681] leading-relaxed mb-8 max-w-lg"
              >
                Narrative signals, whale intelligence, AI-powered analysis, and yield — ten specialized tools for the modern crypto investor.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.4 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <button
                  onClick={handleBrowseAsGuest}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(124,106,247,0.35)] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #7c6af7, #6a5ae0)" }}
                >
                  Explore The Feed
                  <ArrowRight size={14} />
                </button>
                <Link
                  href="/atlas"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-[#161b22] transition-all duration-[80ms]"
                >
                  <Sparkles size={14} />
                  Ask Atlas
                </Link>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="flex items-center gap-5 mt-7 text-[10px] text-[#484f58] font-medium"
              >
                <span className="flex items-center gap-1.5"><Shield size={10} className="text-[#3fb950]" /> Non-custodial</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={10} className="text-[#fbbf24]" /> Real-time data</span>
                <span className="flex items-center gap-1.5"><Bot size={10} className="text-[#a78bfa]" /> AI-powered</span>
              </motion.div>
            </div>

            {/* Right: live preview */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <LivePreviewWindow />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-[#21262d]" style={{ background: "#161b2280" }}>
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: `${NARRATIVES.length}`, label: "Narrative clusters", color: "#7c6af7" },
            { value: `${FEATURES.length}`,   label: "Tools in the suite", color: "#00DCC8" },
            { value: "100+",                 label: "Tokens tracked",     color: "#fbbf24" },
            { value: "30s",                  label: "Data refresh rate",  color: "#a78bfa" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.06, duration: 0.3 }}
              className="text-center"
            >
              <div
                className="text-[28px] font-black leading-none mb-1 tabular-nums"
                style={{ color: s.color, fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                {s.value}
              </div>
              <div className="text-[10px] text-[#6e7681] font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE GRID ── */}
      <section className="max-w-5xl mx-auto w-full px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2
            className="text-[28px] font-black text-[#e6edf3] mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Ten tools. One platform.
          </h2>
          <p className="text-[13px] text-[#6e7681] max-w-md mx-auto">
            Each tool is powerful alone. Together, they give you a complete edge in crypto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => <FeatureCard key={f.id} f={f} i={i} />)}
        </div>
        <p className="text-center text-[11px] text-[#484f58] mt-6">
          All tools included. No paywalls. No hidden tiers.
        </p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-[#21262d] py-16 px-6" style={{ background: "#161b2230" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2
              className="text-[24px] font-black text-[#e6edf3] mb-2"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              How the suite works together.
            </h2>
            <p className="text-[13px] text-[#6e7681]">Every app feeds into the others.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01", color: "#00DCC8", icon: Radio,
                title: "Spot a signal in the Feed",
                desc: "Whale move, narrative heat shift, or institutional news — you see it live before the crowd.",
              },
              {
                step: "02", color: "#7c6af7", icon: Globe,
                title: "Understand the narrative on The Scope",
                desc: "See which cluster is heating up. Zoom in to find the top tokens within any narrative.",
              },
              {
                step: "03", color: "#a78bfa", icon: Bot,
                title: "Run a Scan — get the full picture",
                desc: "Paste a ticker. Get narrative fit, signal strength, risk flags, and an Atlas verdict instantly.",
              },
              {
                step: "04", color: "#3fb950", icon: BookOpen,
                title: "Log the trade with a thesis",
                desc: "Journal your reasoning. Atlas reviews every close — win or loss — and builds your Decision Quality Score.",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[#21262d] hover:border-[#30363d] transition-colors duration-150"
                  style={{ background: "#161b22" }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: s.color + "18", color: s.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[9px] font-black text-[#484f58]">{s.step}</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#e6edf3] mb-0.5">{s.title}</h4>
                    <p className="text-[12px] text-[#6e7681] leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#21262d] py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ background: "linear-gradient(135deg, #7c6af720, #00d2e620)", border: "1px solid #7c6af730" }}
            >
              <Sparkles size={22} className="text-[#a78bfa]" />
            </div>
            <h3
              className="text-[26px] font-black text-[#e6edf3] mb-3"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Start with an edge.
            </h3>
            <p className="text-[13px] text-[#6e7681] mb-7">
              No wallet required to browse. Create an account to unlock the full suite — free, always.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/login?mode=signup"
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-150 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #7c6af7, #00d2e6)" }}
              >
                Create Free Account
                <ChevronRight size={15} />
              </Link>
              <button
                onClick={handleBrowseAsGuest}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-[#161b22] transition-all duration-[80ms]"
              >
                Browse without account
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#21262d] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] text-[#484f58]" suppressHydrationWarning>© {new Date().getFullYear()} Clicking. Not financial advice. Always DYOR.</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-[9px] text-[#3fb950] font-bold tracking-wider">ALL SYSTEMS LIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
