"use client";

import Link from "next/link";
import { Alert } from "@/lib/dashboard-data";
import { useAlertsStore } from "@/store/alerts-store";
import { Bell, TrendingUp, TrendingDown, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALERT_ICONS = {
  apy_spike:    TrendingUp,
  tvl_surge:    Sparkles,
  tvl_drop:     TrendingDown,
  new_protocol: Sparkles,
  risk_warning: AlertTriangle,
};

export function AlertsFeed() {
  const { alerts, unreadCount, markAllRead, markRead } = useAlertsStore();

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2">
          <Bell size={13} className="text-[#7c6af7]" />
          <span className="text-[13px] font-bold text-[#e6edf3]">Alerts</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-[#7c6af7] text-white px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] text-[#6e7681] hover:text-[#e6edf3] transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="divide-y" style={{ borderColor: "#21262d" }}>
        {alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onRead={markRead}
          />
        ))}
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  onRead,
}: {
  alert: Alert;
  onRead: (id: string) => void;
}) {
  const Icon = ALERT_ICONS[alert.type];

  return (
    <div
      className={cn(
        "px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors",
        !alert.read ? "bg-[#1c2128]" : "hover:bg-[#1c2128]/50"
      )}
      onClick={() => onRead(alert.id)}
    >
      {/* Icon */}
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: alert.accentColor + "20", color: alert.accentColor }}
      >
        <Icon size={13} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-xs font-semibold"
            style={{ color: alert.accentColor }}
          >
            {alert.protocol}
          </span>
          <span className="text-[10px] text-[#484f58] flex-shrink-0">{alert.timestamp}</span>
        </div>
        <p className="text-[11px] text-[#6e7681] leading-relaxed">{alert.message}</p>
        <div className="flex items-center gap-2 mt-2">
          <Link
            href={`/atlas?q=${encodeURIComponent(`Tell me about ${alert.protocol}: ${alert.message}`)}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-md transition-colors"
            style={{ background: "#a78bfa10", color: "#a78bfa", border: "1px solid #a78bfa20" }}
          >
            Ask Atlas
          </Link>
          <Link
            href={`/scope?highlight=${alert.protocol.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-md transition-colors"
            style={{ background: "#7c6af710", color: "#7c6af7", border: "1px solid #7c6af720" }}
          >
            View in Scope
          </Link>
        </div>
      </div>

      {/* Unread dot */}
      {!alert.read && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
