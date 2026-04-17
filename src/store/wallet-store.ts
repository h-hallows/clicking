"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConnectedWallet {
  address: string;
  label?: string;       // user-set nickname
  connector: string;    // "MetaMask", "Coinbase", etc.
  chainId: number;
  addedAt: string;
  // Fetched data
  ethBalance?: string;
  usdValue?: number;
}

interface WalletStore {
  wallets: ConnectedWallet[];
  activeWalletAddress: string | null;
  addWallet: (wallet: ConnectedWallet) => void;
  removeWallet: (address: string) => void;
  updateWallet: (address: string, updates: Partial<ConnectedWallet>) => void;
  setActiveWallet: (address: string | null) => void;
  setLabel: (address: string, label: string) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      wallets: [],
      activeWalletAddress: null,

      addWallet: (wallet) =>
        set((state) => {
          if (state.wallets.find((w) => w.address.toLowerCase() === wallet.address.toLowerCase())) {
            return state;
          }
          if (state.wallets.length >= 100) return state;
          return {
            wallets: [...state.wallets, wallet],
            activeWalletAddress: wallet.address,
          };
        }),

      removeWallet: (address) =>
        set((state) => {
          const remaining = state.wallets.filter(
            (w) => w.address.toLowerCase() !== address.toLowerCase()
          );
          return {
            wallets: remaining,
            activeWalletAddress:
              state.activeWalletAddress?.toLowerCase() === address.toLowerCase()
                ? remaining[0]?.address ?? null
                : state.activeWalletAddress,
          };
        }),

      updateWallet: (address, updates) =>
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.address.toLowerCase() === address.toLowerCase() ? { ...w, ...updates } : w
          ),
        })),

      setActiveWallet: (address) => set({ activeWalletAddress: address }),
      setLabel: (address, label) =>
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.address.toLowerCase() === address.toLowerCase() ? { ...w, label } : w
          ),
        })),
    }),
    {
      name: "clicking-wallets",
    }
  )
);
