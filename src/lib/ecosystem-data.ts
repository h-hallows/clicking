export type NodeCategory =
  | "chain"
  | "dex"
  | "lending"
  | "yield"
  | "liquid-staking"
  | "bridge"
  | "stablecoin"
  | "derivative"
  | "nft"
  | "oracle"
  | "gaming"
  | "social"
  | "rwa"
  | "launchpad";

export interface EcosystemNode {
  id: string;
  label: string;
  category: NodeCategory;
  primaryChain: string;
  chains: string[];
  tvlNum: number; // millions USD
  tvl?: string;
  apy?: string;
  verified: boolean;
  isHot?: boolean;
  description: string;
  url: string;
}

export interface EcosystemEdge {
  source: string;
  target: string;
}

export const CATEGORY_CONFIG: Record<
  NodeCategory,
  { color: string; label: string }
> = {
  chain:           { color: "#818cf8", label: "Chain" },
  dex:             { color: "#22d3ee", label: "DEX" },
  lending:         { color: "#34d399", label: "Lending" },
  yield:           { color: "#fbbf24", label: "Yield" },
  "liquid-staking":{ color: "#fb923c", label: "Liquid Staking" },
  bridge:          { color: "#f472b6", label: "Bridge" },
  stablecoin:      { color: "#a5f3fc", label: "Stablecoin" },
  derivative:      { color: "#f87171", label: "Derivatives" },
  nft:             { color: "#c084fc", label: "NFT" },
  oracle:          { color: "#2dd4bf", label: "Oracle" },
  gaming:          { color: "#a3e635", label: "Gaming" },
  social:          { color: "#fcd34d", label: "Social" },
  rwa:             { color: "#94a3b8", label: "RWA" },
  launchpad:       { color: "#e879f9", label: "Launchpad" },
};

// Normalized cluster center positions (0–1) for force layout
export const CLUSTER_POSITIONS: Record<NodeCategory, { cx: number; cy: number }> = {
  chain:            { cx: 0.50, cy: 0.50 },
  dex:              { cx: 0.72, cy: 0.30 },
  lending:          { cx: 0.76, cy: 0.52 },
  yield:            { cx: 0.70, cy: 0.73 },
  "liquid-staking": { cx: 0.28, cy: 0.28 },
  bridge:           { cx: 0.50, cy: 0.18 },
  stablecoin:       { cx: 0.50, cy: 0.80 },
  derivative:       { cx: 0.26, cy: 0.73 },
  nft:              { cx: 0.88, cy: 0.20 },
  oracle:           { cx: 0.12, cy: 0.50 },
  gaming:           { cx: 0.55, cy: 0.91 },
  social:           { cx: 0.12, cy: 0.22 },
  rwa:              { cx: 0.88, cy: 0.72 },
  launchpad:        { cx: 0.88, cy: 0.42 },
};

export const CHAINS_LIST = [
  { id: "all",       label: "All Chains" },
  { id: "ethereum",  label: "Ethereum" },
  { id: "arbitrum",  label: "Arbitrum" },
  { id: "base",      label: "Base" },
  { id: "solana",    label: "Solana" },
  { id: "optimism",  label: "Optimism" },
  { id: "polygon",   label: "Polygon" },
  { id: "bnb-chain", label: "BNB Chain" },
  { id: "avalanche", label: "Avalanche" },
  { id: "zksync",    label: "zkSync" },
  { id: "starknet",  label: "Starknet" },
  { id: "sui",       label: "Sui" },
  { id: "cosmos",    label: "Cosmos" },
  { id: "ton",       label: "TON" },
  { id: "blast",     label: "Blast" },
  { id: "berachain", label: "Berachain" },
];

function n(
  id: string, label: string, category: NodeCategory,
  primaryChain: string, chains: string[], tvlNum: number, url: string, description: string,
  opts?: { tvl?: string; apy?: string; isHot?: boolean; verified?: boolean }
): EcosystemNode {
  return {
    id, label, category, primaryChain, chains, tvlNum, url, description,
    tvl: opts?.tvl,
    apy: opts?.apy,
    isHot: opts?.isHot ?? false,
    verified: opts?.verified ?? true,
  };
}

