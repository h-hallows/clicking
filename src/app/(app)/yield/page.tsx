import { Topbar } from "@/components/nav/Topbar";
import { YieldPageClient } from "@/components/yield/YieldPageClient";
import { YieldDiscovery } from "@/components/yield/YieldDiscovery";

export default function YieldPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="The Yield"
        subtitle="Browse live yield opportunities across every chain — no accounts, no custody"
      />
      <div className="flex-1 overflow-y-auto">
        <YieldPageClient />
        <div id="yield-pool-browser">
          <YieldDiscovery />
        </div>
      </div>
    </div>
  );
}
