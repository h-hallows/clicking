import { createConfig, http } from "wagmi";
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo";

export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc],
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: "phantom" }),
    coinbaseWallet({ appName: "Clicking" }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: "Clicking",
        description: "DeFi Discovery Suite",
        url: "https://clicking.app",
        icons: [],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]:   http(),
    [arbitrum.id]:  http(),
    [base.id]:      http(),
    [optimism.id]:  http(),
    [polygon.id]:   http(),
    [avalanche.id]: http(),
    [bsc.id]:       http(),
  },
});

export const SUPPORTED_CHAINS = [
  { id: mainnet.id,   name: "Ethereum",  color: "#627EEA", symbol: "ETH"  },
  { id: arbitrum.id,  name: "Arbitrum",  color: "#12AAFF", symbol: "ETH"  },
  { id: base.id,      name: "Base",      color: "#0052FF", symbol: "ETH"  },
  { id: optimism.id,  name: "Optimism",  color: "#FF0420", symbol: "ETH"  },
  { id: polygon.id,   name: "Polygon",   color: "#8247E5", symbol: "POL"  },
  { id: avalanche.id, name: "Avalanche", color: "#E84142", symbol: "AVAX" },
  { id: bsc.id,       name: "BNB Chain", color: "#F3BA2F", symbol: "BNB"  },
];
