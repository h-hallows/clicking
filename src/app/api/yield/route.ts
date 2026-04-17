import { NextResponse } from "next/server";

export interface YieldPool {
  id: string;
  protocol: string;
  protocolName: string;
  chain: string;
  symbol: string;
  apy: number;
  apyBase: number;
  apyReward: number;
  apyChange24h: number | null;
  tvl: number;
  stablecoin: boolean;
  ilRisk: boolean;
  risk: "low" | "medium" | "high";
  url: string;
  trending: boolean;
  category: "stablecoin" | "eth" | "btc" | "lp" | "defi";
}

// ─── Protocol URLs ────────────────────────────────────────────────────────────
const PROTOCOL_URLS: Record<string, string> = {
  "aave-v3":            "https://app.aave.com",
  "aave-v2":            "https://app.aave.com",
  "compound-v3":        "https://app.compound.finance",
  "compound-v2":        "https://app.compound.finance",
  "curve-dex":          "https://curve.fi/#/ethereum/pools",
  "morpho-blue":        "https://app.morpho.org",
  "morpho":             "https://app.morpho.org",
  "pendle":             "https://app.pendle.finance/trade/pools",
  "ethena":             "https://app.ethena.fi/liquidity",
  "yearn-finance":      "https://yearn.fi/vaults",
  "beefy":              "https://app.beefy.com",
  "gmx":                "https://app.gmx.io/#/earn",
  "aerodrome":          "https://aerodrome.finance/pools",
  "velodrome":          "https://velodrome.finance/pools",
  "hyperliquid":        "https://app.hyperliquid.xyz/vaults",
  "raydium":            "https://raydium.io/pools",
  "lido":               "https://lido.fi",
  "rocket-pool":        "https://rocketpool.net",
  "convex-finance":     "https://www.convexfinance.com/stake",
  "eigenlayer":         "https://app.eigenlayer.xyz",
  "stargate":           "https://stargate.finance",
  "spark":              "https://spark.fi",
  "fluid":              "https://fluid.instadapp.io",
  "kamino":             "https://app.kamino.finance",
  "drift-protocol":     "https://app.drift.trade",
  "jupiter":            "https://jup.ag",
  "orca":               "https://www.orca.so",
  "pancakeswap":        "https://pancakeswap.finance/liquidity",
  "uniswap-v3":         "https://app.uniswap.org/pools",
  "uniswap-v2":         "https://app.uniswap.org/pools",
  "balancer":           "https://app.balancer.fi/#/ethereum/pools",
  "sushiswap":          "https://app.sushi.com/pool",
  "frax":               "https://app.frax.finance",
  "maker":              "https://spark.fi",
  "crvusd":             "https://crvusd.curve.fi",
  "origin-protocol":    "https://originprotocol.com",
  "gearbox":            "https://app.gearbox.fi",
  "maple":              "https://maple.finance/earn",
  "clearpool":          "https://clearpool.finance",
  "euler":              "https://www.euler.finance",
  "venus":              "https://app.venus.io",
  "benqi":              "https://app.benqi.fi",
  "traderjoexyz":       "https://traderjoexyz.com/pool",
  "platypus-finance":   "https://app.platypus.finance",
};

const CHAIN_DISPLAY: Record<string, string> = {
  Ethereum:   "Ethereum",
  Arbitrum:   "Arbitrum",
  Base:       "Base",
  Solana:     "Solana",
  Polygon:    "Polygon",
  Avalanche:  "Avalanche",
  BSC:        "BNB Chain",
  Optimism:   "Optimism",
  zkSync:     "zkSync",
  Linea:      "Linea",
  Scroll:     "Scroll",
  Mantle:     "Mantle",
};

function formatProtocolName(slug: string): string {
  return slug
    .replace(/-v\d+$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Uniswap", "Uniswap")
    .replace("Gmx", "GMX")
    .replace("Aave", "Aave");
}

function getCategory(
  symbol: string,
  stablecoin: boolean
): YieldPool["category"] {
  if (stablecoin) return "stablecoin";
  const s = symbol.toUpperCase();
  if (s.includes("ETH") || s.includes("WETH") || s.includes("STETH") || s.includes("RETH")) return "eth";
  if (s.includes("BTC") || s.includes("WBTC") || s.includes("CBBTC")) return "btc";
  if (s.includes("/") || s.includes("-")) return "lp";
  return "defi";
}

function getRisk(apy: number, stablecoin: boolean, ilRisk: boolean): YieldPool["risk"] {
  if (stablecoin && !ilRisk && apy < 12) return "low";
  if (stablecoin && apy < 25) return "medium";
  if (apy < 15 && !ilRisk) return "medium";
  return "high";
}

interface DLPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  apyPct1D?: number;
  stablecoin: boolean;
  ilRisk?: string;
  outlier: boolean;
}

