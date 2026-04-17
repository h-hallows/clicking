import { Topbar } from "@/components/nav/Topbar";
import { WatchlistPage } from "@/components/watchlist/WatchlistPage";

export default function Watchlist() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Watchlist" subtitle="Your personal alert center — tokens, narratives, and portfolio" />
      <div className="flex-1 overflow-y-auto">
        <WatchlistPage />
      </div>
    </div>
  );
}
