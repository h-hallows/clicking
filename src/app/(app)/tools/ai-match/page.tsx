import { Topbar } from "@/components/nav/Topbar";
import { AIMatch } from "@/components/tools/AIMatch";

export default function AIMatchPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="AI Match" subtitle="Find the perfect AI tool for your task" />
      <div className="flex-1 overflow-y-auto">
        <AIMatch />
      </div>
    </div>
  );
}
