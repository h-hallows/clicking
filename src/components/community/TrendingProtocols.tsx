"use client";

import { useRouter } from "next/navigation";
import { TRENDING_PROTOCOLS } from "@/lib/community-data";
import { TrendingUp, Users, Activity } from "lucide-react";

export function TrendingProtocols() {
  const router = useRouter();
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#21262d" }}>
        <Activity size={13} className="text-[#00e5a0]" />
        <span className="text-sm font-semibold text-white">Trending Now</span>
        <span className="text-[10px] text-[#4a4a5a]">by community activity</span>
      </div>

      <div className="divide-y" style={{ borderColor: "#21262d" }}>
        {TRENDING_PROTOCOLS.map((protocol, i) => (
          <div
            key={protocol.id}
            className="px-4 py-3 flex items-center gap-3 hover:bg-[#1c2128] transition-colors cursor-pointer"
          onClick={() => router.push(`/scope?highlight=${protocol.id}`)}
          >
            {/* Rank */}
            <span className="text-xs font-bold text-[#4a4a5a] w-4 flex-shrink-0">
              {i + 1}
            </span>

            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: protocol.color + "20", color: protocol.color }}
            >
              {protocol.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">{protocol.name}</span>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                  style={{ backgroundColor: protocol.color + "18", color: protocol.color }}
                >
                  {protocol.category}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Users size={9} className="text-[#4a4a5a]" />
                  <span className="text-[10px] text-[#4a4a5a]">
                    {protocol.uniqueUsers.toLocaleString()} users
                  </span>
                </div>
                <span className="text-[#4a4a5a] text-[10px]">·</span>
                <span className="text-[10px] text-[#4a4a5a]">{protocol.chain}</span>
              </div>
            </div>

            {/* Activity change */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#00e5a0] justify-end">
                <TrendingUp size={10} />
                +{protocol.activityChange}%
              </div>
              <div className="text-[10px] text-[#4a4a5a]">
                {protocol.activityCount.toLocaleString()} moves
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
