export interface Narrative {
  id: string;
  label: string;
  color: string;
  heat: "EXPLODING" | "HOT" | "RISING" | "BUILDING" | "WATCH";
  heatLevel: number; // 1–5
  tokens: string[];
  summary: string;
  connected: string[];
  domain?: "crypto" | "ai" | "both";
  cryptoImpact?: string[]; // token symbols affected
  impactSummary?: string;
}

export type SignalType = "whale" | "onchain" | "news" | "social" | "yield" | "tvl";

export interface Signal {
  id: string;
  narrativeId: string;
  narrativeLabel: string;
  narrativeColor: string;
  heat: Narrative["heat"];
  type: SignalType;
  headline: string;
  body: string;
  sigs: [string, string][]; // [emoji, label]
  tokens: string[];
  timestamp: number; // ms
  source?: string;
  url?: string;
  domain?: "crypto" | "ai" | "both";
  cryptoImpact?: string;
}

// ─── Narrative Clusters ──────────────────────────────────────────────────────

export const NARRATIVES: Narrative[] = [
  {
    id: "ai",
    label: "AI × CRYPTO",
    color: "#9F7AFA",
    heat: "EXPLODING",
    heatLevel: 5,
    tokens: ["TAO", "RNDR", "FET", "NEAR", "AGIX"],
    summary: "The hottest narrative in the market. AI tokens outperformed the rest of crypto by 16% in Q1 2026. Bittensor subnet revenue hit all-time highs — moving from token emissions to real fee-for-service. NVIDIA Blackwell B200 integrated into Render Network.",
    connected: ["rwa", "depin", "l1"],
  },
  {
    id: "rwa",
    label: "RWA TOKENIZATION",
    color: "#F5A623",
    heat: "HOT",
    heatLevel: 4,
    tokens: ["ONDO", "LINK", "MKR", "CFG", "MPL"],
    summary: "Real-world asset tokenization is exploding. BlackRock BUIDL crossed $2.5B AUM. Chainlink secured $3B in new institutional RWA contracts. ONDO TVL up 220% in 30 days.",
    connected: ["banking", "l1", "ai"],
  },
  {
    id: "defi",
    label: "PERP DEX",
    color: "#00DCC8",
    heat: "HOT",
    heatLevel: 4,
    tokens: ["HYPE", "JUP", "GMX", "DRIFT", "SNX"],
    summary: "Perpetual DEX volume up 800% in two years. Hyperliquid's 97% revenue buyback model executed $12M in HYPE purchases. Three ETF filings confirmed. The on-chain derivatives market is real.",
    connected: ["l1", "macro"],
  },
  {
    id: "l1",
    label: "LAYER 1",
    color: "#4A9EFF",
    heat: "RISING",
    heatLevel: 3,
    tokens: ["SOL", "ETH", "AVAX", "SUI", "APT"],
    summary: "Solana Alpenglow upgrade confirmed — 100ms block finality. ETH Fusaka hard fork in final testnet phase. Base and Arbitrum TVL at new records as the L2 flywheel accelerates.",
    connected: ["defi", "rwa", "ai", "depin"],
  },
  {
    id: "depin",
    label: "DePIN",
    color: "#27C96A",
    heat: "RISING",
    heatLevel: 3,
    tokens: ["RNDR", "HNT", "IO", "HONEY", "DIMO"],
    summary: "Decentralized physical infrastructure getting a second act via AI compute demand. io.net confirmed first enterprise-tier GPU contract. Render onboarded NVIDIA latest architecture.",
    connected: ["ai", "l1"],
  },
  {
    id: "banking",
    label: "INST. BANKING",
    color: "#FF6B9D",
    heat: "BUILDING",
    heatLevel: 3,
    tokens: ["XRP", "XLM", "HBAR", "ALGO", "RLUSD"],
    summary: "Ripple Treasury achieved SWIFT Certified Partner status. Bank of England confirmed Chainlink for on-chain securities settlement. XRP processed over $100B in transaction volume.",
    connected: ["rwa", "macro"],
  },
  {
    id: "macro",
    label: "MACRO",
    color: "#FF3D57",
    heat: "WATCH",
    heatLevel: 2,
    tokens: ["BTC", "ETH", "USDT", "USDC"],
    summary: "BTC dominance locked at 58.5% — Bitcoin Season confirmed. Altcoin Season Index: 34/100. Fear & Greed: 22 (Extreme Fear). Smart money in accumulation phase for quality narratives.",
    connected: ["defi", "banking"],
  },
  {
    id: "foundation_models",
    label: "FOUNDATION MODELS",
    color: "#E879F9",
    domain: "ai",
    heat: "EXPLODING",
    heatLevel: 5,
    tokens: ["OpenAI", "Anthropic", "DeepMind", "Meta AI", "Mistral"],
    summary: "The foundation model race is the defining tech battle of 2026. Claude Sonnet 4.6 leads SWE-bench at 80.8%. GPT-5.1 at 78.3%. Gemini 3 Deep Think at 84.6% ARC-AGI-2. Anthropic raised $3.5B at $61B valuation. Whoever wins inference efficiency wins the next decade of software.",
    connected: ["ai", "depin", "l1"],
    cryptoImpact: ["TAO", "RNDR", "FET"],
    impactSummary: "Foundation model breakthroughs flow into TAO (training infrastructure), RNDR (GPU demand), and FET (agent frameworks) within days.",
  },
  {
    id: "ai_infra",
    label: "AI INFRASTRUCTURE",
    color: "#F472B6",
    domain: "ai",
    heat: "HOT",
    heatLevel: 4,
    tokens: ["NVIDIA", "AWS", "Azure", "Groq", "Cerebras"],
    summary: "GPU supply chains and inference chips are the picks-and-shovels of the AI era. Groq LPU hits 1,000 tokens/second — 10x faster at same cost. DeepSeek R2 matches frontier models at 5% training cost. DePIN is the crypto answer to centralized AI compute.",
    connected: ["foundation_models", "depin", "ai_agents"],
    cryptoImpact: ["RNDR", "IO", "HNT"],
    impactSummary: "AI infrastructure demand drives decentralized compute — RNDR, io.net, and Helium DePIN nodes all benefit from AI compute overflow.",
  },
  {
    id: "ai_agents",
    label: "AGENT ECONOMY",
    color: "#A78BFA",
    domain: "both",
    heat: "HOT",
    heatLevel: 4,
    tokens: ["FET", "NEAR", "OLAS", "ICP"],
    summary: "AI agents with crypto wallets are beginning to transact autonomously. Polystrat executed 4,200 Polymarket trades in 30 days. Visa Trusted Agent Protocol, PayPal-OpenAI ACP, and Google AP2 standard are all building machine-to-machine payment rails. Crypto is the native payment layer.",
    connected: ["foundation_models", "ai", "defi"],
    cryptoImpact: ["FET", "NEAR", "ICP", "OLAS"],
    impactSummary: "The agent economy directly benefits FET (agent frameworks), NEAR (agent identity), and ICP (on-chain AI hosting). Most direct crypto/AI intersection.",
  },
  {
    id: "creative_ai",
    label: "CREATIVE AI",
    color: "#FB923C",
    domain: "ai",
    heat: "RISING",
    heatLevel: 3,
    tokens: ["Midjourney", "Suno", "ElevenLabs", "Kling AI"],
    summary: "Video AI replaced image AI as the dominant creative category. Google Veo 3 outputs indistinguishable from professional video. Midjourney dropped to 43rd in a16z rankings as image AI is commoditized. Audio remains defensible — Suno and ElevenLabs maintain strong positions.",
    connected: ["ai_infra", "depin"],
    cryptoImpact: ["RNDR", "AGIX"],
    impactSummary: "Video AI GPU demand is 10x image AI. Render Network positioned as the decentralized GPU layer for creative AI workloads.",
  },
];

