"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Plus, Trash2, X, ChevronRight, Fish, TrendingUp, TrendingDown, Flame, Radio } from "lucide-react";

interface Alert {
  id: string;
  type: "whale_buy" | "whale_sell" | "price_above" | "price_below" | "narrative_heat" | "social_spike";
  token?: string;
  narrativeId?: string;
  threshold?: number;
  heatLevel?: "RISING" | "HOT" | "EXPLODING";
  active: boolean;
  triggered: string[];
  createdAt: string;
}

// Build today's date prefix once at module load so seed data always appears "today"
const _today = new Date().toISOString().slice(0, 10);

const DEFAULT_ALERTS: Alert[] = [
  { id: "a1", type: "whale_buy", token: "LINK", threshold: 10, active: true, triggered: [`${_today}T14:14:00Z`], createdAt: `${_today}T09:00:00Z` },
  { id: "a2", type: "narrative_heat", narrativeId: "ai", heatLevel: "EXPLODING", active: true, triggered: [`${_today}T09:07:00Z`], createdAt: `${_today}T07:00:00Z` },
  { id: "a3", type: "price_above", token: "TAO", threshold: 500, active: false, triggered: [], createdAt: `${_today}T06:30:00Z` },
  { id: "a4", type: "social_spike", token: "RNDR", threshold: 200, active: true, triggered: [`${_today}T11:32:00Z`], createdAt: `${_today}T05:00:00Z` },
];

const NARRATIVE_LABELS: Record<string, string> = {
  ai: "AI×CRYPTO",
  rwa: "RWA",
  defi: "DeFi",
  gaming: "Gaming",
  l2: "Layer 2",
  btcfi: "BTCFi",
};

const ALERT_TYPE_LABELS: Record<Alert["type"], string> = {
  whale_buy: "Whale Buy",
  whale_sell: "Whale Sell",
  price_above: "Price Above",
  price_below: "Price Below",
  narrative_heat: "Narrative Heat",
  social_spike: "Social Spike",
};

const ALERT_TYPE_ICONS: Record<Alert["type"], ReactNode> = {
  whale_buy:       <Fish size={15} className="text-[#00DCC8]" />,
  whale_sell:      <Fish size={15} className="text-[#f85149]" />,
  price_above:     <TrendingUp size={15} className="text-[#3fb950]" />,
  price_below:     <TrendingDown size={15} className="text-[#f85149]" />,
  narrative_heat:  <Flame size={15} className="text-[#fbbf24]" />,
  social_spike:    <Radio size={15} className="text-[#7c6af7]" />,
};

const ALERT_TYPE_COLORS: Record<Alert["type"], string> = {
  whale_buy:      "#00DCC8",
  whale_sell:     "#f85149",
  price_above:    "#3fb950",
  price_below:    "#f85149",
  narrative_heat: "#fbbf24",
  social_spike:   "#7c6af7",
};

function getAlertIcon(type: Alert["type"]) {
  return ALERT_TYPE_ICONS[type] ?? <Bell size={15} className="text-[#6e7681]" />;
}

function getAlertDescription(alert: Alert): string {
  switch (alert.type) {
    case "whale_buy":
      return `${alert.token} — Whale buy > $${alert.threshold}M`;
    case "whale_sell":
      return `${alert.token} — Whale sell > $${alert.threshold}M`;
    case "price_above":
      return `${alert.token} — Price above $${alert.threshold?.toLocaleString()}`;
    case "price_below":
      return `${alert.token} — Price below $${alert.threshold?.toLocaleString()}`;
    case "narrative_heat":
      return `${NARRATIVE_LABELS[alert.narrativeId ?? ""] ?? alert.narrativeId} — Heat: ${alert.heatLevel}`;
    case "social_spike":
      return `${alert.token} — Social velocity +${alert.threshold}%`;
    default:
      return "Unknown alert";
  }
}

function getTriggeredDescription(alert: Alert, isoTs: string): string {
  const d = new Date(isoTs);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  const time = `${h12}:${m}${ampm}`;

  switch (alert.type) {
    case "whale_buy":
      return `${time} — ${alert.token} whale buy $${alert.threshold}M detected`;
    case "whale_sell":
      return `${time} — ${alert.token} whale sell $${alert.threshold}M detected`;
    case "price_above":
      return `${time} — ${alert.token} crossed above $${alert.threshold?.toLocaleString()}`;
    case "price_below":
      return `${time} — ${alert.token} dropped below $${alert.threshold?.toLocaleString()}`;
    case "narrative_heat":
      return `${time} — ${NARRATIVE_LABELS[alert.narrativeId ?? ""] ?? alert.narrativeId} narrative heat: ${alert.heatLevel}`;
    case "social_spike":
      return `${time} — ${alert.token} social velocity +${alert.threshold}%`;
    default:
      return `${time} — Alert triggered`;
  }
}