export const NODES: EcosystemNode[] = [
  // ── CHAINS ──────────────────────────────────────────────────────────────────
  n("ethereum",  "Ethereum",  "chain", "ethereum",  ["ethereum"],  48200, "https://ethereum.org",          "The leading smart contract platform powering the majority of DeFi.", { tvl: "$48.2B" }),
  n("solana",    "Solana",    "chain", "solana",    ["solana"],     9800, "https://solana.com",            "High-performance L1 with sub-second finality and ultra-low fees.", { tvl: "$9.8B", isHot: true }),
  n("arbitrum",  "Arbitrum",  "chain", "arbitrum",  ["arbitrum"],  18400, "https://arbitrum.io",           "Ethereum L2 using optimistic rollups for fast, cheap transactions.", { tvl: "$18.4B", isHot: true }),
  n("base",      "Base",      "chain", "base",      ["base"],       7100, "https://base.org",              "Coinbase's Ethereum L2 — fastest-growing chain of 2024.", { tvl: "$7.1B", isHot: true }),
  n("optimism",  "Optimism",  "chain", "optimism",  ["optimism"],   3200, "https://optimism.io",           "Ethereum L2 powering the OP Stack Superchain ecosystem.", { tvl: "$3.2B" }),
  n("polygon",   "Polygon",   "chain", "polygon",   ["polygon"],    1200, "https://polygon.technology",    "Ethereum sidechain and zkEVM L2 ecosystem.", { tvl: "$1.2B" }),
  n("bnb-chain", "BNB Chain", "chain", "bnb-chain", ["bnb-chain"],  5200, "https://www.bnbchain.org",      "Binance's high-throughput EVM chain with massive retail user base.", { tvl: "$5.2B" }),
  n("avalanche", "Avalanche", "chain", "avalanche", ["avalanche"],  1000, "https://avax.network",          "Multi-chain platform with customizable Subnets.", { tvl: "$1.0B" }),
  n("zksync",    "zkSync",    "chain", "zksync",    ["zksync"],      900, "https://zksync.io",             "ZK rollup L2 with native account abstraction.", { tvl: "$900M" }),
  n("starknet",  "Starknet",  "chain", "starknet",  ["starknet"],    420, "https://starknet.io",           "ZK rollup using Cairo VM and STARK proofs.", { tvl: "$420M" }),
  n("linea",     "Linea",     "chain", "linea",     ["linea"],       700, "https://linea.build",           "Consensys ZK-EVM L2 fully compatible with Ethereum.", { tvl: "$700M" }),
  n("scroll",    "Scroll",    "chain", "scroll",    ["scroll"],      380, "https://scroll.io",             "zkEVM L2 designed for EVM bytecode equivalence.", { tvl: "$380M" }),
  n("mantle",    "Mantle",    "chain", "mantle",    ["mantle"],     1100, "https://mantle.xyz",            "OP-stack L2 with modular data availability layer.", { tvl: "$1.1B" }),
  n("blast",     "Blast",     "chain", "blast",     ["blast"],      1500, "https://blast.io",              "L2 with native ETH and stablecoin yield built in.", { tvl: "$1.5B", isHot: true }),
  n("berachain", "Berachain", "chain", "berachain", ["berachain"],  2100, "https://berachain.com",         "EVM-identical L1 with Proof-of-Liquidity consensus.", { tvl: "$2.1B", isHot: true }),
  n("sui",       "Sui",       "chain", "sui",       ["sui"],        1800, "https://sui.io",                "Move-based L1 with parallel transaction execution.", { tvl: "$1.8B", isHot: true }),
  n("aptos",     "Aptos",     "chain", "aptos",     ["aptos"],       680, "https://aptoslabs.com",         "Move-based L1 from ex-Meta Diem engineers.", { tvl: "$680M" }),
  n("ton",       "TON",       "chain", "ton",       ["ton"],         800, "https://ton.org",               "The Open Network — Telegram's blockchain ecosystem.", { tvl: "$800M", isHot: true }),
  n("near",      "NEAR",      "chain", "near",      ["near"],        320, "https://near.org",              "Sharded PoS blockchain with human-readable accounts.", { tvl: "$320M" }),
  n("cosmos",    "Cosmos",    "chain", "cosmos",    ["cosmos"],     1000, "https://cosmos.network",        "Internet of blockchains — IBC-connected chain ecosystem.", { tvl: "$1.0B" }),
  n("fantom",    "Fantom",    "chain", "fantom",    ["fantom"],      350, "https://fantom.foundation",     "DAG-based aBFT consensus for high-speed DeFi.", { tvl: "$350M" }),
  n("gnosis",    "Gnosis",    "chain", "gnosis",    ["gnosis"],      420, "https://gnosis.io",             "EVM chain focused on payments and prediction markets.", { tvl: "$420M" }),
  n("manta",     "Manta",     "chain", "manta",     ["manta"],       290, "https://manta.network",         "Modular L2 for ZK applications and privacy.", { tvl: "$290M" }),
  n("taiko",     "Taiko",     "chain", "taiko",     ["taiko"],       180, "https://taiko.xyz",             "Based ZK-EVM rollup that inherits Ethereum security.", { tvl: "$180M" }),
  n("ronin",     "Ronin",     "chain", "ronin",     ["ronin"],       380, "https://roninchain.com",        "Axie Infinity's EVM sidechain optimized for gaming.", { tvl: "$380M" }),

  // ── DEX ─────────────────────────────────────────────────────────────────────
  n("uniswap",    "Uniswap",    "dex", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","zksync","avalanche"], 5800, "https://uniswap.org",         "Largest DEX by volume with concentrated liquidity AMM.", { tvl: "$5.8B", isHot: true }),
  n("curve",      "Curve",      "dex", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","avalanche","fantom","gnosis"],    2100, "https://curve.fi",            "Stablecoin-optimized AMM and crvUSD minter.", { tvl: "$2.1B", apy: "4–12%" }),
  n("pancakeswap","PancakeSwap","dex", "bnb-chain",["bnb-chain","ethereum","arbitrum","base","zksync","aptos"],                         2200, "https://pancakeswap.finance", "Leading DEX on BNB Chain with lotteries and gaming.", { tvl: "$2.2B" }),
  n("raydium",    "Raydium",    "dex", "solana",   ["solana"],                                                                          1400, "https://raydium.io",          "Solana's leading AMM and concentrated liquidity hub.", { tvl: "$1.4B", isHot: true }),
  n("aerodrome",  "Aerodrome",  "dex", "base",     ["base"],                                                                            780,  "https://aerodrome.finance",   "Base's dominant DEX and ve(3,3) liquidity layer.", { tvl: "$780M", apy: "8–40%", isHot: true }),
  n("balancer",   "Balancer",   "dex", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","avalanche","gnosis"],             780,  "https://balancer.fi",         "Programmable liquidity with weighted and boosted pools.", { tvl: "$780M", apy: "4–18%" }),
  n("orca",       "Orca",       "dex", "solana",   ["solana"],                                                                          380,  "https://orca.so",             "Leading Solana DEX with Whirlpools concentrated liquidity.", { tvl: "$380M" }),
  n("velodrome",  "Velodrome",  "dex", "optimism", ["optimism"],                                                                        430,  "https://velodrome.finance",   "Optimism's flywheel DEX with ve(3,3) tokenomics.", { tvl: "$430M" }),
  n("camelot",    "Camelot",    "dex", "arbitrum", ["arbitrum"],                                                                        320,  "https://camelot.exchange",    "Arbitrum-native DEX with concentrated liquidity and launchpad.", { tvl: "$320M" }),
  n("meteora",    "Meteora",    "dex", "solana",   ["solana"],                                                                          650,  "https://meteora.ag",          "Solana's dynamic liquidity protocol with DLMM pools.", { tvl: "$650M", isHot: true }),
  n("sushiswap",  "SushiSwap",  "dex", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom","gnosis"], 520, "https://sushi.com", "Community-owned multi-chain DEX with cross-chain routing.", { tvl: "$520M" }),
  n("trader-joe", "Trader Joe", "dex", "avalanche",["avalanche","arbitrum","bnb-chain"],                                                 120,  "https://traderjoexyz.com",    "Avalanche's home DEX with liquidity book model.", { tvl: "$120M" }),
  n("kyberswap",  "KyberSwap",  "dex", "ethereum", ["ethereum","arbitrum","base","polygon","bnb-chain","avalanche","fantom"],             80,   "https://kyberswap.com",       "On-chain aggregator with Elastic liquidity pools.", { tvl: "$80M" }),
  n("osmosis",    "Osmosis",    "dex", "cosmos",   ["cosmos"],                                                                           520,  "https://osmosis.zone",        "Cosmos ecosystem's leading DEX and DeFi hub.", { tvl: "$520M" }),
  n("jupiter",    "Jupiter",    "dex", "solana",   ["solana"],                                                                           200,  "https://jup.ag",              "Solana's best swap aggregator, DCA, and perps platform.", { isHot: true }),
  n("1inch",      "1inch",      "dex", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche"],           200,  "https://1inch.io",            "DEX aggregator routing trades through hundreds of protocols.", { tvl: "$200M" }),
  n("woofi",      "WOOFi",      "dex", "arbitrum", ["arbitrum","bnb-chain","optimism","polygon","avalanche"],                            120,  "https://woo.org",             "Synthetic orderbook AMM backed by WOO Network.", { tvl: "$120M" }),
  n("dodo",       "DODO",       "dex", "bnb-chain",["bnb-chain","ethereum","arbitrum","polygon"],                                         60,   "https://dodoex.io",           "Proactive Market Maker with near-zero slippage.", { tvl: "$60M" }),
  n("maverick",   "Maverick",   "dex", "ethereum", ["ethereum","zksync"],                                                                 80,   "https://mav.xyz",             "Dynamic distribution AMM for active LP management.", { tvl: "$80M" }),
  n("thena",      "THENA",      "dex", "bnb-chain",["bnb-chain"],                                                                         80,   "https://thena.fi",            "BNB Chain's ve(3,3) DEX and liquidity marketplace.", { tvl: "$80M" }),
  n("ambient",    "Ambient",    "dex", "ethereum", ["ethereum","scroll"],                                                                 120,  "https://ambient.finance",     "Single-contract DEX with zero-to-infinity liquidity ranges.", { tvl: "$120M" }),
  n("ekubo",      "Ekubo",      "dex", "starknet", ["starknet"],                                                                          48,   "https://ekubo.org",           "Capital-efficient concentrated liquidity AMM on Starknet.", { tvl: "$48M" }),
  n("lifinity",   "Lifinity",   "dex", "solana",   ["solana"],                                                                            48,   "https://lifinity.io",         "Proactive market maker on Solana with oracle-based pricing.", { tvl: "$48M" }),
  n("hashflow",   "Hashflow",   "dex", "ethereum", ["ethereum","arbitrum","base","bnb-chain","polygon","avalanche"],                       40,   "https://hashflow.com",        "RFQ-based DEX with MEV protection and cross-chain swaps.", { tvl: "$40M" }),

  // ── LENDING ──────────────────────────────────────────────────────────────────
  n("aave",      "Aave",          "lending", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","gnosis","scroll","zksync"], 12400, "https://aave.com",                 "Leading decentralized lending protocol with $12B+ TVL across 12 chains.", { tvl: "$12.4B", apy: "3–8%", isHot: true }),
  n("compound",  "Compound",      "lending", "ethereum", ["ethereum","arbitrum","base","polygon","optimism"],                                                     2800,  "https://compound.finance",          "Algorithmic money market protocol that pioneered DeFi lending.", { tvl: "$2.8B", apy: "2–6%" }),
  n("morpho",    "Morpho",        "lending", "ethereum", ["ethereum","base"],                                                                                      3200,  "https://morpho.org",                "Modular lending with peer-to-peer rate optimization on top of Aave.", { tvl: "$3.2B", apy: "5–12%", isHot: true }),
  n("spark",     "Spark",         "lending", "ethereum", ["ethereum"],                                                                                             4200,  "https://spark.fi",                  "MakerDAO's lending arm with DAI/sDAI at its core.", { tvl: "$4.2B", apy: "5–8%" }),
  n("euler",     "Euler",         "lending", "ethereum", ["ethereum","arbitrum"],                                                                                  1200,  "https://euler.finance",             "Modular money market with ERC-4626 vault architecture.", { tvl: "$1.2B", isHot: true }),
  n("kamino",    "Kamino",        "lending", "solana",   ["solana"],                                                                                               1800,  "https://kamino.finance",            "Solana's leading lending and liquidity automation protocol.", { tvl: "$1.8B", apy: "4–12%", isHot: true }),
  n("marginfi",  "MarginFi",      "lending", "solana",   ["solana"],                                                                                                900,  "https://marginfi.com",              "Decentralized margin trading and lending on Solana.", { tvl: "$900M", apy: "4–10%" }),
  n("radiant",   "Radiant",       "lending", "arbitrum", ["arbitrum","bnb-chain","ethereum"],                                                                       320,  "https://radiant.capital",           "Omnichain money market powered by LayerZero.", { tvl: "$320M", apy: "6–15%" }),
  n("benqi",     "Benqi",         "lending", "avalanche",["avalanche"],                                                                                             280,  "https://benqi.fi",                  "Avalanche's native liquidity market and liquid staking protocol.", { tvl: "$280M", apy: "3–8%" }),
  n("venus",     "Venus",         "lending", "bnb-chain",["bnb-chain"],                                                                                            1800,  "https://venus.io",                  "BNB Chain's leading money market and stablecoin protocol.", { tvl: "$1.8B", apy: "3–10%" }),
  n("silo",      "Silo Finance",  "lending", "ethereum", ["ethereum","arbitrum","optimism","base"],                                                                  280,  "https://silo.finance",              "Isolated lending markets for any token with no contagion risk.", { tvl: "$280M" }),
  n("moonwell",  "Moonwell",      "lending", "base",     ["base","optimism"],                                                                                        280,  "https://moonwell.fi",               "Open lending protocol on Base and Optimism.", { tvl: "$280M", apy: "3–9%", isHot: true }),
  n("fraxlend",  "Fraxlend",      "lending", "ethereum", ["ethereum"],                                                                                               120,  "https://frax.finance",              "Frax's isolated pair lending with dynamic interest rates.", { tvl: "$120M" }),
  n("zerolend",  "ZeroLend",      "lending", "zksync",   ["zksync","linea","manta","blast"],                                                                         320,  "https://zerolend.xyz",              "ZK-native lending protocol across multiple ZK rollups.", { tvl: "$320M", isHot: true }),
  n("ionic",     "Ionic",         "lending", "base",     ["base"],                                                                                                   120,  "https://ionic.money",               "Isolated lending pools for DeFi and LST assets on Base.", { tvl: "$120M" }),
  n("seamless",  "Seamless",      "lending", "base",     ["base"],                                                                                                   180,  "https://seamlessprotocol.com",      "Native Base lending with integrated leverage loops.", { tvl: "$180M" }),
  n("clearpool", "Clearpool",     "lending", "ethereum", ["ethereum","polygon","arbitrum"],                                                                           80,   "https://clearpool.finance",         "Permissionless credit pools for institutional borrowers.", { tvl: "$80M" }),
  n("goldfinch", "Goldfinch",     "lending", "ethereum", ["ethereum"],                                                                                                80,   "https://goldfinch.finance",         "Decentralized credit protocol for real-world off-chain loans.", { tvl: "$80M" }),
  n("centrifuge","Centrifuge",    "lending", "ethereum", ["ethereum","base"],                                                                                         320,  "https://centrifuge.io",             "Real-world asset financing on-chain.", { tvl: "$320M", isHot: true }),
  n("maple",     "Maple Finance", "lending", "ethereum", ["ethereum","solana","base"],                                                                                320,  "https://maple.finance",             "Institutional capital markets for on-chain undercollateralized lending.", { tvl: "$320M" }),

  // ── YIELD ────────────────────────────────────────────────────────────────────
  n("yearn",        "Yearn",         "yield", "ethereum", ["ethereum","arbitrum","fantom","optimism"],                                   480,  "https://yearn.fi",               "Automated yield optimization vaults across DeFi protocols.", { tvl: "$480M", apy: "6–20%" }),
  n("beefy",        "Beefy",         "yield", "arbitrum", ["arbitrum","bnb-chain","polygon","optimism","avalanche","fantom","base","ethereum"], 290, "https://beefy.finance",       "Multi-chain auto-compounding yield optimizer.", { tvl: "$290M", apy: "8–35%" }),
  n("pendle",       "Pendle",        "yield", "arbitrum", ["arbitrum","ethereum","bnb-chain","mantle","blast"],                         2100,  "https://pendle.finance",         "Yield tokenization — trade and hedge future yield at a fixed rate.", { tvl: "$2.1B", apy: "10–45%", isHot: true }),
  n("convex",       "Convex",        "yield", "ethereum", ["ethereum"],                                                                 1200,  "https://convexfinance.com",       "Boost Curve LP rewards without locking CRV yourself.", { tvl: "$1.2B", apy: "8–22%" }),
  n("aura",         "Aura Finance",  "yield", "ethereum", ["ethereum","arbitrum","polygon","optimism","gnosis","base"],                   320,  "https://aura.finance",           "Boost Balancer LP rewards — the Convex for Balancer.", { tvl: "$320M", apy: "6–18%" }),
  n("harvest",      "Harvest",       "yield", "ethereum", ["ethereum","bnb-chain","polygon","arbitrum"],                                  120,  "https://harvest.finance",        "Automated yield farming strategies with FARM token rewards.", { tvl: "$120M", apy: "10–40%" }),
  n("concentrator", "Concentrator",  "yield", "ethereum", ["ethereum"],                                                                    80,  "https://concentrator.aladdin.club","Auto-compounding Convex/Curve positions into top yield strategies.", { tvl: "$80M" }),
  n("equilibria",   "Equilibria",    "yield", "ethereum", ["ethereum","arbitrum"],                                                         80,  "https://equilibria.fi",          "Pendle yield booster and liquidity marketplace.", { tvl: "$80M" }),
  n("stake-dao",    "Stake DAO",     "yield", "ethereum", ["ethereum"],                                                                   280,  "https://stakedao.org",           "Non-custodial yield strategies on Curve and Convex.", { tvl: "$280M" }),
  n("arrakis",      "Arrakis",       "yield", "ethereum", ["ethereum","arbitrum","polygon","optimism","base"],                             180,  "https://arrakis.finance",        "Automated Uniswap v3 LP management and rebalancing.", { tvl: "$180M" }),
  n("gamma",        "Gamma",         "yield", "ethereum", ["ethereum","arbitrum","polygon","optimism","bnb-chain","base"],                  48,  "https://gamma.xyz",              "Active LP management for concentrated liquidity pools.", { tvl: "$48M" }),
  n("tokemak",      "Tokemak",       "yield", "ethereum", ["ethereum"],                                                                    48,  "https://tokemak.xyz",            "Sustainable liquidity reactor for DeFi protocols.", { tvl: "$48M" }),
  n("badger",       "Badger DAO",    "yield", "ethereum", ["ethereum","arbitrum","polygon","bnb-chain"],                                    48,  "https://badger.com",             "Bitcoin-focused yield strategies in DeFi ecosystems.", { tvl: "$48M" }),
  n("sommelier",    "Sommelier",     "yield", "ethereum", ["ethereum","arbitrum"],                                                          48,  "https://sommelier.finance",      "Off-chain powered DeFi vaults for advanced LP strategies.", { tvl: "$48M" }),
  n("idle",         "Idle Finance",  "yield", "ethereum", ["ethereum","polygon"],                                                           80,  "https://idle.finance",           "Best-yield aggregator routing across multiple lending protocols.", { tvl: "$80M" }),
  n("brahma",       "Brahma",        "yield", "ethereum", ["ethereum","arbitrum","base"],                                                   40,  "https://brahma.fi",              "On-chain execution environment for automated DeFi strategies.", { tvl: "$40M", isHot: true }),
  n("notional",     "Notional",      "yield", "ethereum", ["ethereum","arbitrum"],                                                          48,  "https://notional.finance",       "Fixed-rate lending and borrowing for predictable DeFi yields.", { tvl: "$48M" }),
  n("ribbon",       "Ribbon",        "yield", "ethereum", ["ethereum","avalanche","solana"],                                                48,  "https://ribbon.finance",         "Structured products with automated options strategies.", { tvl: "$48M" }),

  // ── LIQUID STAKING ──────────────────────────────────────────────────────────
  n("lido",      "Lido",          "liquid-staking", "ethereum", ["ethereum","solana","polygon","cosmos"],                     28000, "https://lido.fi",             "Largest liquid staking protocol with $28B+ stETH in circulation.", { tvl: "$28B", apy: "3.8%", isHot: true }),
  n("eigenlayer","EigenLayer",    "liquid-staking", "ethereum", ["ethereum"],                                                 12800, "https://eigenlayer.xyz",      "Restaking protocol that extends Ethereum security to other networks.", { tvl: "$12.8B", isHot: true }),
  n("etherfi",   "Ether.fi",      "liquid-staking", "ethereum", ["ethereum"],                                                  5800, "https://ether.fi",            "Non-custodial liquid restaking with eETH and ETHFI governance.", { tvl: "$5.8B", isHot: true }),
  n("renzo",     "Renzo",         "liquid-staking", "ethereum", ["ethereum","bnb-chain","linea","blast"],                      2100, "https://renzoprotocol.com",   "Liquid restaking for EigenLayer using ezETH.", { tvl: "$2.1B", isHot: true }),
  n("puffer",    "Puffer Finance", "liquid-staking","ethereum", ["ethereum"],                                                  1400, "https://puffer.fi",           "Native liquid restaking with anti-slashing guarantees.", { tvl: "$1.4B" }),
  n("swell",     "Swell",         "liquid-staking", "ethereum", ["ethereum"],                                                  1800, "https://swellnetwork.io",     "Non-custodial liquid staking and restaking protocol.", { tvl: "$1.8B" }),
  n("kelp",      "Kelp DAO",      "liquid-staking", "ethereum", ["ethereum"],                                                  1200, "https://kelpdao.xyz",         "Liquid restaking for EigenLayer using rsETH.", { tvl: "$1.2B" }),
  n("rocket-pool","Rocket Pool",  "liquid-staking", "ethereum", ["ethereum"],                                                  2200, "https://rocketpool.net",      "Decentralized ETH staking network with rETH liquid token.", { tvl: "$2.2B", apy: "3.5%" }),
  n("frax-eth",  "Frax ETH",      "liquid-staking", "ethereum", ["ethereum"],                                                   480, "https://frax.finance",        "frxETH liquid staking with sfrxETH auto-compounding vaults.", { tvl: "$480M", apy: "4.2%" }),
  n("stader",    "Stader Labs",   "liquid-staking", "ethereum", ["ethereum","polygon","bnb-chain","avalanche","fantom","near"],  380, "https://staderlabs.com",      "Multi-chain liquid staking with ETHx, MaticX, and BNBx.", { tvl: "$380M" }),
  n("ankr",      "Ankr",          "liquid-staking", "ethereum", ["ethereum","bnb-chain","polygon","avalanche","fantom","gnosis"],280, "https://ankr.com",            "Multi-chain liquid staking and RPC infrastructure provider.", { tvl: "$280M" }),
  n("stakewise", "StakeWise",     "liquid-staking", "ethereum", ["ethereum","gnosis"],                                          380, "https://stakewise.io",        "Permissionless ETH staking vaults with osETH.", { tvl: "$380M" }),
  n("jito",      "Jito",          "liquid-staking", "solana",   ["solana"],                                                    2800, "https://jito.network",        "Solana liquid staking with MEV rewards shared with stakers.", { tvl: "$2.8B", apy: "7.5%", isHot: true }),
  n("marinade",  "Marinade",      "liquid-staking", "solana",   ["solana"],                                                    1100, "https://marinade.finance",    "Native and liquid staking for Solana with mSOL.", { tvl: "$1.1B", apy: "6.8%" }),
  n("sanctum",   "Sanctum",       "liquid-staking", "solana",   ["solana"],                                                     400, "https://sanctum.so",          "LST liquidity infrastructure and infinite LST marketplace on Solana.", { tvl: "$400M", isHot: true }),
  n("bedrock",   "Bedrock",       "liquid-staking", "ethereum", ["ethereum"],                                                   280, "https://bedrock.technology",  "Multi-asset liquid restaking protocol.", { tvl: "$280M" }),
  n("mantle-lsp","Mantle LSP",    "liquid-staking", "mantle",   ["mantle","ethereum"],                                          520, "https://mntl.io",             "Mantle's liquid staking protocol producing mETH.", { tvl: "$520M" }),
  n("ssv-network","SSV Network",  "liquid-staking", "ethereum", ["ethereum"],                                                   280, "https://ssv.network",         "Decentralized staking infrastructure using DVT technology.", { tvl: "$280M" }),

  // ── BRIDGE ──────────────────────────────────────────────────────────────────
  n("stargate",   "Stargate",        "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","mantle","linea"], 420, "https://stargate.finance",   "Omnichain liquidity transport protocol built on LayerZero.", { tvl: "$420M" }),
  n("across",     "Across",          "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","zksync","linea"],                         310, "https://across.to",          "Fastest, cheapest bridge powered by UMA's optimistic oracle.", { tvl: "$310M" }),
  n("layerzero",  "LayerZero",       "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","solana","aptos","sui"], 200, "https://layerzero.network","Omnichain interoperability protocol connecting 50+ chains.", { isHot: true }),
  n("wormhole",   "Wormhole",        "bridge", "ethereum", ["ethereum","solana","arbitrum","base","polygon","bnb-chain","avalanche","aptos","sui","near","cosmos"], 80, "https://wormhole.com","Generic cross-chain message passing and token bridging.", { tvl: "$80M" }),
  n("hop",        "Hop Protocol",    "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","gnosis"],                                  48, "https://hop.exchange",       "Fast L2-to-L2 token bridge using bonder-backed AMMs.", { tvl: "$48M" }),
  n("synapse",    "Synapse",         "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom"],           80, "https://synapseprotocol.com","Cross-chain bridge and messaging protocol.", { tvl: "$80M" }),
  n("connext",    "Connext",         "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","gnosis","linea"],               48, "https://connext.network",    "Trust-minimized cross-chain communication protocol.", { tvl: "$48M" }),
  n("celer",      "Celer",           "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom"],           80, "https://celer.network",      "Multi-chain bridging and inter-chain messaging network.", { tvl: "$80M" }),
  n("orbiter",    "Orbiter Finance", "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","zksync","starknet","linea","scroll","mantle","blast"], 40, "https://orbiter.finance","L2-native bridge with fast confirmation and minimal fees.", { tvl: "$40M", isHot: true }),
  n("debridge",   "deBridge",        "bridge", "ethereum", ["ethereum","arbitrum","base","polygon","bnb-chain","solana","avalanche"],                      40, "https://debridge.finance",   "Ultra-fast cross-chain swaps with DLN protocol.", { tvl: "$40M" }),
  n("mayan",      "Mayan Finance",   "bridge", "solana",   ["solana","ethereum","arbitrum","base","bnb-chain","avalanche","polygon"],                      20, "https://mayan.finance",      "Solana-based cross-chain swap and bridging protocol.", { tvl: "$20M", isHot: true }),
  n("symbiosis",  "Symbiosis",       "bridge", "ethereum", ["ethereum","arbitrum","base","polygon","bnb-chain","zksync","mantle","linea"],                 20, "https://symbiosis.finance",  "Cross-chain AMM supporting any-to-any asset swaps.", { tvl: "$20M" }),
  n("rhino",      "Rhino.fi",        "bridge", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","zksync","starknet","linea"],    40, "https://rhino.fi",           "Multi-chain bridge and DeFi portfolio tracker.", { tvl: "$40M" }),

  // ── STABLECOIN ───────────────────────────────────────────────────────────────
  n("usdt",      "Tether",     "stablecoin", "ethereum", ["ethereum","solana","bnb-chain","arbitrum","polygon","avalanche","ton","near"],              110000, "https://tether.to",             "World's largest stablecoin by market cap with $110B in circulation.", { tvl: "$110B" }),
  n("usdc",      "USDC",       "stablecoin", "ethereum", ["ethereum","solana","arbitrum","base","optimism","polygon","bnb-chain","avalanche","starknet","zksync","near","cosmos"], 43000, "https://circle.com", "Circle's regulated, fully-reserved USD stablecoin.", { tvl: "$43B", isHot: true }),
  n("dai",       "DAI",        "stablecoin", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","gnosis"],           5800,  "https://makerdao.com",          "MakerDAO's decentralized overcollateralized stablecoin.", { tvl: "$5.8B" }),
  n("ethena-usd","USDe",       "stablecoin", "ethereum", ["ethereum","arbitrum","bnb-chain","mantle","blast"],                                           3200,  "https://ethena.fi",             "Synthetic USD backed by delta-hedged ETH staking positions.", { tvl: "$3.2B", apy: "15–27%", isHot: true }),
  n("fdusd",     "FDUSD",      "stablecoin", "bnb-chain",["bnb-chain","ethereum"],                                                                       1200,  "https://firstdigitalabs.com",   "First Digital's USD stablecoin, dominant on Binance.", { tvl: "$1.2B" }),
  n("frax-usd",  "FRAX",       "stablecoin", "ethereum", ["ethereum","arbitrum","optimism","polygon","avalanche","bnb-chain"],                             780,  "https://frax.finance",          "Fractional-algorithmic stablecoin with hybrid collateral model.", { tvl: "$780M" }),
  n("crvusd",    "crvUSD",     "stablecoin", "ethereum", ["ethereum"],                                                                                    480,  "https://curve.fi",              "Curve's native stablecoin using the LLAMMA soft-liquidation algorithm.", { tvl: "$480M" }),
  n("gho",       "GHO",        "stablecoin", "ethereum", ["ethereum","arbitrum"],                                                                          280,  "https://aave.com",              "Aave's decentralized multi-collateral stablecoin.", { tvl: "$280M" }),
  n("lusd",      "LUSD",       "stablecoin", "ethereum", ["ethereum","arbitrum","optimism"],                                                               280,  "https://liquity.org",           "Immutable 0% interest borrowing backed by pure ETH collateral.", { tvl: "$280M" }),
  n("pyusd",     "PayPal USD", "stablecoin", "ethereum", ["ethereum","solana"],                                                                            280,  "https://paypal.com/pyusd",      "PayPal's regulated and audited USD stablecoin.", { tvl: "$280M" }),
  n("usdb",      "USDB",       "stablecoin", "blast",    ["blast"],                                                                                        480,  "https://blast.io",              "Blast's native rebasing stablecoin that auto-earns yield.", { tvl: "$480M" }),
  n("usdy",      "USDY",       "stablecoin", "ethereum", ["ethereum","solana","aptos","mantle"],                                                           280,  "https://ondo.finance",          "Ondo's yield-bearing stablecoin backed by US Treasuries.", { tvl: "$280M" }),
  n("eurc",      "EURC",       "stablecoin", "ethereum", ["ethereum","solana","base","stellar"],                                                            80,  "https://circle.com/eurc",       "Circle's Euro-pegged regulated stablecoin.", { tvl: "$80M" }),
  n("lusd2",     "BOLD",       "stablecoin", "ethereum", ["ethereum"],                                                                                      48,  "https://liquity.org",           "Liquity v2's collateral-backed stablecoin with user-set rates.", { tvl: "$48M", isHot: true }),
  n("susd",      "sUSD",       "stablecoin", "ethereum", ["ethereum","optimism"],                                                                           48,  "https://synthetix.io",          "Synthetix's debt-backed stablecoin for trading synthetic assets.", { tvl: "$48M" }),

  // ── DERIVATIVES ──────────────────────────────────────────────────────────────
  n("gmx",          "GMX",           "derivative", "arbitrum", ["arbitrum","avalanche"],             580, "https://gmx.io",              "Decentralized perpetual exchange with GLP pool liquidity.", { tvl: "$580M", apy: "10–20%" }),
  n("hyperliquid",  "Hyperliquid",   "derivative", "arbitrum", ["arbitrum"],                        1100, "https://hyperliquid.xyz",     "On-chain order book perp DEX running on its own L1 rollup.", { tvl: "$1.1B", isHot: true }),
  n("dydx",         "dYdX",          "derivative", "cosmos",   ["cosmos","ethereum"],                320, "https://dydx.exchange",       "Orderbook perpetuals DEX on its own Cosmos appchain.", { tvl: "$320M" }),
  n("synthetix",    "Synthetix",     "derivative", "optimism", ["optimism","ethereum","base"],        380, "https://synthetix.io",        "Synthetic asset issuance protocol for on-chain derivatives.", { tvl: "$380M" }),
  n("gains-network","Gains Network", "derivative", "arbitrum", ["arbitrum","polygon"],                80,  "https://gains.trade",         "Decentralized leveraged trading with gTrade and GNS.", { tvl: "$80M" }),
  n("vertex",       "Vertex",        "derivative", "arbitrum", ["arbitrum"],                         120, "https://vertexprotocol.com",  "Integrated spot, perps, and money market on Arbitrum.", { tvl: "$120M" }),
  n("drift",        "Drift Protocol","derivative", "solana",   ["solana"],                           320, "https://drift.trade",         "Solana's leading perp DEX with virtual AMM and orderbook.", { tvl: "$320M", isHot: true }),
  n("aevo",         "Aevo",          "derivative", "ethereum", ["ethereum"],                          48,  "https://aevo.xyz",            "On-chain options and perps exchange on a custom L2.", { tvl: "$48M" }),
  n("perp-protocol","Perp Protocol", "derivative", "optimism", ["optimism","arbitrum"],               48,  "https://perp.com",            "vAMM-based perpetual futures protocol.", { tvl: "$48M" }),
  n("kwenta",       "Kwenta",        "derivative", "optimism", ["optimism"],                          48,  "https://kwenta.io",           "Synthetix-powered perp trading interface.", { tvl: "$48M" }),
  n("level-finance","Level Finance", "derivative", "bnb-chain",["bnb-chain","arbitrum"],              48,  "https://level.finance",       "Multi-tier liquidity perp DEX on BNB Chain.", { tvl: "$48M" }),
  n("mux",          "MUX Protocol",  "derivative", "arbitrum", ["arbitrum","bnb-chain","optimism","avalanche","fantom"], 48, "https://mux.network", "Aggregated perp trading across multiple DEX protocols.", { tvl: "$48M" }),
  n("opyn",         "Opyn",          "derivative", "ethereum", ["ethereum","arbitrum"],               40,  "https://opyn.co",             "Power perpetuals and options for any ERC-20 asset.", { tvl: "$40M" }),
  n("premia",       "Premia",        "derivative", "arbitrum", ["arbitrum","ethereum","optimism","bnb-chain"], 40, "https://premia.finance", "Options AMM with physical settlement and liquidity mining.", { tvl: "$40M" }),
  n("hmx",          "HMX",           "derivative", "arbitrum", ["arbitrum"],                          48,  "https://hmxtrading.com",      "Multi-asset perp DEX with HLP liquidity pool on Arbitrum.", { tvl: "$48M" }),

  // ── NFT ──────────────────────────────────────────────────────────────────────
  n("opensea",    "OpenSea",       "nft", "ethereum", ["ethereum","polygon","solana","arbitrum","base","bnb-chain","avalanche","zksync","optimism"], 100, "https://opensea.io",       "World's largest NFT marketplace.", {} ),
  n("blur",       "Blur",          "nft", "ethereum", ["ethereum"],                                                                                    80,  "https://blur.io",          "Pro NFT marketplace with zero fees and airdrop-incentivized trading.", { isHot: true }),
  n("magic-eden", "Magic Eden",    "nft", "solana",   ["solana","ethereum","polygon","bitcoin"],                                                        60,  "https://magiceden.io",     "Leading multi-chain NFT marketplace across Solana and Ethereum.", { isHot: true }),
  n("tensor",     "Tensor",        "nft", "solana",   ["solana"],                                                                                      40,  "https://tensor.trade",     "Solana's pro-trader NFT AMM and marketplace.", { isHot: true }),
  n("looksrare",  "LooksRare",     "nft", "ethereum", ["ethereum"],                                                                                    30,  "https://looksrare.org",    "Community-first NFT marketplace with LOOKS token rewards.", {} ),
  n("x2y2",       "X2Y2",          "nft", "ethereum", ["ethereum"],                                                                                    20,  "https://x2y2.io",          "NFT marketplace with optional creator royalties.", {} ),
  n("foundation", "Foundation",    "nft", "ethereum", ["ethereum","base"],                                                                             15,  "https://foundation.app",   "Creator-focused NFT platform for curated digital art.", {} ),
  n("zora",       "Zora",          "nft", "ethereum", ["ethereum","base","optimism","zksync"],                                                         30,  "https://zora.co",          "Open NFT marketplace and onchain minting protocol.", { isHot: true }),
  n("manifold",   "Manifold",      "nft", "ethereum", ["ethereum","base","polygon"],                                                                   10,  "https://manifold.xyz",     "Creator tools for deploying custom NFT smart contracts.", {} ),
  n("sound-xyz",  "Sound.xyz",     "nft", "ethereum", ["ethereum","base"],                                                                              5,  "https://sound.xyz",        "Music NFT platform for artists and collectors.", {} ),
  n("superrare",  "SuperRare",     "nft", "ethereum", ["ethereum"],                                                                                    10,  "https://superrare.com",    "Curated single-edition digital art NFT marketplace.", {} ),
  n("sudoswap",   "Sudoswap",      "nft", "ethereum", ["ethereum"],                                                                                    20,  "https://sudoswap.xyz",     "AMM-based NFT trading protocol with concentrated liquidity.", {} ),

  // ── ORACLE / INFRASTRUCTURE ──────────────────────────────────────────────────
  n("chainlink",   "Chainlink",    "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom","gnosis","zksync","linea","scroll","starknet","solana"], 20000, "https://chain.link",      "Decentralized oracle network securing $75B+ in smart contracts.", { tvl: "$20B", isHot: true }),
  n("pyth",        "Pyth Network", "oracle", "solana",   ["solana","ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","cosmos","sui","aptos","near","starknet"],               400,   "https://pyth.network",    "Low-latency financial data oracle built for DeFi.", { isHot: true }),
  n("api3",        "API3",         "oracle", "ethereum", ["ethereum","arbitrum","base","polygon","bnb-chain","avalanche","gnosis"],                                                                     80,  "https://api3.org",        "First-party oracle data feeds using dAPI infrastructure.", {} ),
  n("uma",         "UMA",          "oracle", "ethereum", ["ethereum","optimism","polygon"],                                                                                                             48,  "https://umaproject.org",  "Optimistic oracle for DeFi, insurance, and KPI options.", {} ),
  n("the-graph",   "The Graph",    "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom","gnosis","near","cosmos"],                                200,  "https://thegraph.com",    "Indexing protocol for querying blockchain data — the DeFi Google.", {} ),
  n("gelato",      "Gelato",       "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","gnosis","zksync"],                                                 80,  "https://gelato.network",  "Web3 automation for smart contracts, gasless relayers, and more.", {} ),
  n("safe",        "Safe",         "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","gnosis","zksync","linea"],                                      100000, "https://safe.global",    "Multi-sig smart account securing $100B+ in digital assets.", { tvl: "$100B" }),
  n("ens",         "ENS",          "oracle", "ethereum", ["ethereum"],                                                                                                                                  80,  "https://ens.domains",     "Ethereum Name Service — decentralized domain naming protocol.", {} ),
  n("flashbots",   "Flashbots",    "oracle", "ethereum", ["ethereum","arbitrum","base","optimism"],                                                                                                     20,  "https://flashbots.net",   "MEV research org building MEV-Boost and ethical block building.", {} ),
  n("tenderly",    "Tenderly",     "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","fantom","gnosis"],                                                  10,  "https://tenderly.co",     "Web3 dev platform for building, testing, and monitoring contracts.", {} ),
  n("zerion",      "Zerion",       "oracle", "ethereum", ["ethereum","arbitrum","base","optimism","polygon","bnb-chain","avalanche","solana","cosmos"],                                                  10,  "https://zerion.io",       "Smart wallet and DeFi portfolio tracker across 20+ chains.", {} ),
  n("band",        "Band Protocol","oracle", "cosmos",   ["cosmos","ethereum","bnb-chain","polygon","avalanche"],                                                                                        40,  "https://bandprotocol.com","Cross-chain data oracle network built on Cosmos SDK.", {} ),

  // ── GAMING ──────────────────────────────────────────────────────────────────
  n("axie",        "Axie Infinity", "gaming", "ronin",    ["ronin","ethereum"],    80,  "https://axieinfinity.com",  "Pioneer play-to-earn game with NFT creatures and player-owned economy.", {} ),
  n("stepn",       "STEPN",         "gaming", "solana",   ["solana","bnb-chain","ethereum"], 40, "https://stepn.com", "Move-to-earn lifestyle app with NFT sneakers and GPS tracking.", {} ),
  n("illuvium",    "Illuvium",      "gaming", "ethereum", ["ethereum"],            20,  "https://illuvium.io",       "Open-world RPG and auto-battler built on Ethereum.", { isHot: true }),
  n("gods-unchained","Gods Unchained","gaming","ethereum",["ethereum"],            10,  "https://godsunchained.com", "Competitive trading card game with true NFT card ownership.", {} ),
  n("star-atlas",  "Star Atlas",    "gaming", "solana",   ["solana"],             10,  "https://staratlas.com",     "Space-themed MMO metaverse with player-owned economy on Solana.", {} ),
  n("pixels",      "Pixels",        "gaming", "ronin",    ["ronin","ethereum"],    20,  "https://pixels.xyz",        "Browser-based farming game on Ronin with NFT land ownership.", { isHot: true }),
  n("treasure-dao","Treasure",      "gaming", "arbitrum", ["arbitrum"],           30,  "https://treasure.lol",      "Decentralized gaming ecosystem and marketplace on Arbitrum.", { isHot: true }),
  n("beam",        "Beam",          "gaming", "ethereum", ["ethereum","avalanche"],20,  "https://onbeam.com",        "Gaming blockchain powered by Merit Circle DAO.", {} ),
  n("gala-games",  "Gala Games",    "gaming", "ethereum", ["ethereum","bnb-chain"],15,  "https://gala.games",        "Web3 gaming platform with player-owned nodes and assets.", {} ),
  n("immutable",   "Immutable",     "gaming", "ethereum", ["ethereum","polygon"],  30,  "https://immutable.com",     "Layer 2 purpose-built for NFT gaming with zero gas fees.", { isHot: true }),

  // ── SOCIAL ───────────────────────────────────────────────────────────────────
  n("lens",        "Lens Protocol", "social", "polygon",  ["polygon","base"],    20, "https://lens.xyz",          "Composable social graph protocol owned and controlled by users.", { isHot: true }),
  n("farcaster",   "Farcaster",     "social", "base",     ["base","ethereum","optimism"], 15, "https://farcaster.xyz","Decentralized social protocol with Warpcast as the main client.", { isHot: true }),
  n("galxe",       "Galxe",         "social", "bnb-chain",["bnb-chain","ethereum","polygon","optimism","arbitrum","base"], 20, "https://galxe.com", "Web3 credential and quest platform for on-chain identity.", {} ),
  n("layer3",      "Layer3",        "social", "ethereum", ["ethereum","arbitrum","base","optimism","polygon"], 10, "https://layer3.xyz", "Quest and reward platform for Web3 onboarding.", { isHot: true }),
  n("gitcoin",     "Gitcoin",       "social", "ethereum", ["ethereum","optimism","polygon","arbitrum","base"], 10, "https://gitcoin.co",  "Funding public goods in crypto via quadratic funding.", {} ),
  n("worldcoin",   "Worldcoin",     "social", "ethereum", ["ethereum","optimism","polygon"], 10, "https://worldcoin.org", "Global identity and financial network using iris-scanning orbs.", { isHot: true }),
  n("push",        "Push Protocol", "social", "ethereum", ["ethereum","polygon","bnb-chain","arbitrum","optimism","base"], 5, "https://push.org", "Decentralized notifications and messaging for Web3 apps.", {} ),
  n("polymarket",  "Polymarket",    "social", "polygon",  ["polygon","ethereum"], 80, "https://polymarket.com",    "World's largest prediction market built on Polygon.", { isHot: true }),

  // ── RWA ──────────────────────────────────────────────────────────────────────
  n("ondo",       "Ondo Finance", "rwa", "ethereum", ["ethereum","solana","aptos","mantle"],  280, "https://ondo.finance",      "Tokenized US Treasuries and institutional DeFi products.", { tvl: "$280M", isHot: true }),
  n("backed",     "Backed Finance","rwa","ethereum", ["ethereum","polygon"],                   80, "https://backed.fi",         "Tokenized stock and bond ETFs accessible on-chain.", { tvl: "$80M" }),
  n("matrixdock", "MatrixDock",   "rwa", "ethereum", ["ethereum"],                             80, "https://matrixdock.com",    "Digital securities platform for tokenized T-bills (STBT).", { tvl: "$80M" }),
  n("parcl",      "Parcl",        "rwa", "solana",   ["solana"],                               20, "https://parcl.com",         "Decentralized real estate price exposure on Solana.", { tvl: "$20M", isHot: true }),
  n("realtoken",  "RealToken",    "rwa", "ethereum", ["ethereum","gnosis"],                    40, "https://realt.co",          "Tokenized US real estate with rental income distributed daily.", { tvl: "$40M" }),
  n("tangible",   "Tangible",     "rwa", "polygon",  ["polygon","ethereum"],                   80, "https://tangible.store",    "Real-world assets: luxury goods and real estate on-chain.", { tvl: "$80M" }),
  n("swarm",      "Swarm Markets","rwa", "polygon",  ["polygon","ethereum"],                   40, "https://swarm.com",         "Regulated DeFi platform for tokenized stocks and bonds.", { tvl: "$40M" }),
  n("flux",       "Flux Finance", "rwa", "ethereum", ["ethereum"],                             80, "https://fluxfinance.com",   "Lending protocol for tokenized Treasury bills by Ondo.", { tvl: "$80M" }),

  // ── LAUNCHPAD ─────────────────────────────────────────────────────────────────
  n("dao-maker",   "DAO Maker",    "launchpad", "ethereum", ["ethereum","bnb-chain","polygon"], 20, "https://daomaker.com",     "Venture capital and IDO launchpad for blockchain projects.", {} ),
  n("polkastarter","Polkastarter", "launchpad", "ethereum", ["ethereum","polygon","bnb-chain","avalanche"], 10, "https://polkastarter.com","Cross-chain IDO launchpad for early-stage Web3 projects.", {} ),
  n("seedify",     "Seedify",      "launchpad", "bnb-chain",["bnb-chain","ethereum"],           10, "https://seedify.fund",     "Blockchain gaming and metaverse project launchpad.", {} ),
  n("bounce",      "Bounce",       "launchpad", "bnb-chain",["bnb-chain","ethereum","arbitrum"],10, "https://bounce.finance",   "Decentralized auction and token launch platform.", {} ),
  n("pinksale",    "PinkSale",     "launchpad", "bnb-chain",["bnb-chain","ethereum","polygon","solana","arbitrum"], 5, "https://pinksale.finance","Token launch platform with fairlaunch and presale pools.", {} ),
];

