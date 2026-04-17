"use client";

import { useState, useEffect } from "react";
import { Plus, X, Play, Pause, Zap, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Condition {
  type: "whale_buy" | "whale_sell" | "price_above" | "price_below" | "narrative_heat" | "social_spike" | "new_intersection";
  token?: string;
  narrativeId?: string;
  threshold?: number;
  heatLevel?: string;
}

interface Action {
  type: "alert" | "feed_inject" | "journal_note";
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  conditions: Condition[];
  actions: Action[];
  active: boolean;
  triggeredCount: number;
  createdAt: string;
  lastTriggered?: string;
}

const TEMPLATES = [
  {
    id: "portfolio-guardian",
    name: "Portfolio Guardian",
    description: "Watches your held tokens for signals and risks",
    icon: "🛡️",
    accentColor: "#3fb950",
    conditions: [{ type: "whale_sell" as const, threshold: 5 }, { type: "narrative_heat" as const, heatLevel: "COOLING" }],
    actions: [{ type: "alert" as const }, { type: "journal_note" as const }],
  },
  {
    id: "opportunity-scout",
    name: "Opportunity Scout",
    description: "Finds narratives heating up before they go mainstream",
    icon: "🔭",
    accentColor: "#00DCC8",
    conditions: [{ type: "narrative_heat" as const, heatLevel: "EXPLODING" }, { type: "whale_buy" as const, threshold: 10 }],
    actions: [{ type: "alert" as const }, { type: "feed_inject" as const }],
  },
  {
    id: "whale-watcher",
    name: "Whale Watcher",
    description: "Alerts on large wallet movements across all tokens",
    icon: "🐋",
    accentColor: "#58a6ff",
    conditions: [{ type: "whale_buy" as const, threshold: 20 }, { type: "whale_sell" as const, threshold: 20 }],
    actions: [{ type: "alert" as const }],
  },
  {
    id: "custom",
    name: "Build From Scratch",
    description: "Define your own conditions and actions",
    icon: "⚙️",
    accentColor: "#6e7681",
    conditions: [],
    actions: [],
  },
];

const CONDITION_LABELS: Record<string, string> = {
  whale_buy: "Whale buy above $__M",
  whale_sell: "Whale sell above $__M",
  price_above: "Price above $__",
  price_below: "Price below $__",
  narrative_heat: "Narrative heat reaches __",
  social_spike: "Social velocity spikes >__%",
  new_intersection: "New AI×Crypto intersection signal",
};

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  alert: { label: "Notify me (push + in-app)", icon: "🔔" },
  feed_inject: { label: "Inject into signal feed", icon: "⚡" },
  journal_note: { label: "Add note to Journal", icon: "📓" },
};

const HEAT_LEVELS = ["RISING", "HOT", "EXPLODING", "COOLING"];

const SEED_AGENTS: Agent[] = [
  {
    id: "agent-1",
    name: "Portfolio Guardian",
    description: "Watches your held tokens for signals and risks",
    icon: "🛡️",
    accentColor: "#3fb950",
    conditions: [{ type: "whale_sell", threshold: 5 }, { type: "narrative_heat", heatLevel: "COOLING" }],
    actions: [{ type: "alert" }, { type: "journal_note" }],
    active: true,
    triggeredCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastTriggered: new Date(Date.now() - 7200000).toISOString(),
  },
];

const SEED_ACTIVITY = [
  { agentName: "Portfolio Guardian", icon: "🛡️", time: "2h ago", event: "Whale sell $8.2M LINK detected", color: "#3fb950" },
  { agentName: "Portfolio Guardian", icon: "🛡️", time: "14h ago", event: "RWA narrative cooling signal", color: "#3fb950" },
  { agentName: "Portfolio Guardian", icon: "🛡️", time: "2d ago", event: "Whale sell $12M ETH detected", color: "#3fb950" },
];

