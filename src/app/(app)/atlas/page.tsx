import { Topbar } from "@/components/nav/Topbar";
import { AtlasChat } from "@/components/atlas/AtlasChat";

export default function AtlasPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Atlas" subtitle="Crypto × AI intelligence — signals, narratives, yield, and more" />
      <div className="flex-1 overflow-hidden">
        <AtlasChat />
      </div>
    </div>
  );
}
