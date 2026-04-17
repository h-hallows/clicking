"use client";

import { useState } from "react";
import { COMMUNITY_USERS, BADGE_CONFIG } from "@/lib/community-data";
import { ShieldCheck, Trophy, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "pnl" | "yield" | "followers";

const RANK_COLORS = ["#f5c518", "#a8a8b0", "#ff9f43"];

export function Leaderboard() {
  const [sort, setSort] = useState<SortKey>("pnl");

  const sorted = [...COMMUNITY_USERS].sort((a, b) => {
    if (sort === "pnl") return b.pnl30d - a.pnl30d;
    if (sort === "yield") return parseInt(b.totalYield.replace(/\D/g, "")) - parseInt(a.totalYield.replace(/\D/g, ""));
    if (sort === "followers") return b.followers - a.followers;
    return 0;
  });

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#21262d" }}>
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-[#f5c518]" />
          <span className="text-sm font-semibold text-white">Leaderboard</span>
        </div>
        <div className="flex items-center gap-1">
          {(["pnl", "yield", "followers"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-colors",
                sort === key
                  ? "bg-[#f5c51820] text-[#f5c518]"
                  : "text-[#4a4a5a] hover:text-[#6b6b80]"
              )}
            >
              {key === "pnl" ? "30d PnL" : key === "yield" ? "Yield" : "Following"}
            </button>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "#21262d" }}>
        {sorted.map((user, i) => {
          const badge = user.badge ? BADGE_CONFIG[user.badge] : null;
          const rankColor = RANK_COLORS[i] ?? "#4a4a5a";
          const isTop3 = i < 3;

          return (
            <div
              key={user.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-[#1c2128] transition-colors cursor-pointer"
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-5 text-center text-xs font-bold flex-shrink-0",
                  isTop3 ? "text-sm" : ""
                )}
                style={{ color: isTop3 ? rankColor : "#4a4a5a" }}
              >
                {isTop3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
              </span>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: user.avatarColor + "25", color: user.avatarColor }}
                >
                  {user.avatar}
                </div>
                {user.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0d0e12] flex items-center justify-center">
                    <ShieldCheck size={8} style={{ color: user.avatarColor }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    {user.handle}
                  </span>
                  {badge && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users size={9} className="text-[#4a4a5a]" />
                  <span className="text-[10px] text-[#4a4a5a]">
                    {user.followers.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stat */}
              <div className="text-right flex-shrink-0">
                {sort === "pnl" && (
                  <div>
                    <div className="flex items-center gap-0.5 justify-end text-xs font-bold text-[#00e5a0]">
                      <TrendingUp size={10} />
                      +{user.pnl30d}%
                    </div>
                    <div className="text-[10px] text-[#4a4a5a]">30d return</div>
                  </div>
                )}
                {sort === "yield" && (
                  <div>
                    <div className="text-xs font-bold text-[#f5c518]">{user.totalYield}</div>
                    <div className="text-[10px] text-[#4a4a5a]">total earned</div>
                  </div>
                )}
                {sort === "followers" && (
                  <div>
                    <div className="text-xs font-bold text-white">{user.followers.toLocaleString()}</div>
                    <div className="text-[10px] text-[#4a4a5a]">followers</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
