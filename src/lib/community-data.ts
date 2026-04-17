export type ActivityType =
  | "entered_position"
  | "added_liquidity"
  | "claimed_yield"
  | "bridged"
  | "swapped"
  | "exited_position";

export interface CommunityUser {
  id: string;
  handle: string;
  avatar: string; // initials
  avatarColor: string;
  verified: boolean;
  rank: number;
  pnl30d: number;        // % return last 30 days
  totalYield: string;    // lifetime yield earned
  followers: number;
  chains: string[];
  badge?: "whale" | "builder" | "degen" | "sage";
}

export interface OnChainActivity {
  id: string;
  userId: string;
  user: CommunityUser;
  type: ActivityType;
  protocol: string;
  protocolColor: string;
  chain: string;
  amount: string;
  asset: string;
  detail: string;
  timestamp: string;
  txHash: string;
  verified: true;
  likes: number;
  comments: number;
  apy?: string;
}

export interface TrendingProtocol {
  id: string;
  name: string;
  color: string;
  category: string;
  chain: string;
  activityCount: number;
  activityChange: number;
  uniqueUsers: number;
}

export const BADGE_CONFIG = {
  whale:   { label: "Whale",   color: "#7c6af7", bg: "#7c6af720" },
  builder: { label: "Builder", color: "#00d2e6", bg: "#00d2e620" },
  degen:   { label: "Degen",   color: "#ff6b6b", bg: "#ff6b6b20" },
  sage:    { label: "Sage",    color: "#00e5a0", bg: "#00e5a020" },
};

export const COMMUNITY_USERS: CommunityUser[] = [
  { id: "u1", handle: "0xAres",     avatar: "AR", avatarColor: "#7c6af7", verified: true,  rank: 1,  pnl30d: +84.2, totalYield: "$142K", followers: 4821, chains: ["Ethereum", "Arbitrum"],         badge: "whale"   },
  { id: "u2", handle: "yieldmaxi",  avatar: "YM", avatarColor: "#00e5a0", verified: true,  rank: 2,  pnl30d: +61.7, totalYield: "$89K",  followers: 3104, chains: ["Arbitrum", "Base"],             badge: "sage"    },
  { id: "u3", handle: "basebuildr", avatar: "BB", avatarColor: "#00d2e6", verified: true,  rank: 3,  pnl30d: +47.3, totalYield: "$56K",  followers: 2287, chains: ["Base"],                         badge: "builder" },
  { id: "u4", handle: "perpdegen",  avatar: "PD", avatarColor: "#ff6b6b", verified: true,  rank: 4,  pnl30d: +39.1, totalYield: "$38K",  followers: 1943, chains: ["Arbitrum"],                     badge: "degen"   },
  { id: "u5", handle: "sol_surfer", avatar: "SS", avatarColor: "#f5c518", verified: true,  rank: 5,  pnl30d: +28.4, totalYield: "$29K",  followers: 1201, chains: ["Solana"],                       badge: "degen"   },
  { id: "u6", handle: "curvdaddy",  avatar: "CD", avatarColor: "#a8e6cf", verified: false, rank: 6,  pnl30d: +18.9, totalYield: "$18K",  followers: 887,  chains: ["Ethereum"],                     badge: "sage"    },
  { id: "u7", handle: "eth_oracle", avatar: "EO", avatarColor: "#c084fc", verified: true,  rank: 7,  pnl30d: +14.2, totalYield: "$14K",  followers: 654,  chains: ["Ethereum", "Polygon"],          badge: "sage"    },
  { id: "u8", handle: "rfarm3r",    avatar: "RF", avatarColor: "#ff9f43", verified: false, rank: 8,  pnl30d: +9.8,  totalYield: "$9K",   followers: 412,  chains: ["Arbitrum", "Base", "Ethereum"], badge: "builder" },
];

