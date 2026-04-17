import { Topbar } from "@/components/nav/Topbar";
import { StatCards } from "@/components/dashboard/StatCards";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { MarketMovers } from "@/components/dashboard/MarketMovers";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { Portfolio } from "@/components/dashboard/Portfolio";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { NarrativeAlignment } from "@/components/dashboard/NarrativeAlignment";

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Dashboard" subtitle="Your personalized home base" />

      <div className="flex-1 p-5 space-y-5 max-w-[1400px] w-full mx-auto">
        {/* Market stats */}
        <StatCards />

        {/* Main grid: left (wider) + right sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <Watchlist />
            <MarketMovers />
            <Portfolio />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <HealthScore />
            <NarrativeAlignment />
            <AlertsFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
