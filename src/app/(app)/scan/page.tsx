import { Topbar } from "@/components/nav/Topbar";
import { ScanPage } from "@/components/scan/ScanPage";

export default function Scan() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Scan" subtitle="Token intelligence reports — powered by Atlas" />
      <div className="flex-1 overflow-y-auto">
        <ScanPage />
      </div>
    </div>
  );
}
