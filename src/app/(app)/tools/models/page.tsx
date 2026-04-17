import { Topbar } from "@/components/nav/Topbar";
import { ModelBench } from "@/components/tools/ModelBench";

export default function ModelsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Model Bench" subtitle="Which AI model is actually best right now?" />
      <div className="flex-1 overflow-y-auto">
        <ModelBench />
      </div>
    </div>
  );
}
