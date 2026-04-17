"use client";

import { create } from "zustand";
import { NodeCategory } from "@/lib/ecosystem-data";

interface ScopeStore {
  activeCategories: NodeCategory[];
  activeChain: string;
  selectedNode: string | null;
  searchQuery: string;
  timeFilter: "1H" | "24H" | "7D" | "30D";
  timeModifier: number;
  toggleCategory: (cat: NodeCategory) => void;
  setChain: (chain: string) => void;
  selectNode: (id: string | null) => void;
  setSearch: (q: string) => void;
  setTimeFilter: (f: "1H" | "24H" | "7D" | "30D") => void;
}

const ALL_CATEGORIES: NodeCategory[] = [
  "chain", "dex", "lending", "yield", "liquid-staking",
  "bridge", "stablecoin", "derivative", "nft", "oracle",
  "gaming", "social", "rwa", "launchpad",
];

const TIME_MODIFIERS: Record<"1H" | "24H" | "7D" | "30D", number> = {
  "1H": 0.4,
  "24H": 1.0,
  "7D": 0.85,
  "30D": 0.9,
};

export const useScopeStore = create<ScopeStore>((set) => ({
  activeCategories: ALL_CATEGORIES,
  activeChain: "all",
  selectedNode: null,
  searchQuery: "",
  timeFilter: "24H",
  timeModifier: 1.0,

  toggleCategory: (cat) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(cat)
        ? state.activeCategories.filter((c) => c !== cat)
        : [...state.activeCategories, cat],
    })),

  setChain: (chain) => set({ activeChain: chain }),
  selectNode: (id) => set({ selectedNode: id }),
  setSearch: (q) => set({ searchQuery: q }),
  setTimeFilter: (f) => set({ timeFilter: f, timeModifier: TIME_MODIFIERS[f] }),
}));
