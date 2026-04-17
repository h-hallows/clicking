import { Topbar } from "@/components/nav/Topbar";
import { JournalPage } from "@/components/tools/JournalPage";

export default function Journal() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Journal" subtitle="Track trades with thesis — build your Decision Quality Score" />
      <div className="flex-1 overflow-y-auto">
        <JournalPage />
      </div>
    </div>
  );
}