export const ACTIVITY_FEED: OnChainActivity[] = [
  {
    id: "a1",
    userId: "u1",
    user: COMMUNITY_USERS[0],
    type: "entered_position",
    protocol: "Pendle",
    protocolColor: "#f5c518",
    chain: "Arbitrum",
    amount: "$240,000",
    asset: "PT-USDe",
    detail: "Entered PT-USDe position at 22.5% fixed APY — locking yield through Jun 2026.",
    timestamp: "4m ago",
    txHash: "0x3f9a...e21b",
    verified: true,
    likes: 84,
    comments: 12,
    apy: "22.5%",
  },
  {
    id: "a2",
    userId: "u2",
    user: COMMUNITY_USERS[1],
    type: "added_liquidity",
    protocol: "Aerodrome",
    protocolColor: "#00d2e6",
    chain: "Base",
    amount: "$58,000",
    asset: "USDC/ETH",
    detail: "Added liquidity to USDC/ETH pool. Current APY 28.3%. Base fees + AERO emissions.",
    timestamp: "17m ago",
    txHash: "0x7c2b...f40d",
    verified: true,
    likes: 41,
    comments: 7,
    apy: "28.3%",
  },
  {
    id: "a3",
    userId: "u4",
    user: COMMUNITY_USERS[3],
    type: "entered_position",
    protocol: "Hyperliquid",
    protocolColor: "#ff6b6b",
    chain: "Arbitrum",
    amount: "$95,000",
    asset: "BTC-PERP",
    detail: "Opened 3x long BTC-PERP. OI is building. Watching $72k as key resistance.",
    timestamp: "32m ago",
    txHash: "0x1d4e...bb9c",
    verified: true,
    likes: 127,
    comments: 34,
  },
  {
    id: "a4",
    userId: "u3",
    user: COMMUNITY_USERS[2],
    type: "swapped",
    protocol: "Uniswap",
    protocolColor: "#7c6af7",
    chain: "Base",
    amount: "$14,200",
    asset: "ETH → cbBTC",
    detail: "Rotating ETH into cbBTC on Base ahead of the halving narrative. Tight slippage via Uni v4.",
    timestamp: "1h ago",
    txHash: "0x9a1f...2c7e",
    verified: true,
    likes: 58,
    comments: 9,
  },
  {
    id: "a5",
    userId: "u6",
    user: COMMUNITY_USERS[5],
    type: "claimed_yield",
    protocol: "Curve",
    protocolColor: "#00d2e6",
    chain: "Ethereum",
    amount: "$3,840",
    asset: "3CRV rewards",
    detail: "Claimed 30 days of CRV + CVX rewards. Compounding back into stablecoin pool.",
    timestamp: "2h ago",
    txHash: "0x6b8d...a34f",
    verified: true,
    likes: 22,
    comments: 3,
  },
  {
    id: "a6",
    userId: "u2",
    user: COMMUNITY_USERS[1],
    type: "bridged",
    protocol: "Stargate",
    protocolColor: "#ff9f43",
    chain: "Arbitrum → Base",
    amount: "$120,000",
    asset: "USDC",
    detail: "Bridging capital to Base to chase Aerodrome yields before they compress. Fast bridge via Stargate.",
    timestamp: "3h ago",
    txHash: "0x4e7c...d91a",
    verified: true,
    likes: 36,
    comments: 5,
  },
  {
    id: "a7",
    userId: "u5",
    user: COMMUNITY_USERS[4],
    type: "entered_position",
    protocol: "Raydium",
    protocolColor: "#f5c518",
    chain: "Solana",
    amount: "$31,000",
    asset: "SOL/USDC",
    detail: "LP'd into SOL/USDC concentrated range. 0.3% fee tier. Tight range for max fees.",
    timestamp: "4h ago",
    txHash: "sol:3Hk9...mN2p",
    verified: true,
    likes: 19,
    comments: 2,
    apy: "41.2%",
  },
  {
    id: "a8",
    userId: "u1",
    user: COMMUNITY_USERS[0],
    type: "exited_position",
    protocol: "GMX",
    protocolColor: "#ff6b6b",
    chain: "Arbitrum",
    amount: "$180,000",
    asset: "ETH-PERP",
    detail: "Closed ETH long +18.4% after target hit. Moving into fixed yield. Good trade.",
    timestamp: "6h ago",
    txHash: "0x2a5f...e17d",
    verified: true,
    likes: 203,
    comments: 41,
  },
];

export const TRENDING_PROTOCOLS: TrendingProtocol[] = [
  { id: "pendle",      name: "Pendle",      color: "#f5c518", category: "Yield",      chain: "Arbitrum", activityCount: 284,  activityChange: +68, uniqueUsers: 1240 },
  { id: "hyperliquid", name: "Hyperliquid", color: "#ff6b6b", category: "Derivatives",chain: "Arbitrum", activityCount: 1820, activityChange: +42, uniqueUsers: 4300 },
  { id: "aerodrome",   name: "Aerodrome",   color: "#00d2e6", category: "DEX",        chain: "Base",     activityCount: 932,  activityChange: +31, uniqueUsers: 2810 },
  { id: "ethena-usd",  name: "Ethena",      color: "#a8e6cf", category: "Stablecoin", chain: "Ethereum", activityCount: 445,  activityChange: +24, uniqueUsers: 1680 },
  { id: "aave",        name: "Aave",        color: "#00e5a0", category: "Lending",    chain: "Ethereum", activityCount: 2140, activityChange: +8,  uniqueUsers: 6900 },
];