export const NARRATIVE_MAP: Record<string, Narrative> = Object.fromEntries(
  NARRATIVES.map((n) => [n.id, n])
);

export const HEAT_COLORS: Record<Narrative["heat"], string> = {
  EXPLODING: "#FF3D57",
  HOT:       "#F5A623",
  RISING:    "#27C96A",
  BUILDING:  "#4A9EFF",
  WATCH:     "#9F7AFA",
};

// ─── Seed Signals (shown on initial load) ───────────────────────────────────

const NOW = Date.now();

export const SEED_SIGNALS: Signal[] = [
  {
    id: "s1",
    narrativeId: "ai", narrativeLabel: "AI × CRYPTO", narrativeColor: "#9F7AFA", heat: "EXPLODING",
    type: "whale",
    headline: "Bittensor Subnet 64 reports $22K daily revenue — first sustained on-chain AI earnings in history",
    body: "Chutes subnet moves from token emissions to real fee-for-service. 120 active subnets. Manifold Labs and Intel co-authored a whitepaper on decentralized compute. The network is proving AI training can be decentralized at scale.",
    sigs: [["🐋", "Whale accum +$14M"], ["📈", "Vol +340%"], ["⚡", "Social +280%"]],
    tokens: ["TAO", "RNDR"],
    timestamp: NOW - 2 * 60_000,
  },
  {
    id: "s2",
    narrativeId: "rwa", narrativeLabel: "RWA TOKENIZATION", narrativeColor: "#F5A623", heat: "HOT",
    type: "news",
    headline: "Chainlink secures $3B in new institutional RWA contracts — Bank of England integration confirmed",
    body: "Three major institutions signed multi-year Chainlink oracle agreements. BoE integration is the first G7 central bank to use a decentralized oracle in production. The infrastructure layer for $16T in projected RWA value is being locked in now.",
    sigs: [["🏦", "BoE production"], ["⛓", "$3B contracts"], ["📰", "Confirmed"]],
    tokens: ["LINK", "ONDO"],
    timestamp: NOW - 8 * 60_000,
  },
  {
    id: "s3",
    narrativeId: "defi", narrativeLabel: "PERP DEX", narrativeColor: "#00DCC8", heat: "HOT",
    type: "onchain",
    headline: "HYPE buyback mechanism executes $12M purchase in 24hrs as oil perp volume hits $5B",
    body: "The 97% revenue-to-buyback model converted unprecedented trading volume into token scarcity. Hyperliquid's HIP-3 upgrade enabled real-world asset perpetuals — crude oil, silver, gold. Three ETF filing confirmations in the same 48-hour window.",
    sigs: [["🔥", "$5B oil perp vol"], ["💰", "$12M buyback"], ["📋", "ETF filings ×3"]],
    tokens: ["HYPE", "JUP"],
    timestamp: NOW - 15 * 60_000,
  },
  {
    id: "s4",
    narrativeId: "l1", narrativeLabel: "LAYER 1", narrativeColor: "#4A9EFF", heat: "RISING",
    type: "news",
    headline: "Solana Alpenglow mainnet window confirmed — 100ms block finality changes the L1 game",
    body: "Anza team published final specs. Votor finalizes blocks in 100-150ms. Rotor replaces Turbine for more efficient data relay. Solana's DEX volume already up 340% in anticipation. If Alpenglow delivers, Solana becomes the fastest production blockchain by an order of magnitude.",
    sigs: [["⚡", "100ms finality"], ["📈", "DEX vol +340%"], ["🔧", "Upgrade confirmed"]],
    tokens: ["SOL", "JUP", "DRIFT"],
    timestamp: NOW - 22 * 60_000,
  },
  {
    id: "s5",
    narrativeId: "ai", narrativeLabel: "AI × CRYPTO", narrativeColor: "#9F7AFA", heat: "EXPLODING",
    type: "whale",
    headline: "Render Network onboards NVIDIA Blackwell B200 architecture — enterprise AI compute now on-chain",
    body: "NVIDIA's latest generation architecture integrated into Render's GPU marketplace. Enterprise cloud buyers can access B200 compute through Render at 40% lower cost than AWS. AI inference demand driving network utilization to all-time highs.",
    sigs: [["🤝", "NVIDIA B200"], ["📊", "Util. ATH"], ["💰", "Rev +180%"]],
    tokens: ["RNDR", "FET"],
    timestamp: NOW - 35 * 60_000,
  },
  {
    id: "s6",
    narrativeId: "banking", narrativeLabel: "INST. BANKING", narrativeColor: "#FF6B9D", heat: "BUILDING",
    type: "news",
    headline: "Ripple Treasury achieves SWIFT Certified Partner status — banks manage fiat and XRP in one system",
    body: "Integration connects to SWIFT's Alliance Lite2 for direct bank connectivity. First product allowing institutions to manage traditional treasury workflows alongside crypto settlement simultaneously. Targets the $150T annual cross-border payment market.",
    sigs: [["🏦", "SWIFT partner"], ["💱", "$150T TAM"], ["📋", "Production live"]],
    tokens: ["XRP", "HBAR", "XLM"],
    timestamp: NOW - 48 * 60_000,
  },
  {
    id: "s7",
    narrativeId: "depin", narrativeLabel: "DePIN", narrativeColor: "#27C96A", heat: "RISING",
    type: "onchain",
    headline: "io.net confirms first enterprise GPU contract — 40,000+ devices aggregated for major cloud provider",
    body: "io.net confirmed its first enterprise-tier deal, aggregating distributed GPU clusters to serve burst compute demand for an unnamed major cloud provider. Marks the transition from retail GPU mining to institutional revenue.",
    sigs: [["🏢", "Enterprise deal"], ["⛓", "40K+ GPUs"], ["💰", "Institutional rev"]],
    tokens: ["IO", "RNDR"],
    timestamp: NOW - 65 * 60_000,
  },
  {
    id: "s8",
    narrativeId: "macro", narrativeLabel: "MACRO SIGNAL", narrativeColor: "#FF3D57", heat: "WATCH",
    type: "social",
    headline: "BTC dominance locks at 58.5% — Bitcoin Season confirmed, altcoins bleeding against BTC",
    body: "On-chain data confirms capital concentration in BTC as Altcoin Season Index drops to 34/100. Historically, peak BTC dominance coincides with best altcoin accumulation zones. Smart money accumulating AI and RWA tokens quietly while retail sentiment sits at extreme fear.",
    sigs: [["📊", "Dom. 58.5%"], ["😨", "F&G: 22"], ["🐋", "Smart $ accum"]],
    tokens: ["BTC", "ETH"],
    timestamp: NOW - 90 * 60_000,
  },
  // AI Industry Signals
  {
    id: "ai1",
    narrativeId: "foundation_models", narrativeLabel: "FOUNDATION MODELS", narrativeColor: "#E879F9",
    heat: "EXPLODING",
    domain: "ai",
    type: "news",
    headline: "Claude Sonnet 4.6 leads SWE-bench at 80.8% — Anthropic widens coding lead over GPT-5.1",
    body: "Anthropic's latest model scores 80.8% on the software engineering benchmark, the highest ever recorded. GPT-5.1 sits at 78.3%. The gap matters: enterprises choosing their default AI coding tool are increasingly picking Claude. Cursor and Claude Code both default to Sonnet 4.6.",
    sigs: [["🏆", "SWE-bench 80.8%"], ["📊", "vs GPT 78.3%"], ["💼", "Enterprise adoption"]] as [string, string][],
    tokens: ["TAO", "RNDR"],
    timestamp: NOW - 15 * 60_000,
    source: "Anthropic",
    cryptoImpact: "Claude dominance drives demand for decentralized AI alternatives TAO and RNDR as enterprise diversification play.",
  },
  {
    id: "ai2",
    narrativeId: "ai_agents", narrativeLabel: "AGENT ECONOMY", narrativeColor: "#A78BFA",
    heat: "HOT",
    domain: "both",
    type: "news",
    headline: "Polystrat AI agent executes 4,200 Polymarket trades in 30 days — achieves 376% return on best trades",
    body: "Valory's Polystrat autonomous agent is trading prediction markets 24/7 on behalf of users who self-custody and own the agent. The agent uses on-chain wallets and executes without human intervention. This is the first real proof of the 'agent economy' thesis playing out in production.",
    sigs: [["🤖", "4,200 auto-trades"], ["💰", "376% best trade"], ["⛓", "On-chain self-custody"]] as [string, string][],
    tokens: ["FET", "NEAR", "OLAS"],
    timestamp: NOW - 28 * 60_000,
    source: "Valory",
    cryptoImpact: "Autonomous on-chain agents directly validate FET, NEAR, and OLAS token theses.",
  },
  {
    id: "ai3",
    narrativeId: "ai_infra", narrativeLabel: "AI INFRASTRUCTURE", narrativeColor: "#F472B6",
    heat: "HOT",
    domain: "ai",
    type: "news",
    headline: "Groq inference hits 1,000 tokens/second — 10x faster than GPU clusters at same cost",
    body: "Groq's LPU architecture delivers dramatically faster inference than GPU-based systems. Enterprise buyers are rerouting AI workloads for latency-sensitive applications. This creates new dynamics for decentralized compute networks — efficiency breakthroughs expand total AI usage.",
    sigs: [["⚡", "1,000 tok/sec"], ["💰", "Enterprise switching"], ["🖥", "GPU disruption"]] as [string, string][],
    tokens: ["RNDR", "IO"],
    timestamp: NOW - 45 * 60_000,
    source: "Groq",
    cryptoImpact: "LPU disruption increases urgency of diversified compute networks long-term.",
  },
  {
    id: "ai4",
    narrativeId: "creative_ai", narrativeLabel: "CREATIVE AI", narrativeColor: "#FB923C",
    heat: "RISING",
    domain: "ai",
    type: "news",
    headline: "Google Veo 3 produces photorealistic video from text — Midjourney drops to 43rd in usage rankings",
    body: "Video generation has replaced image generation as the defining creative AI capability. Veo 3 outputs indistinguishable from professional video in controlled tests. Midjourney's standalone ranking dropped as image AI is commoditized by integrated ChatGPT and Gemini.",
    sigs: [["🎬", "Video AI dominant"], ["📊", "Midjourney rank: 43rd"], ["🤖", "Commoditization wave"]] as [string, string][],
    tokens: ["RNDR", "AGIX"],
    timestamp: NOW - 62 * 60_000,
    source: "Google",
    cryptoImpact: "Video AI GPU demand is 10x image AI. Render Network positioned as decentralized GPU layer for creative AI.",
  },
];

