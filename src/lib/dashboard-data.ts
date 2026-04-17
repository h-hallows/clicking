export interface WatchlistItem {
  id: string;
  name: string;
  category: string;
  chain: string;
  tvl: number;
  tvlChange24h: number;
  apy?: number;
  apyChange24h?: number;
  price?: number;
  priceChange24h?: number;
  verified: boolean;
  accentColor: string;
}

export interface MarketMover {
  id: string;
  name: string;
  category: string;
  chain: string;
  tvlChange7d: number;
  tvl: number;
  accentColor: string;
}

export interface Alert {
  id: string;
  type: "apy_spike" | "tvl_drop" | "tvl_surge" | "new_protocol" | "risk_warning";
  protocol: string;
  message: string;
  timestamp: string;
  accentColor: string;
  read: boolean;
}

export interface MarketStat {
  label: string;
  value: string;
  change: number;
  color: string;
  sublabel: string;
}

export const MARKET_STATS: MarketStat[] = [
  { label: "DeFi TVL",        value: "$132.4B",  change: +2.4,  color: "#7c6af7", sublabel: "Total Value Locked"     },
  { label: "Stablecoins",     value: "$324B",    change: +0.8,  color: "#00d2e6", sublabel: "Market Cap"             },
  { label: "Active Wallets",  value: "21.4M",    change: +5.1,  color: "#00e5a0", sublabel: "30-day active"          },
  { label: "DEX Volume 24h",  value: "$8.2B",    change: -3.2,  color: "#f5c518", sublabel: "Across all chains"      },
];

export const WATCHLIST: WatchlistItem[] = [
  {
    id: "aave",
    name: "Aave",
    category: "Lending",
    chain: "Ethereum",
    tvl: 12400,
    tvlChange24h: +1.8,
    apy: 4.2,
    apyChange24h: +0.3,
    verified: true,
    accentColor: "#00e5a0",
  },
  {
    id: "pendle",
    name: "Pendle",
    category: "Yield",
    chain: "Arbitrum",
    tvl: 2100,
    tvlChange24h: +6.4,
    apy: 22.5,
    apyChange24h: +2.1,
    verified: true,
    accentColor: "#f5c518",
  },
  {
    id: "ethena-usd",
    name: "Ethena",
    category: "Stablecoin",
    chain: "Ethereum",
    tvl: 3200,
    tvlChange24h: +3.1,
    apy: 18.7,
    apyChange24h: -1.2,
    verified: true,
    accentColor: "#a8e6cf",
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    category: "Derivatives",
    chain: "Arbitrum",
    tvl: 1100,
    tvlChange24h: +9.2,
    verified: true,
    accentColor: "#ff6b6b",
  },
  {
    id: "aerodrome",
    name: "Aerodrome",
    category: "DEX",
    chain: "Base",
    tvl: 780,
    tvlChange24h: +4.7,
    apy: 28.3,
    apyChange24h: +3.4,
    verified: true,
    accentColor: "#00d2e6",
  },
  {
    id: "morpho",
    name: "Morpho",
    category: "Lending",
    chain: "Ethereum",
    tvl: 3200,
    tvlChange24h: -0.9,
    apy: 7.8,
    apyChange24h: -0.4,
    verified: true,
    accentColor: "#00e5a0",
  },
];

export const MARKET_MOVERS: MarketMover[] = [
  { id: "hyperliquid", name: "Hyperliquid", category: "Derivatives", chain: "Arbitrum", tvlChange7d: +42.1, tvl: 1100, accentColor: "#ff6b6b"  },
  { id: "pendle",      name: "Pendle",      category: "Yield",       chain: "Arbitrum", tvlChange7d: +28.6, tvl: 2100, accentColor: "#f5c518"  },
  { id: "aerodrome",   name: "Aerodrome",   category: "DEX",         chain: "Base",     tvlChange7d: +19.3, tvl: 780,  accentColor: "#00d2e6"  },
  { id: "ethena-usd",  name: "Ethena",      category: "Stablecoin",  chain: "Ethereum", tvlChange7d: +14.8, tvl: 3200, accentColor: "#a8e6cf"  },
  { id: "compound",    name: "Compound",    category: "Lending",     chain: "Ethereum", tvlChange7d: -8.2,  tvl: 2800, accentColor: "#00e5a0"  },
  { id: "curve",       name: "Curve",       category: "DEX",         chain: "Ethereum", tvlChange7d: -5.4,  tvl: 2100, accentColor: "#00d2e6"  },
];

export const ALERTS: Alert[] = [
  {
    id: "1",
    type: "apy_spike",
    protocol: "Pendle",
    message: "APY spiked to 22.5% — up 2.1% in 24h on Arbitrum PT-USDe pool.",
    timestamp: "2m ago",
    accentColor: "#f5c518",
    read: false,
  },
  {
    id: "2",
    type: "tvl_surge",
    protocol: "Hyperliquid",
    message: "TVL up 42% this week — strong inflows to perp markets.",
    timestamp: "18m ago",
    accentColor: "#ff6b6b",
    read: false,
  },
  {
    id: "3",
    type: "new_protocol",
    protocol: "Base",
    message: "3 new protocols verified on Base this week. View on The Scope.",
    timestamp: "1h ago",
    accentColor: "#7c6af7",
    read: false,
  },
  {
    id: "4",
    type: "apy_spike",
    protocol: "Aerodrome",
    message: "USDC/ETH pool APY reached 28.3% — up 3.4% from yesterday.",
    timestamp: "3h ago",
    accentColor: "#00d2e6",
    read: true,
  },
  {
    id: "5",
    type: "risk_warning",
    protocol: "Curve",
    message: "TVL down 5.4% over 7 days. Monitor liquidity depth.",
    timestamp: "5h ago",
    accentColor: "#ff9f43",
    read: true,
  },
];

export function formatTVL(millions: number): string {
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`;
  return `$${millions}M`;
}
