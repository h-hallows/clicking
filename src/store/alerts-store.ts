"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALERTS, Alert } from "@/lib/dashboard-data";

interface AlertsStore {
  alerts: Alert[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set) => ({
      alerts: ALERTS,
      unreadCount: ALERTS.filter((a) => !a.read).length,

      markRead: (id) =>
        set((state) => {
          const alerts = state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
          return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
        }),

      markAllRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
          unreadCount: 0,
        })),
    }),
    {
      name: "clicking-alerts",
      partialize: (state) => ({ alerts: state.alerts, unreadCount: state.unreadCount }),
    }
  )
);
