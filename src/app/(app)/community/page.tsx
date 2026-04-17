import { Topbar } from "@/components/nav/Topbar";
import { ActivityFeed } from "@/components/community/ActivityFeed";
import { Leaderboard } from "@/components/community/Leaderboard";
import { TrendingProtocols } from "@/components/community/TrendingProtocols";
import { ShieldCheck, Users, TrendingUp } from "lucide-react";

const STATS = [
  { label: "Verified Members",    value: "12,480",  icon: ShieldCheck, color: "#00e5a0" },
  { label: "On-chain Actions",    value: "284K",    icon: TrendingUp,  color: "#7c6af7" },
  { label: "Active This Week",    value: "3,210",   icon: Users,       color: "#00d2e6" },
];

export default function CommunityPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Community" subtitle="On-chain verified — trust you can actually verify" />

      <div className="flex-1 p-5 space-y-5 max-w-[1400px] w-full mx-auto">
        {/* Community stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border px-4 py-3 flex items-center gap-3"
              style={{ background: "#161b22", borderColor: "#21262d" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: color + "20" }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">{value}</p>
                <p className="text-[11px] text-[#6e7681] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
          {/* Left: feed */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4a4a5a] mb-3 flex items-center gap-2">
              <ShieldCheck size={11} className="text-[#00e5a0]" />
              On-chain verified activity
            </p>
            <ActivityFeed />
          </div>

          {/* Right: leaderboard + trending */}
          <div className="space-y-5">
            <Leaderboard />
            <TrendingProtocols />
          </div>
        </div>
      </div>
    </div>
  );
}
