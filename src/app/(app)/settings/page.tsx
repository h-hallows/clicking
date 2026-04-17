"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/nav/Topbar";
import { useAuthStore } from "@/store/auth-store";
import {
  Shield, Bell, LogOut, ChevronRight,
  CheckCircle2, Globe, Bot, Zap, Radio, LayoutDashboard, ExternalLink, X, Trash2, AlertTriangle,
  ScanSearch, BookOpen, Layers, Users,
} from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectModal";
import { useWalletStore } from "@/store/wallet-store";
import { SUPPORTED_CHAINS } from "@/lib/wagmi-config";
import { cn } from "@/lib/utils";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-150 flex-shrink-0",
        checked ? "bg-[#7c6af7]" : "bg-[#30363d]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#21262d" }}>
      <div className="px-5 py-3.5 border-b" style={{ borderColor: "#21262d" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#484f58]">{title}</p>
      </div>
      <div className="divide-y" style={{ borderColor: "#21262d" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#e6edf3]">{label}</p>
        {description && <p className="text-[11px] text-[#6e7681] mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Provider badge ───────────────────────────────────────────────────────────

const PROVIDER_CONFIG = {
  email:  { label: "Email",  color: "#7c6af7" },
  google: { label: "Google", color: "#ea4335" },
  apple:  { label: "Apple",  color: "#e6edf3" },
};

// ─── Notifications config ──────────────────────────────────────────────────────

const NOTIFICATION_SETTINGS = [
  { id: "apy_alerts",    label: "APY spike alerts",    description: "Get notified when a pool APY jumps 20%+" },
  { id: "tvl_moves",     label: "TVL movement alerts", description: "Large TVL changes on protocols you watch" },
  { id: "new_protocols", label: "New protocol alerts",  description: "When new protocols are verified on The Scope" },
  { id: "feed_digest",   label: "Weekly feed digest",  description: "Top 5 signals from The Feed every Monday" },
];

const APP_LINKS = [
  { icon: Radio,          label: "Signal Feed",  href: "/feed",            color: "#00DCC8" },
  { icon: Globe,          label: "The Scope",    href: "/scope",           color: "#7c6af7" },
  { icon: Bot,            label: "Atlas",        href: "/atlas",           color: "#a78bfa" },
  { icon: ScanSearch,     label: "Scan",         href: "/scan",            color: "#00DCC8" },
  { icon: LayoutDashboard,label: "Portfolio",    href: "/dashboard",       color: "#00d2e6" },
  { icon: Zap,            label: "Yield",        href: "/yield",           color: "#fbbf24" },
  { icon: Bell,           label: "Watchlist",    href: "/watchlist",       color: "#fbbf24" },
  { icon: BookOpen,       label: "Journal",      href: "/tools/journal",   color: "#3fb950" },
  { icon: Layers,         label: "Tools",        href: "/tools",           color: "#E879F9" },
  { icon: Users,          label: "Community",    href: "/community",       color: "#3fb950" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    apy_alerts: true, tvl_moves: true, new_protocols: false, feed_digest: true,
  });
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);
  const { wallets, removeWallet } = useWalletStore();

  useEffect(() => { setHydrated(true); }, []);

  // Load notification prefs from localStorage on mount
  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored = localStorage.getItem("clicking_notifications");
      if (stored) setNotifications(JSON.parse(stored));
    } catch {}
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && !user) router.push("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Settings" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#7c6af7] border-t-transparent animate-spin" />
      </div>
    </div>
  );
  const providerCfg = PROVIDER_CONFIG[user.provider];
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#7c6af7", "#00d2e6", "#00e5a0", "#fbbf24", "#a78bfa"];
  const avatarColor = colors[user.id.charCodeAt(user.id.length - 1) % colors.length];
  const joinDate = new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleSave = () => {
    // Notification prefs are auto-saved on toggle; this confirms and navigates
    setSaved(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { setSaved(false); router.push("/dashboard"); }, 1200);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Settings" subtitle="Manage your account and preferences" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-5">

          {/* Profile */}
          <Section title="Profile">
            <div className="px-5 py-5 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#e6edf3]">{user.name}</p>
                <p className="text-[12px] text-[#6e7681] mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: providerCfg.color + "18", color: providerCfg.color }}
                  >
                    {providerCfg.label}
                  </span>
                  <span className="text-[10px] text-[#484f58]">Joined {joinDate}</span>
                </div>
              </div>
            </div>
            <Row label="Display name" description="How you appear across the suite">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] text-[#8b949e] cursor-not-allowed" style={{ background: "#0d0e12", borderColor: "#30363d" }}>
                {user.name}
              </div>
            </Row>
            <Row label="Email address" description="Used for alerts and account recovery">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] text-[#8b949e] cursor-not-allowed" style={{ background: "#0d0e12", borderColor: "#30363d" }}>
                {user.email}
              </div>
            </Row>
          </Section>

          {/* Wallets */}
          <Section title={`Wallets (${wallets.length}/100)`}>
            {wallets.length === 0 ? (
              <Row label="Connect wallets" description="Track up to 100 wallets across every chain. Read-only, non-custodial.">
                <WalletConnectButton />
              </Row>
            ) : (
              <>
                {wallets.map((wallet) => {
                  const chain = SUPPORTED_CHAINS.find((c) => c.id === wallet.chainId);
                  return (
                    <div key={wallet.address} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: "#21262d" }}>
                          {wallet.address.slice(2, 4).toUpperCase()}
                        </div>
                        {chain && (
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-[#161b22]"
                            style={{ backgroundColor: chain.color }}
                            title={chain.name}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-[#e6edf3] font-mono">
                            {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                          </span>
                          {wallet.ethBalance && (
                            <span className="text-[10px] text-[#8b949e]">{wallet.ethBalance} {chain?.symbol ?? "ETH"}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#484f58]">{wallet.connector}</span>
                          {chain && <span className="text-[10px]" style={{ color: chain.color }}>{chain.name}</span>}
                        </div>
                      </div>
                      <a
                        href={`https://etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#484f58] hover:text-[#7c6af7] hover:bg-[#21262d] transition-all"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => removeWallet(wallet.address)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#484f58] hover:text-[#f85149] hover:bg-[#f8514910] transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
                <Row label="Add another wallet" description={`${100 - wallets.length} slots remaining`}>
                  <WalletConnectButton />
                </Row>
              </>
            )}
            <div className="px-5 py-3 flex items-start gap-2.5">
              <Shield size={11} className="text-[#3fb950] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#484f58] leading-relaxed">
                Clicking is <strong className="text-[#6e7681]">fully non-custodial</strong> and read-only. We never request transaction signing or hold your keys.
              </p>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            {NOTIFICATION_SETTINGS.map((s) => (
              <Row key={s.id} label={s.label} description={s.description}>
                <Toggle
                  checked={notifications[s.id]}
                  onChange={(v) => {
                    const next = { ...notifications, [s.id]: v };
                    setNotifications(next);
                    try { localStorage.setItem("clicking_notifications", JSON.stringify(next)); } catch {}
                  }}
                />
              </Row>
            ))}
          </Section>

          {/* Suite */}
          <Section title="Suite — Quick access">
            {APP_LINKS.map(({ icon: Icon, label, href, color }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#21262d] transition-colors duration-[80ms] text-left"
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "18" }}>
                  <Icon size={13} style={{ color }} />
                </span>
                <span className="text-[13px] text-[#8b949e]">{label}</span>
                <ChevronRight size={12} className="ml-auto text-[#484f58]" />
              </button>
            ))}
          </Section>

          {/* Danger Zone */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "#161b22", borderColor: "#f8514920" }}>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: "#f8514920" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={11} className="text-[#f85149]" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#f85149]">Danger Zone</p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#e6edf3]">Clear all data</p>
                <p className="text-[11px] text-[#6e7681] mt-0.5">Removes all local settings, wallet list, and cached data.</p>
              </div>
              {clearConfirm ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-[#f85149] font-semibold">Are you sure?</span>
                  <button
                    onClick={() => {
                      try { localStorage.clear(); } catch {}
                      setClearConfirm(false);
                      router.push("/");
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#f85149] text-white transition-all hover:opacity-90"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#30363d] text-[#6e7681] hover:text-[#e6edf3] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold border border-[#f8514920] text-[#f85149] hover:bg-[#f8514910] transition-all duration-[80ms] flex-shrink-0"
                >
                  <Trash2 size={13} />
                  Clear data
                </button>
              )}
            </div>
          </div>

          {/* Save + sign out */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => { signOut(); router.push("/"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-[#f85149] hover:bg-[#f8514910] border border-transparent hover:border-[#f8514920] transition-all duration-[80ms]"
            >
              <LogOut size={13} />
              Sign out
            </button>

            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-bold transition-all duration-[80ms]",
                saved
                  ? "bg-[#3fb95018] text-[#3fb950] border border-[#3fb95030]"
                  : "bg-[#7c6af7] text-white hover:bg-[#6a5ce0]"
              )}
            >
              {saved ? <><CheckCircle2 size={13} /> Saved</> : "Save changes"}
            </button>
          </div>

          {/* App Version */}
          <div className="text-center pb-4">
            <p className="text-[10px] text-[#484f58]">
              Clicking Suite v1.1 · April 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
