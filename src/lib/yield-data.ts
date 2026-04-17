export type RiskLevel = "conservative" | "moderate" | "aggressive";

export type StrategyType =
  | "stablecoin_lp"
  | "lending"
  | "yield_token"
  | "liquidity"
  | "perp_funding"
  | "restaking";

export interface YieldStrategy {
  id: string;
  name: string;
  protocol: string;
  protocolColor: string;
  chain: string;
  asset: string;
  apy: number;
  apyBreakdown: { label: string; value: number; color: string }[];
  tvl: string;
  risk: RiskLevel;
  type: StrategyType;
  audited: boolean;
  auditor?: string;
  description: string;
  tags: string[];
  minDeposit: string;
  lockup: string;
  url: string;
}

export interface ActivePosition {
  id: string;
  strategy: YieldStrategy;
  deposited: number;
  currentValue: number;
  earnedYield: number;
  entryDate: string;
  apy: number;
}

export const RISK_CONFIG: Record<RiskLevel, {
  label: string;
  color: string;
  bg: string;
  description: string;
  apyRange: string;
}> = {
  conservative: {
    label: "Conservative",
    color: "#00e5a0",
    bg: "#00e5a015",
    description: "Stablecoins only. Audited protocols. Capital preservation first.",
    apyRange: "4–12%",
  },
  moderate: {
    label: "Moderate",
    color: "#f5c518",
    bg: "#f5c51815",
    description: "Mix of stablecoins and blue-chip assets. Balanced risk/reward.",
    apyRange: "10–25%",
  },
  aggressive: {
    label: "Aggressive",
    color: "#ff6b6b",
    bg: "#ff6b6b15",
    description: "Higher-yield strategies. Volatile assets. Max return potential.",
    apyRange: "20–60%+",
  },
};

