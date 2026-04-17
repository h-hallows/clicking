import { Topbar } from "@/components/nav/Topbar";
import { SignalFeed } from "@/components/feed/SignalFeed";

export default function FeedPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="The Feed"
        subtitle="Real-time narrative intelligence — whale moves, on-chain signals, market events"
      />
      <div className="flex-1 overflow-hidden">
        <SignalFeed />
      </div>
    </div>
  );
}
