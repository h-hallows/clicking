"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EcosystemNode, CATEGORY_CONFIG, EDGES, NODES } from "@/lib/ecosystem-data";
import { useScopeStore } from "@/store/scope-store";
import { X, ExternalLink, ShieldCheck, TrendingUp, Layers, Flame, Globe, Bot, Zap } from "lucide-react";

interface NodePanelProps {
  node: EcosystemNode;
  onClose: () => void;
  side?: "left" | "right";
}

export function NodePanel({ node, onClose, side = "right" }: NodePanelProps) {
  const { selectNode } = useScopeStore();
  const cfg = CATEGORY_CONFIG[node.category];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const dimColor = cfg.color + "18";

  // Find connected protocols
  const connectedIds = EDGES.filter(
    (e) => e.source === node.id || e.target === node.id
  ).map((e) => (e.source === node.id ? e.target : e.source));

  const connectedNodes = connectedIds
    .map((id) => NODES.find((n) => n.id === id))
    .filter(Boolean)
    .slice(0, 6) as EcosystemNode[];

  const displayChains = node.chains.slice(0, 4);
  const extraChains = node.chains.length - 4;

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-2xl backdrop-blur-md"
      style={{
        borderColor: cfg.color + "35",
        background: "rgba(8, 7, 20, 0.92)",
        width: "300px",
        boxShadow: `0 0 40px ${cfg.color}18, 0 8px 32px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-start justify-between border-b"
        style={{ borderColor: cfg.color + "20", backgroundColor: dimColor }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ backgroundColor: cfg.color + "22", color: cfg.color }}
          >
            {node.label[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">{node.label}</span>
              {node.verified && (
                <ShieldCheck size={11} style={{ color: cfg.color }} className="flex-shrink-0" />
              )}
              {node.isHot && (
                <Flame size={11} className="text-orange-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#6b6b80] hover:text-white transition-colors ml-2 mt-0.5 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5">
        {/* Chains */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Globe size={10} className="text-[#6b6b80]" />
          {displayChains.map((chain) => (
            <span
              key={chain}
              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.06] text-[#8888a8] capitalize"
            >
              {chain.replace("-", " ")}
            </span>
          ))}
          {extraChains > 0 && (
            <span className="text-[9px] text-[#6b6b80]">+{extraChains} more</span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#8888a8] leading-relaxed">{node.description}</p>

        {/* Stats */}
        {(node.tvl || node.apy) && (
          <div className="grid grid-cols-2 gap-2">
            {node.tvl && (
              <StatCard
                icon={<Layers size={11} />}
                label="TVL"
                value={node.tvl}
                color={cfg.color}
              />
            )}
            {node.apy && (
              <StatCard
                icon={<TrendingUp size={11} />}
                label="APY"
                value={node.apy}
                color={cfg.color}
              />
            )}
          </div>
        )}

        {/* Connected protocols */}
        {connectedNodes.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#4a4a5a] mb-2">
              Connected Protocols
            </p>
            <div className="flex flex-wrap gap-1.5">
              {connectedNodes.map((cn) => {
                const ccfg = CATEGORY_CONFIG[cn.category];
                return (
                  <button
                    key={cn.id}
                    onClick={() => selectNode(cn.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all hover:scale-105"
                    style={{ backgroundColor: ccfg.color + "14", color: ccfg.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: ccfg.color }}
                    />
                    {cn.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex gap-1.5">
            <Link
              href={`/atlas?q=${encodeURIComponent(`Tell me everything about ${node.label}: what it does, its risks, TVL trends, and whether it's a good opportunity right now.`)}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#a78bfa18", color: "#a78bfa", border: "1px solid #a78bfa25" }}
            >
              <Bot size={11} />
              Ask Atlas
            </Link>
            <Link
              href={`/yield?search=${encodeURIComponent(node.label)}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#fbbf2418", color: "#fbbf24", border: "1px solid #fbbf2425" }}
            >
              <Zap size={11} />
              Find Yield
            </Link>
          </div>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: cfg.color + "18", color: cfg.color, border: `1px solid ${cfg.color}25` }}
          >
            <ExternalLink size={11} />
            Visit Protocol
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2.5">
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        {icon}
        <span className="text-[9px] uppercase tracking-widest font-semibold opacity-70">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