// Fallback curated pools (used when DeFiLlama unreachable)
const FALLBACK: YieldPool[] = [
  {
    id: "aave-usdc-eth",       protocol: "aave-v3",    protocolName: "Aave V3",
    chain: "Ethereum",         symbol: "USDC",          apy: 8.4,   apyBase: 5.2,  apyReward: 3.2,
    apyChange24h: 0.4,         tvl: 4_200_000_000,      stablecoin: true,  ilRisk: false,
    risk: "low",               url: "https://app.aave.com", trending: false, category: "stablecoin",
  },
  {
    id: "pendle-usde-arb",     protocol: "pendle",     protocolName: "Pendle",
    chain: "Arbitrum",         symbol: "PT-USDe",       apy: 22.5,  apyBase: 22.5, apyReward: 0,
    apyChange24h: 1.2,         tvl: 890_000_000,        stablecoin: true,  ilRisk: false,
    risk: "medium",            url: "https://app.pendle.finance/trade/pools", trending: true, category: "stablecoin",
  },
  {
    id: "morpho-usdc-eth",     protocol: "morpho-blue", protocolName: "Morpho",
    chain: "Ethereum",         symbol: "USDC",          apy: 11.2,  apyBase: 8.8,  apyReward: 2.4,
    apyChange24h: 0.8,         tvl: 1_100_000_000,      stablecoin: true,  ilRisk: false,
    risk: "low",               url: "https://app.morpho.org", trending: false, category: "stablecoin",
  },
  {
    id: "aerodrome-eth-usdc",  protocol: "aerodrome",  protocolName: "Aerodrome",
    chain: "Base",             symbol: "ETH/USDC",      apy: 28.3,  apyBase: 12.4, apyReward: 15.9,
    apyChange24h: 3.1,         tvl: 420_000_000,        stablecoin: false, ilRisk: true,
    risk: "high",              url: "https://aerodrome.finance/pools", trending: true, category: "lp",
  },
  {
    id: "gmx-glp-arb",        protocol: "gmx",        protocolName: "GMX",
    chain: "Arbitrum",         symbol: "GLP",           apy: 18.7,  apyBase: 18.7, apyReward: 0,
    apyChange24h: -1.4,        tvl: 580_000_000,        stablecoin: false, ilRisk: false,
    risk: "medium",            url: "https://app.gmx.io/#/earn", trending: false, category: "defi",
  },
  {
    id: "lido-steth-eth",      protocol: "lido",       protocolName: "Lido",
    chain: "Ethereum",         symbol: "stETH",         apy: 3.8,   apyBase: 3.8,  apyReward: 0,
    apyChange24h: 0.0,         tvl: 22_000_000_000,     stablecoin: false, ilRisk: false,
    risk: "low",               url: "https://lido.fi", trending: false, category: "eth",
  },
  {
    id: "hyperliquid-hlp",     protocol: "hyperliquid", protocolName: "Hyperliquid",
    chain: "Arbitrum",         symbol: "HLP",           apy: 34.8,  apyBase: 34.8, apyReward: 0,
    apyChange24h: 6.2,         tvl: 340_000_000,        stablecoin: false, ilRisk: false,
    risk: "high",              url: "https://app.hyperliquid.xyz/vaults", trending: true, category: "defi",
  },
  {
    id: "curve-3pool-eth",     protocol: "curve-dex",  protocolName: "Curve",
    chain: "Ethereum",         symbol: "3CRV",          apy: 7.1,   apyBase: 2.4,  apyReward: 4.7,
    apyChange24h: 0.2,         tvl: 780_000_000,        stablecoin: true,  ilRisk: false,
    risk: "low",               url: "https://curve.fi/#/ethereum/pools", trending: false, category: "stablecoin",
  },
];

let _cache: { pools: YieldPool[]; fetchedAt: number } | null = null;
const CACHE_TTL = 90_000;

export async function GET() {
  const now = Date.now();
  if (_cache && now - _cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ pools: _cache.pools, fetchedAt: _cache.fetchedAt, cached: true });
  }

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`DeFiLlama ${res.status}`);

    const { data }: { data: DLPool[] } = await res.json();

    const pools: YieldPool[] = data
      .filter(
        (p) =>
          p.tvlUsd > 2_000_000 &&
          p.apy > 0.5 &&
          !p.outlier &&
          p.symbol &&
          p.chain
      )
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, 300)
      .map((p) => {
        const ilRisk = p.ilRisk !== "no" && p.ilRisk !== undefined;
        return {
          id: p.pool,
          protocol: p.project,
          protocolName: formatProtocolName(p.project),
          chain: CHAIN_DISPLAY[p.chain] ?? p.chain,
          symbol: p.symbol.length > 20 ? p.symbol.slice(0, 20) + "…" : p.symbol,
          apy: Math.round(p.apy * 10) / 10,
          apyBase: Math.round((p.apyBase ?? 0) * 10) / 10,
          apyReward: Math.round((p.apyReward ?? 0) * 10) / 10,
          apyChange24h:
            p.apyPct1D != null ? Math.round(p.apyPct1D * 100) / 100 : null,
          tvl: p.tvlUsd,
          stablecoin: p.stablecoin,
          ilRisk,
          risk: getRisk(p.apy, p.stablecoin, ilRisk),
          url:
            PROTOCOL_URLS[p.project] ??
            `https://defillama.com/yields/pool/${p.pool}`,
          trending:
            p.apyPct1D != null && p.apyPct1D > 8,
          category: getCategory(p.symbol, p.stablecoin),
        };
      });

    _cache = { pools, fetchedAt: now };
    return NextResponse.json({ pools, fetchedAt: now });
  } catch {
    return NextResponse.json({ pools: FALLBACK, fetchedAt: now, fallback: true });
  }
}
