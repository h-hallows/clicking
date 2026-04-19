import { NextResponse } from "next/server";

export interface PriceData {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

const COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "bittensor",
  "render-token",
  "ondo-finance",
  "hyperliquid",
  "ripple",
  "chainlink",
  "uniswap",
];

const SYMBOLS: Record<string, string> = {
  bitcoin:       "BTC",
  ethereum:      "ETH",
  solana:        "SOL",
  bittensor:     "TAO",
  "render-token": "RNDR",
  "ondo-finance": "ONDO",
  hyperliquid:   "HYPE",
  ripple:        "XRP",
  chainlink:     "LINK",
  uniswap:       "UNI",
};

// Fallback prices (used if CoinGecko is unavailable) — approximate 2026 levels
const FALLBACK: PriceData[] = [
  { id: "bitcoin",        symbol: "BTC",  price: 95000,  change24h:  1.8  },
  { id: "ethereum",       symbol: "ETH",  price: 3800,   change24h:  2.4  },
  { id: "solana",         symbol: "SOL",  price: 185,    change24h: -0.9  },
  { id: "bittensor",      symbol: "TAO",  price: 380,    change24h:  4.2  },
  { id: "render-token",   symbol: "RNDR", price: 6.80,   change24h:  3.1  },
  { id: "ondo-finance",   symbol: "ONDO", price: 1.10,   change24h:  5.6  },
  { id: "hyperliquid",    symbol: "HYPE", price: 22.50,  change24h:  7.3  },
  { id: "ripple",         symbol: "XRP",  price: 2.40,   change24h:  1.2  },
  { id: "chainlink",      symbol: "LINK", price: 18.50,  change24h:  2.8  },
  { id: "uniswap",        symbol: "UNI",  price: 8.90,   change24h: -1.4  },
];

let _cache: { prices: PriceData[]; fetchedAt: number } | null = null;
const CACHE_TTL = 30_000;

export async function GET() {
  const now = Date.now();

  if (_cache && now - _cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ prices: _cache.prices, fetchedAt: _cache.fetchedAt, cached: true });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(",")}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const raw: Record<string, { usd: number; usd_24h_change: number }> = await res.json();

    const prices: PriceData[] = COINS.map((id) => ({
      id,
      symbol: SYMBOLS[id] ?? id.toUpperCase(),
      price:     raw[id]?.usd            ?? FALLBACK.find((f) => f.id === id)?.price      ?? 0,
      change24h: raw[id]?.usd_24h_change ?? FALLBACK.find((f) => f.id === id)?.change24h ?? 0,
    }));

    const result = { prices, fetchedAt: now };
    _cache = result;
    return NextResponse.json(result);
  } catch {
    // Return fallback data so the UI always has something
    return NextResponse.json({ prices: FALLBACK, fetchedAt: now, fallback: true });
  }
}