// Auto-generate edges: chain→protocol (via primaryChain) + curated integrations
export function generateEdges(nodes: EcosystemNode[]): EcosystemEdge[] {
  const edges: EcosystemEdge[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const chainIds = new Set(nodes.filter((n) => n.category === "chain").map((n) => n.id));

  // Chain → protocol edges (primary chain only, to avoid clutter)
  nodes.filter((n) => n.category !== "chain").forEach((node) => {
    if (chainIds.has(node.primaryChain)) {
      edges.push({ source: node.primaryChain, target: node.id });
    }
  });

  // Curated protocol-to-protocol integrations
  const integrations: [string, string][] = [
    ["aave", "morpho"], ["aave", "gho"], ["aave", "spark"],
    ["curve", "yearn"], ["curve", "convex"], ["curve", "crvusd"],
    ["curve", "stake-dao"], ["convex", "aura"],
    ["pendle", "ethena-usd"], ["pendle", "eigenlayer"], ["pendle", "etherfi"], ["pendle", "puffer"],
    ["lido", "eigenlayer"], ["lido", "curve"], ["lido", "pendle"],
    ["eigenlayer", "etherfi"], ["eigenlayer", "renzo"], ["eigenlayer", "puffer"],
    ["eigenlayer", "swell"], ["eigenlayer", "kelp"],
    ["usdc", "aave"], ["usdc", "compound"], ["usdc", "curve"],
    ["dai", "aave"], ["dai", "spark"], ["dai", "curve"],
    ["ethena-usd", "aave"], ["ethena-usd", "curve"],
    ["synthetix", "kwenta"], ["synthetix", "perp-protocol"], ["synthetix", "susd"],
    ["layerzero", "stargate"], ["layerzero", "radiant"],
    ["yearn", "aave"], ["yearn", "compound"],
    ["beefy", "aave"],
    ["gmx", "gains-network"],
    ["chainlink", "aave"], ["chainlink", "compound"], ["chainlink", "synthetix"],
    ["pyth", "drift"], ["pyth", "kamino"],
    ["lens", "farcaster"],
    ["ondo", "usdy"], ["ondo", "flux"],
    ["centrifuge", "aave"],
    ["uniswap", "arrakis"],
  ];

  integrations.forEach(([a, b]) => {
    if (nodeIds.has(a) && nodeIds.has(b)) {
      edges.push({ source: a, target: b });
    }
  });

  return edges;
}

export const EDGES = generateEdges(NODES);
