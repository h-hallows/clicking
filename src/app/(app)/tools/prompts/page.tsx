import { Topbar } from "@/components/nav/Topbar";
import { PromptVault } from "@/components/tools/PromptVault";

export default function PromptsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Prompt Vault" subtitle="Curated prompts for every goal — works with any AI" />
      <div className="flex-1 overflow-y-auto">
        <PromptVault />
      </div>
    </div>
  );
}
