"use client";

import { useState } from "react";
import {
  ACTIVITY_FEED,
  BADGE_CONFIG,
  ActivityType,
  OnChainActivity,
} from "@/lib/community-data";
import {
  ShieldCheck,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Droplets,
  Zap,
  Heart,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { label: string; icon: React.ElementType; color: string }
> = {
  entered_position: { label: "Entered",       icon: TrendingUp,      color: "#00e5a0" },
  exited_position:  { label: "Exited",        icon: TrendingDown,    color: "#ff6b6b" },
  added_liquidity:  { label: "Added LP",      icon: Droplets,        color: "#00d2e6" },
  claimed_yield:    { label: "Claimed",       icon: Zap,             color: "#f5c518" },
  bridged:          { label: "Bridged",       icon: ArrowRightLeft,  color: "#ff9f43" },
  swapped:          { label: "Swapped",       icon: ArrowRightLeft,  color: "#7c6af7" },
};

type FilterType = "all" | ActivityType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",              label: "All"       },
  { key: "entered_position", label: "Positions" },
  { key: "added_liquidity",  label: "Liquidity" },
  { key: "swapped",          label: "Swaps"     },
  { key: "bridged",          label: "Bridges"   },
  { key: "claimed_yield",    label: "Yield"     },
];

export function ActivityFeed() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered =
    filter === "all"
      ? ACTIVITY_FEED
      : ACTIVITY_FEED.filter((a) => a.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              filter === key
                ? "bg-[#7c6af7] text-white"
                : "bg-white/[0.05] text-[#6b6b80] hover:text-white hover:bg-white/[0.08]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isLiked={liked.has(activity.id)}
            onLike={() =>
              setLiked((prev) => {
                const next = new Set(prev);
                next.has(activity.id)
                  ? next.delete(activity.id)
                  : next.add(activity.id);
                return next;
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  isLiked,
  onLike,
}: {
  activity: OnChainActivity;
  isLiked: boolean;
  onLike: () => void;
}) {
  const { user } = activity;
  const actConfig = ACTIVITY_CONFIG[activity.type];
  const ActIcon = actConfig.icon;
  const badge = user.badge ? BADGE_CONFIG[user.badge] : null;

  return (
    <div className="rounded-xl border p-4 hover:border-[#30363d] transition-colors group" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Top row: avatar + user + action + timestamp */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: user.avatarColor + "25", color: user.avatarColor }}
            >
              {user.avatar}
            </div>
            {user.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0d0e12] flex items-center justify-center">
                <ShieldCheck size={10} style={{ color: user.avatarColor }} />
              </div>
            )}
          </div>

          {/* Handle + badge + action */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">
                {user.handle}
              </span>
              {badge && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              )}
              <div
                className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: actConfig.color + "18",
                  color: actConfig.color,
                }}
              >
                <ActIcon size={9} />
                {actConfig.label}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-xs font-bold"
                style={{ color: activity.protocolColor }}
              >
                {activity.protocol}
              </span>
              <span className="text-[#4a4a5a] text-xs">·</span>
              <span className="text-[11px] text-[#4a4a5a]">{activity.chain}</span>
            </div>
          </div>
        </div>

        <span className="text-[11px] text-[#4a4a5a] flex-shrink-0">
          {activity.timestamp}
        </span>
      </div>

      {/* Amount + asset banner */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
        style={{ backgroundColor: activity.protocolColor + "10", borderLeft: `2px solid ${activity.protocolColor}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{activity.amount}</span>
          <span className="text-xs text-[#6b6b80]">{activity.asset}</span>
        </div>
        {activity.apy && (
          <span
            className="text-xs font-bold"
            style={{ color: activity.protocolColor }}
          >
            {activity.apy} APY
          </span>
        )}
      </div>

      {/* Detail text */}
      <p className="text-xs text-[#8888a0] leading-relaxed mb-3">
        {activity.detail}
      </p>

      {/* Footer: tx hash + social */}
      <div className="flex items-center justify-between">
        {/* TX hash */}
        <span className="flex items-center gap-1 text-[10px] text-[#4a4a5a] font-mono">
          <ShieldCheck size={9} className="text-[#00e5a0]" />
          {activity.txHash}
        </span>

        {/* Likes + comments */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1.5 text-[11px] transition-colors",
              isLiked ? "text-[#ff6b6b]" : "text-[#4a4a5a] hover:text-[#6b6b80]"
            )}
          >
            <Heart size={11} fill={isLiked ? "#ff6b6b" : "none"} />
            {activity.likes + (isLiked ? 1 : 0)}
          </button>
          <span className="flex items-center gap-1.5 text-[11px] text-[#4a4a5a]">
            <MessageCircle size={11} />
            {activity.comments}
          </span>
        </div>
      </div>
    </div>
  );
}