// Injected live signals (simulated rotation when no Whale Alert key)
export const LIVE_SIGNAL_POOL: Signal[] = [
  {
    id: "l1",
    narrativeId: "ai", narrativeLabel: "AI × CRYPTO", narrativeColor: "#9F7AFA", heat: "EXPLODING",
    type: "whale",
    headline: "🐋 WHALE — 2.4M TAO moved off Binance to cold storage in the last 30 minutes",
    body: "Single wallet withdrew 2.4M TAO to cold storage. Exchange outflows of this magnitude historically precede significant price moves. This wallet first acquired TAO at $180 (current: $420+). Strong accumulation signal from a verified long-term holder.",
    sigs: [["🐋", "2.4M TAO off-ex"], ["📊", "Cost basis $180"], ["⛓", "Cold storage"]],
    tokens: ["TAO"],
    timestamp: 0,
  },
  {
    id: "l2",
    narrativeId: "rwa", narrativeLabel: "RWA TOKENIZATION", narrativeColor: "#F5A623", heat: "HOT",
    type: "news",
    headline: "BlackRock BUIDL crosses $2.5B AUM — fastest-growing tokenized fund in financial history",
    body: "BUIDL now the dominant institutional on-chain money market product. ONDO Finance TVL up 220% in 30 days as secondary infrastructure benefits from the flagship adoption.",
    sigs: [["📈", "$2.5B AUM"], ["⚡", "30-day record"], ["💰", "ONDO TVL +220%"]],
    tokens: ["ONDO", "LINK"],
    timestamp: 0,
  },
  {
    id: "l3",
    narrativeId: "defi", narrativeLabel: "PERP DEX", narrativeColor: "#00DCC8", heat: "HOT",
    type: "onchain",
    headline: "⛓ ON-CHAIN — JUP open interest surges 180% in 6 hours, funding rate turning positive",
    body: "Jupiter perpetuals seeing unusual OI growth with funding rates turning positive — indicating strong long positioning ahead of Solana Alpenglow. JLP pool earning record fees.",
    sigs: [["⛓", "OI +180%"], ["💰", "Funding +ve"], ["🌊", "SOL DEX flow"]],
    tokens: ["JUP", "SOL"],
    timestamp: 0,
  },
  {
    id: "l4",
    narrativeId: "ai", narrativeLabel: "AI × CRYPTO", narrativeColor: "#9F7AFA", heat: "EXPLODING",
    type: "whale",
    headline: "🐋 WHALE — $8.5M in RNDR purchased across 3 wallets in 48 hours at current levels",
    body: "Three separate wallets, no visible connection, accumulated RNDR at current prices. On-chain analysis suggests these may be related to NVIDIA ecosystem participants. Pattern consistent with informed buying ahead of partnership announcements.",
    sigs: [["🐋", "$8.5M RNDR buy"], ["📊", "3 wallets"], ["🔍", "NVIDIA adjacent?"]],
    tokens: ["RNDR", "TAO"],
    timestamp: 0,
  },
  {
    id: "l5",
    narrativeId: "macro", narrativeLabel: "MACRO SIGNAL", narrativeColor: "#FF3D57", heat: "WATCH",
    type: "social",
    headline: "📡 SOCIAL — XRP mentions up 340% in 4 hours on X and Telegram as banking rumor circulates",
    body: "Retail sentiment spiking on XRP following unconfirmed banking partnership reports in Southeast Asia. Social velocity at this magnitude during extreme fear historically precedes short-term momentum. Exercise caution — no official confirmation yet.",
    sigs: [["📡", "Social +340%"], ["⏰", "4hr window"], ["⚠️", "Unconfirmed"]],
    tokens: ["XRP"],
    timestamp: 0,
  },
  {
    id: "l6",
    narrativeId: "banking", narrativeLabel: "INST. BANKING", narrativeColor: "#FF6B9D", heat: "BUILDING",
    type: "news",
    headline: "SBI Holdings launches RLUSD stablecoin in Japan — first regulated stablecoin on XRPL",
    body: "SBI Remit, Japan's largest remittance provider, goes live with RLUSD for cross-border settlement. First regulated stablecoin launch on XRPL by a publicly traded financial institution. Targets $500B+ annual remittance volume.",
    sigs: [["🇯🇵", "Japan live"], ["💱", "XRPL stablecoin"], ["🏦", "SBI regulated"]],
    tokens: ["XRP", "RLUSD"],
    timestamp: 0,
  },
  {
    id: "l7",
    narrativeId: "depin", narrativeLabel: "DePIN", narrativeColor: "#27C96A", heat: "RISING",
    type: "onchain",
    headline: "Helium Mobile crosses 100K subscribers — first crypto network to reach consumer telecom scale",
    body: "HNT staking rewards increase 28% as subscriber growth demands more validator nodes. T-Mobile partnership confirmed for national roaming coverage. Consumer adoption curve entering hockey-stick phase.",
    sigs: [["📱", "100K subs"], ["⛓", "HNT staking +28%"], ["🤝", "T-Mobile deal"]],
    tokens: ["HNT", "MOBILE"],
    timestamp: 0,
  },
  {
    id: "l8",
    narrativeId: "l1", narrativeLabel: "LAYER 1", narrativeColor: "#4A9EFF", heat: "RISING",
    type: "tvl",
    headline: "Base TVL crosses $12B for the first time — Coinbase L2 now 5th largest chain by total value locked",
    body: "Aerodrome, Morpho, and Aave together account for 68% of Base TVL. Coinbase's monthly active onchain users hit 3M, driven by cbBTC and USDC yields. Institutional interest accelerating as Base becomes the compliance-friendly onramp.",
    sigs: [["📈", "$12B TVL"], ["🏦", "Coinbase traffic"], ["⚡", "3M active users"]],
    tokens: ["ETH", "USDC"],
    timestamp: 0,
  },
  {
    id: "pool-ai1",
    narrativeId: "foundation_models", narrativeLabel: "FOUNDATION MODELS", narrativeColor: "#E879F9",
    heat: "HOT", domain: "ai",
    type: "news",
    headline: "Anthropic raises $3.5B at $61B valuation — AI funding exceeds entire DeFi TVL",
    body: "The AI arms race funding continues. Anthropic's $61B valuation reflects AI hyperscaler premium. Google and Amazon lead the round. These companies compete for the same GPU resources and talent as AI crypto narrative tokens — validating decentralized AI as the hedge.",
    sigs: [["💰", "$3.5B raised"], ["🏢", "$61B valuation"], ["⚡", "Compute competition"]] as [string, string][],
    tokens: ["TAO", "FET", "RNDR"],
    timestamp: 0,
    source: "Anthropic",
    cryptoImpact: "Centralized AI hyperscaling validates the decentralized AI thesis.",
  },
  {
    id: "pool-ai2",
    narrativeId: "ai_agents", narrativeLabel: "AGENT ECONOMY", narrativeColor: "#A78BFA",
    heat: "HOT", domain: "both",
    type: "news",
    headline: "Visa Trusted Agent Protocol launches — AI agents can transact on your behalf with merchant verification",
    body: "Visa's cryptographic standard allows merchants to verify and accept AI agent-initiated payments. PayPal-OpenAI ACP follows within days. The machine-to-machine payment economy is real infrastructure now. Crypto is the native settlement layer for agent micropayments.",
    sigs: [["🏦", "Visa + PayPal + Google"], ["💳", "Agent payments live"], ["⛓", "Crypto settlement layer"]] as [string, string][],
    tokens: ["FET", "NEAR", "XRP"],
    timestamp: 0,
    source: "Visa",
    cryptoImpact: "Agent payment infrastructure directly validates FET and NEAR agent economy thesis.",
  },
  {
    id: "pool-ai3",
    narrativeId: "foundation_models", narrativeLabel: "FOUNDATION MODELS", narrativeColor: "#E879F9",
    heat: "EXPLODING", domain: "ai",
    type: "news",
    headline: "DeepSeek R2 matches frontier models at 5% of training cost — open source release",
    body: "DeepSeek's efficiency breakthrough is the most disruptive AI event since ChatGPT. Training costs 95% lower than comparable models. Open source release means every developer has access. GPU demand implications are significant — efficiency gains long-term bullish as lower costs expand total AI usage.",
    sigs: [["🧠", "Frontier quality"], ["💰", "5% of cost"], ["📖", "Open source"]] as [string, string][],
    tokens: ["RNDR", "TAO", "IO"],
    timestamp: 0,
    source: "DeepSeek",
    cryptoImpact: "Efficiency breakthrough short-term negative for GPU demand, long-term bullish as AI democratizes.",
  },
  {
    id: "pool-ai4",
    narrativeId: "foundation_models", narrativeLabel: "FOUNDATION MODELS", narrativeColor: "#E879F9",
    heat: "HOT", domain: "ai",
    type: "news",
    headline: "GPT-5.1 launches with unified fast/slow thinking — auto-switches based on query complexity",
    body: "OpenAI's unified architecture automatically switches between Instant and Thinking modes. Users no longer choose which model — the system decides. Claude maintains its lead in coding (SWE-bench 80.8% vs 78.3%). 900M weekly active users shows consumer AI demand is compounding.",
    sigs: [["🚀", "Unified architecture"], ["📊", "SWE 78.3%"], ["👥", "900M users"]] as [string, string][],
    tokens: ["TAO", "RNDR"],
    timestamp: 0,
    source: "OpenAI",
    cryptoImpact: "OpenAI capacity constraints create demand for decentralized compute alternatives.",
  },
  {
    id: "pool-ai5",
    narrativeId: "ai_infra", narrativeLabel: "AI INFRASTRUCTURE", narrativeColor: "#F472B6",
    heat: "RISING", domain: "both",
    type: "news",
    headline: "Bittensor subnet revenue hits ATH — decentralized AI models earn $4.2M in 30 days",
    body: "Bittensor's incentive mechanism is working — subnets are now profitable independent businesses. The top 5 subnets (text generation, translation, code review, image synthesis, search) collectively process 2.4M daily requests. TAO emissions are flowing to subnets generating real utility.",
    sigs: [["💰", "$4.2M/month"], ["📈", "ATH revenue"], ["⚡", "2.4M daily requests"]] as [string, string][],
    tokens: ["TAO"],
    timestamp: 0,
    source: "Bittensor",
    cryptoImpact: "TAO subnet revenue validates the token utility model — not just speculation.",
  },
];

// Map token symbols to narrative ids
export const TOKEN_TO_NARRATIVE: Record<string, string> = {
  TAO: "ai", RNDR: "ai", FET: "ai", AGIX: "ai", NEAR: "ai",
  ONDO: "rwa", LINK: "rwa", MKR: "rwa", CFG: "rwa",
  HYPE: "defi", JUP: "defi", GMX: "defi", DRIFT: "defi", SNX: "defi",
  SOL: "l1", ETH: "l1", AVAX: "l1", SUI: "l1", APT: "l1",
  HNT: "depin", IO: "depin", MOBILE: "depin",
  XRP: "banking", XLM: "banking", HBAR: "banking", ALGO: "banking",
  BTC: "macro", USDT: "macro", USDC: "macro",
};