function formatRelativeTime(isoTs: string): string {
  const diff = Date.now() - new Date(isoTs).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className="relative w-9 h-5 rounded-full flex items-center transition-all duration-200 flex-shrink-0"
      style={{
        backgroundColor: active ? "#7c6af7" : "#21262d",
        boxShadow: active ? "0 0 8px #7c6af760" : "none",
      }}
    >
      <span
        className="absolute w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: active ? "translateX(20px)" : "translateX(3px)" }}
      />
    </button>
  );
}

// ─── Alert Row ──────────────────────────────────────────────────────────────

function AlertRow({ alert, onToggle, onDelete }: { alert: Alert; onToggle: () => void; onDelete: () => void }) {
  const lastTriggered = alert.triggered.length > 0
    ? alert.triggered[alert.triggered.length - 1]
    : null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      // Second click — actually delete
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      onDelete();
    } else {
      // First click — arm confirmation for 1.5s
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 1500);
    }
  };

  useEffect(() => () => { if (confirmTimer.current) clearTimeout(confirmTimer.current); }, []);

  const typeColor = ALERT_TYPE_COLORS[alert.type];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#21262d] bg-[#161b22] hover:border-[#30363d] transition-colors duration-[80ms]"
      style={alert.active ? { borderLeft: `3px solid ${typeColor}40` } : undefined}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "#21262d" }}
      >
        {getAlertIcon(alert.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#e6edf3] leading-snug">
          {getAlertDescription(alert)}
        </p>
        <p className="text-[11px] text-[#6e7681] mt-0.5" suppressHydrationWarning>
          {lastTriggered ? `Last triggered: ${formatRelativeTime(lastTriggered)}` : "Never triggered"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ToggleSwitch active={alert.active} onChange={onToggle} />
        <button
          onClick={handleDeleteClick}
          title={confirmDelete ? "Click again to confirm delete" : "Delete alert"}
          className="w-6 h-6 flex items-center justify-center rounded-md transition-all duration-[80ms]"
          style={confirmDelete
            ? { color: "#f85149", backgroundColor: "#f8514920" }
            : { color: "#484f58" }
          }
        >
          {confirmDelete ? <X size={12} /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}

// ─── Alert type tiles ────────────────────────────────────────────────────────

const ALERT_TYPES: { type: Alert["type"]; label: string }[] = [
  { type: "whale_buy", label: "Whale Buy Alert" },
  { type: "whale_sell", label: "Whale Sell Alert" },
  { type: "price_above", label: "Price Above" },
  { type: "price_below", label: "Price Below" },
  { type: "narrative_heat", label: "Narrative Heat Change" },
  { type: "social_spike", label: "Social Velocity Spike" },
];

const NARRATIVES = [
  { id: "ai", label: "AI×CRYPTO" },
  { id: "rwa", label: "RWA" },
  { id: "defi", label: "DeFi" },
  { id: "gaming", label: "Gaming" },
  { id: "l2", label: "Layer 2" },
  { id: "btcfi", label: "BTCFi" },
];

const HEAT_LEVELS: Array<"RISING" | "HOT" | "EXPLODING"> = ["RISING", "HOT", "EXPLODING"];

// ─── Add Alert Modal ─────────────────────────────────────────────────────────

function AddAlertModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Alert) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<Alert["type"] | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const [token, setToken] = useState("");
  const [narrativeId, setNarrativeId] = useState("ai");
  const [threshold, setThreshold] = useState("");
  const [heatLevel, setHeatLevel] = useState<"RISING" | "HOT" | "EXPLODING">("RISING");

  const handleTypeSelect = (type: Alert["type"]) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleNext = () => {
    setStep(3);
  };

  const handleAdd = () => {
    if (!selectedType) return;
    const newAlert: Alert = {
      id: `a${Date.now()}`,
      type: selectedType,
      token: selectedType !== "narrative_heat" ? token.toUpperCase() || undefined : undefined,
      narrativeId: selectedType === "narrative_heat" ? narrativeId : undefined,
      threshold: threshold ? parseFloat(threshold) : undefined,
      heatLevel: selectedType === "narrative_heat" ? heatLevel : undefined,
      active: true,
      triggered: [],
      createdAt: new Date().toISOString(),
    };
    onSave(newAlert);
    onClose();
  };

  const isWhale = selectedType === "whale_buy" || selectedType === "whale_sell";
  const isPrice = selectedType === "price_above" || selectedType === "price_below";
  const isNarrative = selectedType === "narrative_heat";
  const isSocial = selectedType === "social_spike";

  const step2Valid = isNarrative
    ? true
    : token.trim().length > 0;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all"
              >
                <ChevronRight size={12} className="rotate-180" />
              </button>
            )}
            <h2 className="text-[14px] font-black text-[#e6edf3]">
              {step === 1 ? "Add Alert" : step === 2 ? "Configure Alert" : "Confirm Alert"}
            </h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
            <X size={13} />
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: Type selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => handleTypeSelect(t.type)}
                  className="flex flex-col items-start gap-2 p-3 rounded-xl border border-[#21262d] hover:border-[#7c6af7]/50 hover:bg-[#7c6af7]/[0.06] transition-all duration-[80ms] text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#21262d" }}>
                    {getAlertIcon(t.type)}
                  </div>
                  <span className="text-[12px] font-semibold text-[#e6edf3] leading-snug">{t.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && selectedType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0d0e12] border border-[#21262d]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {getAlertIcon(selectedType)}
                </div>
                <span className="text-[13px] font-semibold text-[#7c6af7]">
                  {ALERT_TYPES.find((t) => t.type === selectedType)?.label}
                </span>
              </div>

              {/* Token input */}
              {!isNarrative && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Token</label>
                  <input
                    type="text"
                    placeholder="e.g. LINK"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
                  />
                </div>
              )}

              {/* Narrative selector */}
              {isNarrative && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Narrative</label>
                  <div className="grid grid-cols-3 gap-2">
                    {NARRATIVES.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setNarrativeId(n.id)}
                        className="px-2 py-2 rounded-lg border text-[11px] font-semibold transition-all duration-[80ms]"
                        style={
                          narrativeId === n.id
                            ? { borderColor: "#7c6af7", backgroundColor: "#7c6af718", color: "#a78bfa" }
                            : { borderColor: "#21262d", backgroundColor: "transparent", color: "#6e7681" }
                        }
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Heat level */}
              {isNarrative && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">Heat Level</label>
                  <div className="flex gap-2">
                    {HEAT_LEVELS.map((hl) => (
                      <button
                        key={hl}
                        onClick={() => setHeatLevel(hl)}
                        className="flex-1 px-2 py-2 rounded-lg border text-[11px] font-bold transition-all duration-[80ms]"
                        style={
                          heatLevel === hl
                            ? { borderColor: "#fbbf24", backgroundColor: "#fbbf2418", color: "#fbbf24" }
                            : { borderColor: "#21262d", backgroundColor: "transparent", color: "#6e7681" }
                        }
                      >
                        {hl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Threshold */}
              {(isWhale || isPrice || isSocial) && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e7681] mb-1.5 uppercase tracking-wide">
                    {isWhale ? "Threshold ($M)" : isPrice ? "Target Price ($)" : "% Velocity Threshold"}
                  </label>
                  <input
                    type="number"
                    placeholder={isWhale ? "e.g. 10" : isPrice ? "e.g. 500" : "e.g. 200"}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#21262d] rounded-lg px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors"
                  />
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!step2Valid}
                className="w-full py-2.5 rounded-lg text-[13px] font-bold transition-all duration-[80ms] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#7c6af7", color: "white" }}
              >
                Preview Alert →
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedType && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#7c6af7]/30 bg-[#7c6af7]/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#21262d" }}>
                    {getAlertIcon(selectedType)}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#e6edf3]">
                      {getAlertDescription({
                        id: "preview",
                        type: selectedType,
                        token: token.toUpperCase() || undefined,
                        narrativeId: isNarrative ? narrativeId : undefined,
                        threshold: threshold ? parseFloat(threshold) : undefined,
                        heatLevel: isNarrative ? heatLevel : undefined,
                        active: true,
                        triggered: [],
                        createdAt: new Date().toISOString(),
                      })}
                    </p>
                    <p className="text-[11px] text-[#6e7681] mt-1">Alert will be active immediately</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-lg text-[13px] font-black transition-all duration-[80ms]"
                style={{ backgroundColor: "#7c6af7", color: "white" }}
              >
                ADD ALERT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WatchlistPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("cc_alerts");
      if (stored) {
        setAlerts(JSON.parse(stored));
      } else {
        setAlerts(DEFAULT_ALERTS);
        localStorage.setItem("cc_alerts", JSON.stringify(DEFAULT_ALERTS));
      }
    } catch {
      setAlerts(DEFAULT_ALERTS);
    }
  }, []);

  const save = (updated: Alert[]) => {
    setAlerts(updated);
    try {
      localStorage.setItem("cc_alerts", JSON.stringify(updated));
      window.dispatchEvent(new Event("cc_alerts_updated"));
    } catch {}
  };

  const toggleAlert = (id: string) => {
    save(alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const deleteAlert = (id: string) => {
    save(alerts.filter((a) => a.id !== id));
  };

  const addAlert = (alert: Alert) => {
    save([...alerts, alert]);
  };

  const active = alerts.filter((a) => a.active);
  const inactive = alerts.filter((a) => !a.active);

  // Build triggered today list
  const TODAY = new Date().toISOString().slice(0, 10);
  const triggeredToday: { alert: Alert; ts: string }[] = [];
  for (const a of alerts) {
    for (const ts of a.triggered) {
      if (ts.startsWith(TODAY)) {
        triggeredToday.push({ alert: a, ts });
      }
    }
  }
  triggeredToday.sort((a, b) => b.ts.localeCompare(a.ts));
  const recentTriggers = triggeredToday.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#484f58] uppercase">
            Monitoring
          </p>
          <h1 className="text-lg font-black text-[#e6edf3] mt-0.5">MY WATCHLIST</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all duration-[80ms] border border-[#7c6af7]/40 bg-[#7c6af7]/[0.08] text-[#a78bfa] hover:bg-[#7c6af7]/[0.15] hover:border-[#7c6af7]/60"
        >
          <Plus size={13} />
          ADD ALERT
        </button>
      </div>

      {/* Active Alerts */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black tracking-[0.15em] text-[#3fb950] uppercase">Active Alerts</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#3fb95018] text-[#3fb950]">{active.length}</span>
        </div>
        {active.length > 0 ? (
          <div className="space-y-2">
            {active.map((a) => (
              <AlertRow
                key={a.id}
                alert={a}
                onToggle={() => toggleAlert(a.id)}
                onDelete={() => deleteAlert(a.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-[#484f58] py-3 px-4 rounded-xl border border-dashed border-[#21262d]">
            No active alerts. Add one above.
          </div>
        )}
      </section>

      {/* Inactive Alerts */}
      {inactive.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-[0.15em] text-[#484f58] uppercase">Inactive Alerts</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#21262d] text-[#484f58]">{inactive.length}</span>
          </div>
          <div className="space-y-2 opacity-60">
            {inactive.map((a) => (
              <AlertRow
                key={a.id}
                alert={a}
                onToggle={() => toggleAlert(a.id)}
                onDelete={() => deleteAlert(a.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Triggered Today */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black tracking-[0.15em] text-[#fbbf24] uppercase">Triggered Today</span>
          {recentTriggers.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#fbbf2418] text-[#fbbf24]">{recentTriggers.length}</span>
          )}
        </div>
        {recentTriggers.length > 0 ? (
          <div className="rounded-xl border border-[#21262d] bg-[#161b22] divide-y divide-[#21262d]">
            {recentTriggers.map(({ alert, ts }, i) => (
              <div key={`${alert.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
                <span className="relative flex-shrink-0 flex items-center justify-center w-3 h-3">
                  <span
                    className="absolute inline-block w-2 h-2 rounded-full opacity-75 animate-ping"
                    style={{ backgroundColor: ALERT_TYPE_COLORS[alert.type] }}
                  />
                  <span
                    className="relative inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ALERT_TYPE_COLORS[alert.type] }}
                  />
                </span>
                <span className="text-[12px] text-[#8b949e]" suppressHydrationWarning>
                  {getTriggeredDescription(alert, ts)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-[#484f58] py-3 px-4 rounded-xl border border-dashed border-[#21262d]">
            No alerts triggered today.
          </div>
        )}
      </section>

      {/* Modal */}
      {mounted && showModal && (
        <AddAlertModal onClose={() => setShowModal(false)} onSave={addAlert} />
      )}
    </div>
  );
}