export const STRATEGIES: YieldStrategy[] = [
  // Conservative
  {
    id: "s1",
    name: "USDC Lending",
    protocol: "Aave",
    protocolColor: "#00e5a0",
    chain: "Ethereum",
    asset: "USDC",
    apy: 5.8,
    apyBreakdown: [
      { label: "Base rate", value: 4.2, color: "#00e5a0" },
      { label: "AAVE rewards", value: 1.6, color: "#7c6af7" },
    ],
    tvl: "$12.4B",
    risk: "conservative",
    type: "lending",
    audited: true,
    auditor: "OpenZeppelin",
    description: "Supply USDC to Aave v3. Earn base lending rate plus AAVE token rewards. Withdraw anytime.",
    tags: ["Stablecoin", "Liquid", "Battle-tested"],
    minDeposit: "$1",
    lockup: "None",
    url: "https://app.aave.com",
  },
  {
    id: "s2",
    name: "3pool Stable LP",
    protocol: "Curve",
    protocolColor: "#00d2e6",
    chain: "Ethereum",
    asset: "USDC/USDT/DAI",
    apy: 8.4,
    apyBreakdown: [
      { label: "Trading fees", value: 3.1, color: "#00d2e6" },
      { label: "CRV rewards", value: 3.8, color: "#7c6af7" },
      { label: "CVX boost",   value: 1.5, color: "#ff9f43" },
    ],
    tvl: "$1.8B",
    risk: "conservative",
    type: "stablecoin_lp",
    audited: true,
    auditor: "Trail of Bits",
    description: "Provide liquidity to Curve's flagship 3pool. Deep liquidity, minimal IL, boosted with Convex.",
    tags: ["Stablecoin", "Liquid", "Battle-tested"],
    minDeposit: "$10",
    lockup: "None",
    url: "https://curve.fi",
  },
  {
    id: "s3",
    name: "USDe Savings",
    protocol: "Ethena",
    protocolColor: "#a8e6cf",
    chain: "Ethereum",
    asset: "USDe",
    apy: 18.7,
    apyBreakdown: [
      { label: "Funding rate", value: 15.2, color: "#a8e6cf" },
      { label: "Basis spread", value: 3.5,  color: "#00e5a0" },
    ],
    tvl: "$3.2B",
    risk: "conservative",
    type: "stablecoin_lp",
    audited: true,
    auditor: "Quantstamp",
    description: "Stake USDe to earn protocol yield from delta-neutral perp funding rates. High APY, stablecoin exposure.",
    tags: ["Stablecoin", "High APY", "Delta-neutral"],
    minDeposit: "$10",
    lockup: "7 days",
    url: "https://app.ethena.fi",
  },
  // Moderate
  {
    id: "s4",
    name: "PT-USDe Fixed Yield",
    protocol: "Pendle",
    protocolColor: "#f5c518",
    chain: "Arbitrum",
    asset: "PT-USDe",
    apy: 22.5,
    apyBreakdown: [
      { label: "Fixed yield",   value: 22.5, color: "#f5c518" },
    ],
    tvl: "$2.1B",
    risk: "moderate",
    type: "yield_token",
    audited: true,
    auditor: "Dedaub",
    description: "Lock in 22.5% fixed APY on USDe until June 2026. No rate fluctuation risk. Pure yield capture.",
    tags: ["Fixed rate", "Stablecoin", "Arbitrum"],
    minDeposit: "$50",
    lockup: "Until Jun 2026",
    url: "https://app.pendle.finance",
  },
  {
    id: "s5",
    name: "USDC/ETH LP",
    protocol: "Aerodrome",
    protocolColor: "#00d2e6",
    chain: "Base",
    asset: "USDC/ETH",
    apy: 28.3,
    apyBreakdown: [
      { label: "Trading fees", value: 12.4, color: "#00d2e6" },
      { label: "AERO rewards", value: 15.9, color: "#7c6af7" },
    ],
    tvl: "$780M",
    risk: "moderate",
    type: "liquidity",
    audited: true,
    auditor: "Spearbit",
    description: "Concentrated liquidity on Base's dominant DEX. ETH price exposure + high fee generation.",
    tags: ["Blue-chip", "High yield", "Base"],
    minDeposit: "$100",
    lockup: "None",
    url: "https://aerodrome.finance",
  },
  {
    id: "s6",
    name: "ETH Restaking",
    protocol: "EigenLayer",
    protocolColor: "#c084fc",
    chain: "Ethereum",
    asset: "stETH",
    apy: 14.2,
    apyBreakdown: [
      { label: "Staking yield", value: 3.8,  color: "#00e5a0" },
      { label: "AVS rewards",   value: 7.2,  color: "#c084fc" },
      { label: "Points boost",  value: 3.2,  color: "#f5c518" },
    ],
    tvl: "$14.8B",
    risk: "moderate",
    type: "restaking",
    audited: true,
    auditor: "Sigma Prime",
    description: "Restake stETH to secure EigenLayer AVSs. Earn base ETH staking yield plus AVS operator fees.",
    tags: ["ETH", "Restaking", "Emerging"],
    minDeposit: "$100",
    lockup: "7 days",
    url: "https://app.eigenlayer.xyz",
  },
  // Aggressive
  {
    id: "s7",
    name: "SOL/USDC Concentrated LP",
    protocol: "Raydium",
    protocolColor: "#f5c518",
    chain: "Solana",
    asset: "SOL/USDC",
    apy: 41.2,
    apyBreakdown: [
      { label: "Fee income", value: 28.4, color: "#f5c518" },
      { label: "RAY rewards", value: 12.8, color: "#ff9f43" },
    ],
    tvl: "$1.4B",
    risk: "aggressive",
    type: "liquidity",
    audited: true,
    auditor: "Halborn",
    description: "Tight-range concentrated LP on Solana. Maximum fee capture but active management needed.",
    tags: ["SOL", "Active mgmt", "High APY"],
    minDeposit: "$50",
    lockup: "None",
    url: "https://raydium.io",
  },
  {
    id: "s8",
    name: "BTC Perp Funding",
    protocol: "Hyperliquid",
    protocolColor: "#ff6b6b",
    chain: "Arbitrum",
    asset: "USDC",
    apy: 34.8,
    apyBreakdown: [
      { label: "Funding rates", value: 34.8, color: "#ff6b6b" },
    ],
    tvl: "$1.1B",
    risk: "aggressive",
    type: "perp_funding",
    audited: true,
    auditor: "Zellic",
    description: "Earn positive BTC perp funding rates by providing liquidity to HLP vault. High APY, market-dependent.",
    tags: ["BTC", "Perp", "Variable rate"],
    minDeposit: "$500",
    lockup: "4 days",
    url: "https://app.hyperliquid.xyz",
  },
];

export const MOCK_POSITIONS: ActivePosition[] = [
  {
    id: "p1",
    strategy: STRATEGIES[0],
    deposited: 10000,
    currentValue: 10241,
    earnedYield: 241,
    entryDate: "Mar 15, 2026",
    apy: 5.8,
  },
  {
    id: "p2",
    strategy: STRATEGIES[3],
    deposited: 25000,
    currentValue: 26180,
    earnedYield: 1180,
    entryDate: "Feb 28, 2026",
    apy: 22.5,
  },
];
