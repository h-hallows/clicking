import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { CommandPalette } from "@/components/nav/CommandPalette";
import { WagmiProvider } from "@/components/providers/WagmiProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-[220px] min-h-screen flex flex-col min-w-0 overflow-hidden pb-14 lg:pb-0">
          {children}
        </main>
        <CommandPalette />
        <BottomNav />
      </div>
    </WagmiProvider>
  );
}
