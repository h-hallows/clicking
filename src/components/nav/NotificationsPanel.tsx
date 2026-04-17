"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Bell, TrendingUp, TrendingDown, Zap, Shield, Radio, X, Check } from "lucide-react";
import { useAlertsStore } from "@/store/alerts-store";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  apy_spike:    { icon: Zap,          color: "#fbbf24" },
  tvl_surge:    { icon: TrendingUp,   color: "#00e5a0" },
  tvl_drop:     { icon: TrendingDown, color: "#f85149" },
  new_protocol: { icon: Radio,        color: "#7c6af7" },
  risk_warning: { icon: Shield,       color: "#f85149" },
};

export function NotificationsPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { alerts, unreadCount: unread, markRead, markAllRead } = useAlertsStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-[80ms]"
        style={{
          background: open ? "#21262d" : "#161b22",
          borderColor: open ? "#484f58" : "#30363d",
          color: open ? "#e6edf3" : "#6e7681",
        }}
      >
        <Activity size={13} />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
            style={{ backgroundColor: "#7c6af7", borderColor: "#0d0e12" }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden z-50"
            style={{ background: "#161b22", borderColor: "#30363d" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#21262d" }}>
              <div className="flex items-center gap-2">
                <Bell size={12} className="text-[#7c6af7]" />
                <span className="text-[12px] font-bold text-[#e6edf3]">Alerts</span>
                {unread > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#7c6af720] text-[#7c6af7]">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[#484f58] hover:text-[#8b949e] transition-colors flex items-center gap-1"
                >
                  <Check size={9} /> Mark all read
                </button>
              )}
            </div>

            {/* Alert list */}
            <div className="max-h-[340px] overflow-y-auto divide-y" style={{ borderColor: "#21262d" }}>
              {alerts.map((alert) => {
                const cfg = TYPE_CONFIG[alert.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.apy_spike;
                const Icon = cfg.icon;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-[80ms]",
                      alert.read ? "hover:bg-[#1c2128]" : "bg-[#7c6af708] hover:bg-[#7c6af712]"
                    )}
                    onClick={() => markRead(alert.id)}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: cfg.color + "18", color: cfg.color }}
                    >
                      <Icon size={12} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#e6edf3]">{alert.protocol}</span>
                        <span className="text-[10px] text-[#484f58] flex-shrink-0">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#6e7681] mt-0.5 leading-snug">{alert.message}</p>
                    </div>
                    {!alert.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t" style={{ borderColor: "#21262d" }}>
              <button
                onClick={() => { setOpen(false); router.push("/dashboard"); }}
                className="w-full text-center text-[11px] text-[#484f58] hover:text-[#7c6af7] transition-colors"
              >
                View all in Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