function ConditionTag({ cond }: { cond: Condition }) {
  let label = CONDITION_LABELS[cond.type] || cond.type;
  if (cond.threshold) label = label.replace("__", String(cond.threshold));
  if (cond.heatLevel) label = label.replace("__", cond.heatLevel);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ background: "#21262d", color: "#e6edf3", border: "1px solid #30363d" }}>
      {label}
    </span>
  );
}

function ActionTag({ action }: { action: Action }) {
  const { label, icon } = ACTION_LABELS[action.type] || { label: action.type, icon: "•" };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
      style={{ background: "#161b22", color: "#6e7681", border: "1px solid #21262d" }}>
      <span>{icon}</span> {label}
    </span>
  );
}

function AgentCard({ agent, onToggle, onDelete }: { agent: Agent; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const lastTrig = agent.lastTriggered
    ? new Date(agent.lastTriggered).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "Never";

  return (
    <div className="rounded-lg p-4 flex flex-col gap-3 transition-all"
      style={{ background: "#161b22", border: `1px solid ${agent.active ? agent.accentColor + "40" : "#21262d"}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.icon}</span>
          <div>
            <div className="text-sm font-bold text-[#e6edf3]">{agent.name}</div>
            <div className="text-[11px] text-[#6e7681]">{agent.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onToggle(agent.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all"
            style={{
              background: agent.active ? agent.accentColor + "20" : "#21262d",
              color: agent.active ? agent.accentColor : "#6e7681",
              border: `1px solid ${agent.active ? agent.accentColor + "40" : "#30363d"}`,
            }}>
            {agent.active ? <><Play size={9} /> ACTIVE</> : <><Pause size={9} /> PAUSED</>}
          </button>
          <button onClick={() => onDelete(agent.id)} className="p-1.5 rounded hover:text-red-400 transition-colors" style={{ color: "#484f58" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div>
        <div className="text-[9px] font-black uppercase tracking-widest text-[#484f58] mb-1.5">When</div>
        <div className="flex flex-wrap gap-1.5">{agent.conditions.map((c, i) => <ConditionTag key={i} cond={c} />)}</div>
      </div>
      <div>
        <div className="text-[9px] font-black uppercase tracking-widest text-[#484f58] mb-1.5">Then</div>
        <div className="flex flex-wrap gap-1.5">{agent.actions.map((a, i) => <ActionTag key={i} action={a} />)}</div>
      </div>
      <div className="flex items-center gap-4 pt-1 border-t text-[10px] text-[#484f58]" style={{ borderColor: "#21262d" }}>
        <span className="flex items-center gap-1"><Zap size={9} /> {agent.triggeredCount} triggers</span>
        <span className="flex items-center gap-1" suppressHydrationWarning><Clock size={9} /> Last: {lastTrig}</span>
      </div>
    </div>
  );
}

function NewAgentModal({ onClose, onSave }: { onClose: () => void; onSave: (agent: Agent) => void }) {
  const [step, setStep] = useState<"template" | "configure">("template");
  const [selected, setSelected] = useState<(typeof TEMPLATES)[0] | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [addingCond, setAddingCond] = useState(false);
  const [newCondType, setNewCondType] = useState<Condition["type"]>("whale_buy");
  const [newCondThreshold, setNewCondThreshold] = useState(5);
  const [newCondHeat, setNewCondHeat] = useState("HOT");

  function pickTemplate(t: (typeof TEMPLATES)[0]) {
    setSelected(t);
    setName(t.name);
    setConditions(t.conditions.map(c => ({ ...c })));
    setActions(t.actions.map(a => ({ ...a })));
    setStep("configure");
  }

  function addCondition() {
    const cond: Condition = { type: newCondType };
    if (newCondType === "narrative_heat") cond.heatLevel = newCondHeat;
    else if (newCondType !== "new_intersection") cond.threshold = newCondThreshold;
    setConditions(prev => [...prev, cond]);
    setAddingCond(false);
    setNewCondThreshold(5);
  }

  function toggleAction(type: Action["type"]) {
    if (actions.some(a => a.type === type)) {
      setActions(prev => prev.filter(a => a.type !== type));
    } else {
      setActions(prev => [...prev, { type }]);
    }
  }

  function save() {
    if (!name.trim() || conditions.length === 0 || actions.length === 0) return;
    onSave({
      id: `agent-${Date.now()}`,
      name: name.trim(),
      description: selected?.description ?? "Custom agent",
      icon: selected?.icon ?? "⚙️",
      accentColor: selected?.accentColor ?? "#6e7681",
      conditions,
      actions,
      active: true,
      triggeredCount: 0,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-xl overflow-hidden" style={{ background: "#161b22", border: "1px solid #30363d" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#21262d" }}>
          <div>
            <div className="text-sm font-black text-[#e6edf3] uppercase tracking-widest">
              {step === "template" ? "Choose Template" : "Configure Agent"}
            </div>
            {step === "configure" && (
              <button onClick={() => setStep("template")} className="text-[10px] text-[#6e7681] hover:text-[#e6edf3] mt-0.5">← Back</button>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#21262d] text-[#6e7681] hover:text-[#e6edf3] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {step === "template" ? (
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => pickTemplate(t)}
                  className="text-left p-4 rounded-lg transition-all hover:border-[#30363d]"
                  style={{ background: "#0d0e12", border: "1px solid #21262d" }}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-sm font-bold text-[#e6edf3] mb-1">{t.name}</div>
                  <div className="text-[11px] text-[#6e7681]">{t.description}</div>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#484f58] block mb-1.5">Agent Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm text-[#e6edf3] outline-none focus:border-[#00DCC8]"
                  style={{ background: "#0d0e12", border: "1px solid #30363d" }} />
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-2">Trigger When...</div>
                <div className="space-y-1.5 mb-2">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded"
                      style={{ background: "#0d0e12", border: "1px solid #21262d" }}>
                      <ConditionTag cond={c} />
                      <button onClick={() => setConditions(prev => prev.filter((_, j) => j !== i))}
                        className="text-[#484f58] hover:text-red-400 ml-2"><X size={11} /></button>
                    </div>
                  ))}
                </div>
                {addingCond ? (
                  <div className="p-3 rounded space-y-2" style={{ background: "#0d0e12", border: "1px solid #30363d" }}>
                    <select value={newCondType} onChange={e => setNewCondType(e.target.value as Condition["type"])}
                      className="w-full px-2 py-1.5 rounded text-xs text-[#e6edf3] outline-none"
                      style={{ background: "#161b22", border: "1px solid #30363d" }}>
                      {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {newCondType === "narrative_heat" ? (
                      <select value={newCondHeat} onChange={e => setNewCondHeat(e.target.value)}
                        className="w-full px-2 py-1.5 rounded text-xs text-[#e6edf3] outline-none"
                        style={{ background: "#161b22", border: "1px solid #30363d" }}>
                        {HEAT_LEVELS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    ) : newCondType !== "new_intersection" ? (
                      <input type="number" value={newCondThreshold} onChange={e => setNewCondThreshold(Number(e.target.value))}
                        placeholder="Threshold" className="w-full px-2 py-1.5 rounded text-xs text-[#e6edf3] outline-none"
                        style={{ background: "#161b22", border: "1px solid #30363d" }} />
                    ) : null}
                    <div className="flex gap-2">
                      <button onClick={addCondition} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#00DCC8", color: "#0d0e12" }}>Add</button>
                      <button onClick={() => setAddingCond(false)} className="px-3 py-1.5 rounded text-xs text-[#6e7681] hover:text-[#e6edf3]">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingCond(true)} className="flex items-center gap-1.5 text-[11px] text-[#6e7681] hover:text-[#e6edf3] transition-colors">
                    <Plus size={12} /> Add condition
                  </button>
                )}
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-2">Then Do...</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(ACTION_LABELS) as Action["type"][]).map(type => {
                    const { label, icon } = ACTION_LABELS[type];
                    const active = actions.some(a => a.type === type);
                    return (
                      <button key={type} onClick={() => toggleAction(type)}
                        className="flex items-center gap-2 px-3 py-2 rounded text-xs text-left transition-all"
                        style={{
                          background: active ? "#00DCC820" : "#0d0e12",
                          border: `1px solid ${active ? "#00DCC840" : "#21262d"}`,
                          color: active ? "#00DCC8" : "#6e7681",
                        }}>
                        <span>{icon}</span><span>{label}</span>
                        {active && <span className="ml-auto font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {step === "configure" && (
          <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: "#21262d" }}>
            <button onClick={onClose} className="px-4 py-2 rounded text-xs text-[#6e7681] hover:text-[#e6edf3] transition-colors">Cancel</button>
            <button onClick={save} disabled={!name.trim() || conditions.length === 0 || actions.length === 0}
              className="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
              style={{ background: "#00DCC8", color: "#0d0e12" }}>
              Create Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentBuilder() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<"agents" | "activity">("agents");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cc_agents");
      setAgents(stored ? JSON.parse(stored) : SEED_AGENTS);
    } catch {
      setAgents(SEED_AGENTS);
    }
  }, []);

  function persist(updated: Agent[]) {
    setAgents(updated);
    localStorage.setItem("cc_agents", JSON.stringify(updated));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#e6edf3] uppercase tracking-wide">Agent Builder</h2>
          <p className="text-[12px] text-[#6e7681] mt-0.5">
            {agents.filter(a => a.active).length} active agent{agents.filter(a => a.active).length !== 1 ? "s" : ""} watching the market
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
          style={{ background: "#00DCC8", color: "#0d0e12" }}>
          <Plus size={13} /> New Agent
        </button>
      </div>

      <div className="flex gap-0 border-b" style={{ borderColor: "#21262d" }}>
        {(["agents", "activity"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2",
              tab === t ? "text-[#e6edf3] border-[#00DCC8]" : "text-[#484f58] border-transparent hover:text-[#6e7681]")}>
            {t === "agents" ? `MY AGENTS (${agents.length})` : "ACTIVITY LOG"}
          </button>
        ))}
      </div>

      {tab === "agents" ? (
        agents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-sm font-bold text-[#e6edf3] mb-1">No agents yet</div>
            <div className="text-[12px] text-[#6e7681] mb-4">Create your first agent to start watching the market automatically</div>
            <button onClick={() => setShowNew(true)} className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest"
              style={{ background: "#00DCC8", color: "#0d0e12" }}>
              Create First Agent
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent}
                onToggle={id => persist(agents.map(a => a.id === id ? { ...a, active: !a.active } : a))}
                onDelete={id => persist(agents.filter(a => a.id !== id))} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-2">
          {SEED_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{ background: "#161b22", border: "1px solid #21262d" }}>
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-[#e6edf3]">{item.event}</div>
                <div className="text-[10px] text-[#484f58] mt-0.5">{item.agentName} · {item.time}</div>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                style={{ background: item.color + "20", color: item.color }}>
                TRIGGERED
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg p-4" style={{ background: "#161b22", border: "1px solid #21262d" }}>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-3">How It Works</div>
        <div className="space-y-2">
          {[
            ["⚡", "Agents run automatically every 30 seconds as new signals arrive"],
            ["🔔", "Alerts appear at the top of your Signal Feed with a gold border"],
            ["📓", "Journal notes are created automatically for tracking"],
            ["🚧", "Execution (auto-trade) coming in Phase 2"],
          ].map(([icon, text], i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[#6e7681]">
              <span className="shrink-0">{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {showNew && (
        <NewAgentModal
          onClose={() => setShowNew(false)}
          onSave={agent => { persist([...agents, agent]); setShowNew(false); }} />
      )}
    </div>
  );
}
