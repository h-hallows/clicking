import { Topbar } from "@/components/nav/Topbar";
import { AgentBuilder } from "@/components/tools/AgentBuilder";

export default function AgentsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Agent Builder" subtitle="Build custom signal agents — no code required" />
      <div className="flex-1 overflow-y-auto">
        <AgentBuilder />
      </div>
    </div>
  );
}
