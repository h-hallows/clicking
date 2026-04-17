import { Topbar } from "@/components/nav/Topbar";
import { ToolsLanding } from "@/components/tools/ToolsLanding";

export default function ToolsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Tools" subtitle="AI and crypto intelligence toolkit" />
      <div className="flex-1 overflow-y-auto">
        <ToolsLanding />
      </div>
    </div>
  );
}
