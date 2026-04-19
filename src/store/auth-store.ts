import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "email" | "google" | "apple";
  joinedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => void;
}

// Mock delay to simulate network
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,

      signIn: async (email, _password) => {
        set({ loading: true });
        await delay(1100);
        const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        set({
          loading: false,
          user: {
            id: `user_${Date.now()}`,
            name,
            email,
            provider: "email",
            joinedAt: new Date().toISOString(),
          },
        });
      },

      signInWithGoogle: async () => {
        set({ loading: true });
        await delay(900);
        set({
          loading: false,
          user: {
            id: `google_${Date.now()}`,
            name: "Alex Chen",
            email: "alex@gmail.com",
            provider: "google",
            joinedAt: new Date().toISOString(),
          },
        });
      },

      signInWithApple: async () => {
        set({ loading: true });
        await delay(900);
        set({
          loading: false,
          user: {
            id: `apple_${Date.now()}`,
            name: "Apple User",
            email: "user@privaterelay.appleid.com",
            provider: "apple",
            joinedAt: new Date().toISOString(),
          },
        });
      },

      signUp: async (name, email, _password) => {
        set({ loading: true });
        await delay(1200);
        set({
          loading: false,
          user: {
            id: `user_${Date.now()}`,
            name,
            email,
            provider: "email",
            joinedAt: new Date().toISOString(),
          },
        });
      },

      signInAsGuest: () => {
        set({
          user: {
            id: `guest_${Date.now()}`,
            name: "Guest",
            email: "guest@clicking.app",
            provider: "email",
            joinedAt: new Date().toISOString(),
          },
        });
      },

      signOut: () => set({ user: null }),
    }),
    {
      name: "clicking-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
