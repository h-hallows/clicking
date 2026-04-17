import { Signal, NARRATIVE_MAP } from "@/lib/narratives";
import { NextResponse } from "next/server";

// ─── Category → narrative mapping ────────────────────────────────────────────
const CAT_TO_NARRATIVE: Record<string, string> = {
  "Lending":        "rwa",
  "DEXes":          "defi",
  "Derivatives":    "defi",
  "Yield":          "rwa",
  "Liquid Staking": "l1",
  "Bridge":         "l1",
  "Stablecoins":    "macro",
  "Payments":       "banking",
  "RWA":            "rwa",
  "Oracle":         "rwa",
  "Gaming":         "defi",
  "Chain":          "l1",
};

function formatTVL(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

// Simple in-memory cache (server-side, resets on redeploy)
let _cache: { signals: Signal[]; fetchedAt: number } | null = null;
const CACHE_TTL = 90_000; // 90 seconds

interface DLProtocol {
  name: string;
  slug: string;
  tvl: number;
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  category: string;
  chains: string[];
  url?: string;
  symbol?: string;
}

interface DLPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  apyPct1D?: number;
  stablecoin: boolean;
  ilRisk?: string;
  outlier: boolean;
  pool: string;
}

export async function GET() {
  const now = Date.now();

  if (_cache && now - _cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ signals: _cache.signals, fetchedAt: _cache.fetchedAt, cached: true });
  }

  const signals: Signal[] = [];

  try {
    // Fetch protocols + pools in parallel
    const [protRes, poolRes] = await Promise.allSettled([
      fetch("https://api.llama.fi/protocols", { cache: "no-store" }),
      fetch("https://yields.llama.fi/pools",  { cache: "no-store" }),
    ]);

    // ── TVL movers from DeFiLlama ─────────────────────────────────────────
    if (protRes.status === "fulfilled" && protRes.value.ok) {
      const protocols: DLProtocol[] = await protRes.value.json();

      const movers = protocols
        .filter((p) => p.tvl > 5_000_000 && p.change_1d != null && Math.abs(p.change_1d) > 3)
        .sort((a, b) => Math.abs(b.change_1d ?? 0) - Math.abs(a.change_1d ?? 0))
        .slice(0, 30);

      movers.forEach((p, i) => {
        const up = (p.change_1d ?? 0) > 0;
        const nid = CAT_TO_NARRATIVE[p.category] ?? "l1";
        const nar = NARRATIVE_MAP[nid];
        if (!nar) return;

        const pct = Math.abs(p.change_1d ?? 0).toFixed(1);
        const tvlFmt = formatTVL(p.tvl);
        const chain = p.chains?.[0] ?? "Multi";

        signals.push({
          id: `tvl-${p.slug}-${now}`,
          narrativeId: nid,
          narrativeLabel: nar.label,
          narrativeColor: nar.color,
          heat: nar.heat,
          type: "tvl",
          headline: `${p.name} TVL ${up ? "surges" : "drops"} ${pct}% in 24h — ${tvlFmt} locked`,
          body: `${p.name} (${p.category}) on ${chain}. Total value locked: ${tvlFmt} across ${p.chains?.length ?? 1} chain${(p.chains?.length ?? 1) > 1 ? "s" : ""}. ${up ? "Significant inflows suggest growing protocol confidence." : "Outflows may signal repositioning or risk-off sentiment."}`,
          sigs: [
            [up ? "📈" : "📉", `TVL ${up ? "+" : "-"}${pct}%`],
            ["⛓",  `${p.chains?.length ?? 1} chain${(p.chains?.length ?? 1) > 1 ? "s" : ""}`],
            ["💰", tvlFmt],
          ],
          tokens: p.symbol ? [p.symbol.toUpperCase()] : [],
          timestamp: now - i * 120_000,
          source: "DeFiLlama",
          url: p.url,
        });
      });
    }

    // ── Top yield pools ───────────────────────────────────────────────────
    if (poolRes.status === "fulfilled" && poolRes.value.ok) {
      const { data: pools }: { data: DLPool[] } = await poolRes.value.json();

      const hotPools = (pools ?? [])
        .filter((p) => p.apy > 8 && p.tvlUsd > 1_000_000 && !p.outlier)
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 20);

      hotPools.forEach((p, i) => {
        const project = p.project.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        signals.push({
          id: `yield-${p.pool}-${now}`,
          narrativeId: "rwa",
          narrativeLabel: "YIELD INTEL",
          narrativeColor: "#fbbf24",
          heat: p.apy > 25 ? "HOT" : "RISING",
          type: "yield",
          headline: `${p.symbol} on ${project} offering ${p.apy.toFixed(1)}% APY — ${formatTVL(p.tvlUsd)} TVL`,
          body: `${p.chain} · ${p.stablecoin ? "Stablecoin exposure" : "Volatile asset"}. ${p.ilRisk === "no" ? "No impermanent loss risk." : "IL risk present."} Base APY: ${(p.apyBase ?? 0).toFixed(1)}%${p.apyReward ? ` + ${p.apyReward.toFixed(1)}% rewards` : ""}. ${p.apyPct1D != null ? `24h APY change: ${p.apyPct1D > 0 ? "+" : ""}${p.apyPct1D.toFixed(2)}%.` : ""}`,
          sigs: [
            ["💰", `${p.apy.toFixed(1)}% APY`],
            [p.stablecoin ? "🔒" : "📊", p.stablecoin ? "Stablecoin" : "Volatile"],
            ["⛓", p.chain],
          ],
          tokens: [p.symbol.split("-")[0].split("/")[0].toUpperCase()].filter(Boolean),
          timestamp: now - (30 + i * 90) * 60_000,
          source: "DeFiLlama",
        });
      });
    }
  } catch {
    // Return empty on error — client falls back to seed signals
  }

  // Sort by timestamp desc
  signals.sort((a, b) => b.timestamp - a.timestamp);
  const result = { signals: signals.slice(0, 60), fetchedAt: now };
  _cache = result;

  return NextResponse.json(result);
}
