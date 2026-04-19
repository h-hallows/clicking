"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  NODES, EDGES, CATEGORY_CONFIG, CLUSTER_POSITIONS,
  EcosystemNode, NodeCategory,
} from "@/lib/ecosystem-data";
import { useScopeStore } from "@/store/scope-store";
import { NodePanel } from "./NodePanel";
import { ZoomIn, ZoomOut, Maximize2, Search } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SimNode extends EcosystemNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimEdge {
  source: string;
  target: string;
  s: SimNode;
  t: SimNode;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
}

interface Particle {
  edgeIdx: number;
  t: number;
  speed: number;
}

interface CameraTarget {
  wx: number;
  wy: number;
  targetScale: number;
  active: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nodeRadius(node: EcosystemNode): number {
  const tvl = node.tvlNum ?? 10;
  const base = 5 + Math.log10(Math.max(10, tvl)) * 3.2;
  const boost = node.category === "chain" ? 5 : 0;
  return Math.min(24, Math.max(5, base + boost));
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function colorWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Physics ─────────────────────────────────────────────────────────────────

function tick(nodes: SimNode[], edges: SimEdge[], W: number, H: number, alpha: number) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist2 = dx * dx + dy * dy || 0.001;
      const dist = Math.sqrt(dist2);
      const force = Math.min(2000 / dist2, 50) * alpha;
      const fx = (dx / dist) * force, fy = (dy / dist) * force;
      a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
    }
  }

  edges.forEach(({ s: a, t: b }) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ideal = 75 + a.radius + b.radius;
    const f = ((dist - ideal) / dist) * 0.10 * alpha;
    a.vx += dx * f; a.vy += dy * f;
    b.vx -= dx * f; b.vy -= dy * f;
  });

  nodes.forEach((n) => {
    const c = CLUSTER_POSITIONS[n.category];
    n.vx += (c.cx * W - n.x) * 0.022 * alpha;
    n.vy += (c.cy * H - n.y) * 0.022 * alpha;
  });

  const pad = 60;
  nodes.forEach((n) => {
    if (n.x < pad)     n.vx += (pad - n.x) * 0.06;
    if (n.x > W - pad) n.vx -= (n.x - (W - pad)) * 0.06;
    if (n.y < pad)     n.vy += (pad - n.y) * 0.06;
    if (n.y > H - pad) n.vy -= (n.y - (H - pad)) * 0.06;
  });

  nodes.forEach((n) => {
    n.vx *= 0.82; n.vy *= 0.82;
    n.x += n.vx; n.y += n.vy;
  });
}

// ─── Renderer ────────────────────────────────────────────────────────────────

function render(
  ctx: CanvasRenderingContext2D,
  nodes: SimNode[],
  edges: SimEdge[],
  particles: Particle[],
  tr: Transform,
  hoveredId: string | null,
  selectedId: string | null,
  searchQuery: string,
  activeCategories: NodeCategory[],
  activeChain: string,
  stars: Star[],
  frame: number,
  W: number,
  H: number,
  timeModifier: number,
) {
  const { x: tx, y: ty, scale } = tr;

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#04040e";
  ctx.fillRect(0, 0, W, H);

  // ── Nebula glow (screen space) ──────────────────────────────────────────────
  const nebula1 = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.45);
  nebula1.addColorStop(0, "rgba(100, 60, 200, 0.06)");
  nebula1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = nebula1;
  ctx.fillRect(0, 0, W, H);

  const nebula2 = ctx.createRadialGradient(W * 0.75, H * 0.6, 0, W * 0.75, H * 0.6, W * 0.4);
  nebula2.addColorStop(0, "rgba(0, 150, 180, 0.05)");
  nebula2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, W, H);

  // ── Stars (screen-space, fixed) ──────────────────────────────────────────────
  stars.forEach((s) => {
    const twinkle = 0.6 + 0.4 * Math.sin(frame * 0.016 + s.x * 300 + s.y * 150);
    ctx.globalAlpha = s.o * twinkle;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── World space ─────────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  // ── Hex grid ─────────────────────────────────────────────────────────────────
  if (scale > 0.18) {
    const hexR = 48;
    const hexH = hexR * Math.sqrt(3);
    const colW = hexR * 1.5;

    const viewL = -tx / scale - hexR * 2;
    const viewT = -ty / scale - hexH;
    const viewR = viewL + W / scale + hexR * 4;
    const viewB = viewT + H / scale + hexH * 2;

    const startCol = Math.floor(viewL / colW);
    const endCol   = Math.ceil(viewR / colW);
    const startRow = Math.floor(viewT / hexH);
    const endRow   = Math.ceil(viewB / hexH);

    ctx.strokeStyle = "#1e1e3a";
    ctx.lineWidth = 0.6 / scale;
    ctx.globalAlpha = 0.55;

    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        const cx = col * colW;
        const cy = row * hexH + (col % 2 ? hexH * 0.5 : 0);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 - 30) * (Math.PI / 180);
          const px = cx + hexR * 0.88 * Math.cos(angle);
          const py = cy + hexR * 0.88 * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── Filter pass ─────────────────────────────────────────────────────────────
  const visibleIds = new Set(
    nodes
      .filter((nd) => {
        const catOk = activeCategories.includes(nd.category);
        const chainOk = activeChain === "all" || nd.chains.includes(activeChain);
        return catOk && chainOk;
      })
      .map((nd) => nd.id)
  );

  const hasSearch = searchQuery.trim().length > 0;
  const q = searchQuery.toLowerCase().trim();

  const connected = new Set<string>();
  if (selectedId) {
    connected.add(selectedId);
    edges.forEach((e) => {
      if (e.source === selectedId) connected.add(e.target);
      if (e.target === selectedId) connected.add(e.source);
    });
  }

  // ── Edges ────────────────────────────────────────────────────────────────────
  edges.forEach((e) => {
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return;
    const a = e.s, b = e.t;
    const isConnected = connected.has(a.id) && connected.has(b.id);

    let opacity = 0;
    if (selectedId) {
      opacity = isConnected ? 0.55 : 0.015;
    } else if (hasSearch) {
      const match = a.label.toLowerCase().includes(q) || b.label.toLowerCase().includes(q);
      opacity = match ? 0.4 : 0.015;
    } else {
      opacity = 0.06;
    }

    if (opacity < 0.005) return;

    const colorA = CATEGORY_CONFIG[a.category].color;
    const colorB = CATEGORY_CONFIG[b.category].color;

    if (isConnected && selectedId) {
      // Gradient edge for connected nodes
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, colorWithAlpha(colorA, opacity));
      grad.addColorStop(1, colorWithAlpha(colorB, opacity));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2 / scale;
      ctx.shadowBlur = 6 / scale;
      ctx.shadowColor = colorA;
    } else {
      ctx.strokeStyle = colorWithAlpha(colorA, opacity);
      ctx.lineWidth = 0.8 / scale;
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // ── Particles along edges ────────────────────────────────────────────────────
  particles.forEach((p) => {
    const e = edges[p.edgeIdx];
    if (!e) return;
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return;

    const isConnectedEdge = connected.has(e.source) && connected.has(e.target);
    const opacity = isConnectedEdge ? 0.9 : (selectedId ? 0.0 : 0.4);
    if (opacity < 0.05) return;

    const px = e.s.x + (e.t.x - e.s.x) * p.t;
    const py = e.s.y + (e.t.y - e.s.y) * p.t;
    const color = CATEGORY_CONFIG[e.s.category].color;

    ctx.globalAlpha = opacity;
    ctx.shadowBlur = 8 / scale;
    ctx.shadowColor = color;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, 1.5 / scale, 0, Math.PI * 2);
    ctx.fill();

    // Trailing glow
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * 0.4;
    ctx.beginPath();
    ctx.arc(px, py, 3.5 / scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });

  // ── Nodes ────────────────────────────────────────────────────────────────────
  const t = frame;

  nodes.forEach((node) => {
    if (!visibleIds.has(node.id)) return;

    const cfg = CATEGORY_CONFIG[node.category];
    const isSelected = node.id === selectedId;
    const isHovered = node.id === hoveredId;

    let nodeAlpha = 1;
    if (hasSearch) {
      const match =
        node.label.toLowerCase().includes(q) ||
        node.description.toLowerCase().includes(q) ||
        node.category.includes(q);
      nodeAlpha = match ? 1 : 0.08;
    } else if (selectedId) {
      nodeAlpha = connected.has(node.id) ? 1 : 0.08;
    }

    if (nodeAlpha < 0.001) return;

    const pulseMag = isSelected ? 2.5 : (node.isHot ? 1.0 : 0);
    const pr = node.radius + Math.sin(t * 0.04 + node.x * 0.05) * pulseMag * 0.3;

    ctx.globalAlpha = nodeAlpha;

    // ── Outer glow aura ─────────────────────────────────────────────────────
    // In 1H mode (timeModifier=0.4): boost hot nodes, fade quiet ones
    const is1H = timeModifier < 0.5;
    const hotBoost = is1H && node.isHot ? 3.5 : 1;
    const quietFade = is1H && !node.isHot ? 0.25 : 1;
    const auraR = pr * (isSelected ? 3.5 : isHovered ? 2.8 : (is1H && node.isHot ? 2.8 : 2.0));
    const aura = ctx.createRadialGradient(node.x, node.y, pr * 0.4, node.x, node.y, auraR);
    const auraBase = isSelected ? 0.18 : isHovered ? 0.12 : 0.06 * timeModifier * hotBoost * quietFade;
    aura.addColorStop(0, colorWithAlpha(cfg.color, auraBase));
    aura.addColorStop(1, colorWithAlpha(cfg.color, 0));
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(node.x, node.y, auraR, 0, Math.PI * 2);
    ctx.fill();

    // ── Hot pulse rings ─────────────────────────────────────────────────────
    // In 1H mode, all hot nodes pulse harder and with more rings
    if (node.isHot && !isSelected && nodeAlpha > 0.5) {
      const ringCount = is1H ? 3 : 2;
      const speed = is1H ? 0.035 : 0.025;
      for (let ring = 0; ring < ringCount; ring++) {
        const phase = (t * speed + ring * (1 / ringCount)) % 1;
        const ringR = pr + 4 + phase * (is1H ? 18 : 12);
        const ringAlpha = (1 - phase) * (is1H ? 0.45 : 0.3);
        ctx.globalAlpha = nodeAlpha * ringAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = (is1H ? 1.6 : 1.2) / scale;
        ctx.stroke();
      }
      ctx.globalAlpha = nodeAlpha;
    }

    // ── Selection rings ─────────────────────────────────────────────────────
    if (isSelected) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = ((t * 0.018) + ring * 0.33) % 1;
        const ringR = pr + 5 + phase * 22;
        const ringAlpha = (1 - phase) * 0.5;
        ctx.globalAlpha = nodeAlpha * ringAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1.5 / scale;
        ctx.stroke();
      }
      // Solid ring
      ctx.globalAlpha = nodeAlpha * 0.7;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pr + 4, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 1.5 / scale;
      ctx.stroke();
      ctx.globalAlpha = nodeAlpha;
    }

    if (isHovered && !isSelected) {
      ctx.globalAlpha = nodeAlpha * 0.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pr + 4 + Math.sin(t * 0.08) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 1.2 / scale;
      ctx.stroke();
      ctx.globalAlpha = nodeAlpha;
    }

    // ── Node fill — radial gradient ─────────────────────────────────────────
    const glowBase = isSelected ? 28 : isHovered ? 20 : (node.radius > 12 ? 14 : 8);
    ctx.shadowBlur = isSelected || isHovered ? glowBase : glowBase * timeModifier;
    ctx.shadowColor = cfg.color;

    // Outer fill
    const outerFill = ctx.createRadialGradient(
      node.x - pr * 0.3, node.y - pr * 0.3, 0,
      node.x, node.y, pr
    );
    outerFill.addColorStop(0, colorWithAlpha(cfg.color, isSelected ? 0.5 : isHovered ? 0.4 : 0.25));
    outerFill.addColorStop(0.6, colorWithAlpha(cfg.color, isSelected ? 0.2 : 0.1));
    outerFill.addColorStop(1, colorWithAlpha(cfg.color, 0.04));
    ctx.beginPath();
    ctx.arc(node.x, node.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = outerFill;
    ctx.fill();

    // Stroke ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, pr, 0, Math.PI * 2);
    ctx.strokeStyle = colorWithAlpha(cfg.color, isSelected ? 1 : isHovered ? 0.9 : 0.7);
    ctx.lineWidth = (isSelected ? 2 : isHovered ? 1.8 : 1.2) / scale;
    ctx.stroke();

    // Inner bright core
    const coreR = pr * 0.38;
    const core = ctx.createRadialGradient(
      node.x - coreR * 0.4, node.y - coreR * 0.4, 0,
      node.x, node.y, coreR
    );
    core.addColorStop(0, "#ffffff");
    core.addColorStop(0.4, colorWithAlpha(cfg.color, 0.8));
    core.addColorStop(1, colorWithAlpha(cfg.color, 0));
    ctx.beginPath();
    ctx.arc(node.x, node.y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    ctx.shadowBlur = 0;

    // ── Label ───────────────────────────────────────────────────────────────
    const showLabel = isSelected || isHovered || node.radius > 12 || scale > 1.1;
    if (showLabel) {
      const fs = Math.max(7, Math.min(12, node.radius * 0.85)) / scale;
      const isChain = node.category === "chain";
      ctx.font = `${isChain ? "700" : "600"} ${fs}px system-ui, sans-serif`;

      const lx = node.x;
      const ly = isChain || node.radius > 14 ? node.y : node.y + pr + 7 / scale;

      // Shadow/outline for readability
      ctx.strokeStyle = "rgba(4,4,14,0.85)";
      ctx.lineWidth = 3 / scale;
      ctx.lineJoin = "round";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(node.label, lx, ly);

      ctx.fillStyle = isSelected ? "#ffffff" : isHovered ? "#e8e8ff" : colorWithAlpha(cfg.color, 0.9);
      ctx.fillText(node.label, lx, ly);
    }

    ctx.globalAlpha = 1;
  });

  ctx.restore();

  // ── Hover tooltip (screen-space) ─────────────────────────────────────────────
  if (hoveredId && !selectedId) {
    const node = nodes.find((n) => n.id === hoveredId);
    if (node && visibleIds.has(node.id)) {
      const sx = node.x * scale + tx;
      const sy = node.y * scale + ty;
      const cfg = CATEGORY_CONFIG[node.category];

      const padX = 12, padY = 8;
      const lineH = 16;
      const lines = [
        { text: node.label, bold: true, size: 12 },
        { text: cfg.label, bold: false, size: 10, color: cfg.color },
        ...(node.tvl ? [{ text: `TVL: ${node.tvl}`, bold: false, size: 10 }] : []),
      ];
      const ttW = 130;
      const ttH = padY * 2 + lines.length * lineH + (lines.length - 1) * 2;

      let ttX = sx + node.radius * scale + 10;
      let ttY = sy - ttH / 2;

      // Keep in bounds
      if (ttX + ttW > W - 8) ttX = sx - node.radius * scale - ttW - 10;
      if (ttY < 8) ttY = 8;
      if (ttY + ttH > H - 8) ttY = H - ttH - 8;

      // Background
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#0a0a18";
      ctx.strokeStyle = colorWithAlpha(cfg.color, 0.4);
      ctx.lineWidth = 1;
      ctx.shadowBlur = 16;
      ctx.shadowColor = colorWithAlpha(cfg.color, 0.3);
      roundRect(ctx, ttX, ttY, ttW, ttH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Color accent bar
      ctx.fillStyle = cfg.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.roundRect(ttX, ttY, 3, ttH, [8, 0, 0, 8]);
      ctx.fill();

      ctx.globalAlpha = 1;
      let yy = ttY + padY + lineH * 0.5;
      lines.forEach((line) => {
        ctx.font = `${line.bold ? "700" : "400"} ${line.size}px system-ui, sans-serif`;
        ctx.fillStyle = (line as { color?: string }).color ?? "#d8d8f0";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(line.text, ttX + padX + 4, yy);
        yy += lineH + 2;
      });

      ctx.restore();
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScopeMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track which side of the canvas the last selection happened (for panel placement)
  const [panelSide, setPanelSide] = useState<"left" | "right">("right");

  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<SimEdge[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trRef = useRef<Transform>({ x: 0, y: 0, scale: 0.82 });
  const cameraTargetRef = useRef<CameraTarget>({ wx: 0, wy: 0, targetScale: 1.2, active: false });
  const hoveredRef = useRef<string | null>(null);
  const alphaRef = useRef(1.0);
  const sizeRef = useRef({ w: 800, h: 600 });
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const lastPinchDistRef = useRef(0);
  const isTwoFingerRef = useRef(false);
  const selectNodeRef = useRef<(id: string | null) => void>(() => {});

  const { activeCategories, activeChain, selectedNode, searchQuery, timeModifier, selectNode, setSearch } =
    useScopeStore();

  // Keep selectNodeRef in sync so the touch useEffect ([] deps) always calls the latest fn
  useEffect(() => { selectNodeRef.current = selectNode; }, [selectNode]);

  // Compute visible node count for empty state
  const visibleCount = NODES.filter((n) => {
    if (!activeCategories.includes(n.category)) return false;
    if (activeChain !== "all" && n.primaryChain !== activeChain && !n.chains.includes(activeChain)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
    }
    return true;
  }).length;

  const stateRef = useRef({ activeCategories, activeChain, selectedNode, searchQuery, timeModifier });
  useEffect(() => {
    stateRef.current = { activeCategories, activeChain, selectedNode, searchQuery, timeModifier };
  }, [activeCategories, activeChain, selectedNode, searchQuery, timeModifier]);

  // Deselect node if its category gets filtered out
  useEffect(() => {
    if (!selectedNode) return;
    const nodeData = NODES.find((n) => n.id === selectedNode);
    if (nodeData && !activeCategories.includes(nodeData.category)) {
      selectNode(null);
    }
  }, [activeCategories, selectedNode, selectNode]);

  // Smooth camera to node on selection change
  useEffect(() => {
    if (!selectedNode) {
      cameraTargetRef.current.active = false;
      return;
    }
    const node = nodesRef.current.find((n) => n.id === selectedNode);
    if (!node) return;
    const { w, h } = sizeRef.current;
    const targetScale = Math.min(2.2, Math.max(trRef.current.scale, 1.4));
    cameraTargetRef.current = {
      wx: node.x,
      wy: node.y,
      targetScale,
      active: true,
    };
  }, [selectedNode]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    const applySize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      sizeRef.current = { w: width, h: height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    applySize();

    // Stars
    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.2,
      o: Math.random() * 0.25 + 0.04,
    }));

    // Init nodes
    const { w, h } = sizeRef.current;
    nodesRef.current = NODES.map((node) => {
      const c = CLUSTER_POSITIONS[node.category];
      return {
        ...node,
        x: c.cx * w + (Math.random() - 0.5) * 140,
        y: c.cy * h + (Math.random() - 0.5) * 140,
        vx: 0, vy: 0,
        radius: nodeRadius(node),
      };
    });

    // Build edge references
    const nodeMap = new Map(nodesRef.current.map((n) => [n.id, n]));
    edgesRef.current = EDGES.map((e) => ({
      source: e.source,
      target: e.target,
      s: nodeMap.get(e.source)!,
      t: nodeMap.get(e.target)!,
    })).filter((e) => e.s && e.t);

    // Init particles (120, distributed across edges)
    const eLen = edgesRef.current.length;
    if (eLen > 0) {
      particlesRef.current = Array.from({ length: 120 }, (_, i) => ({
        edgeIdx: Math.floor((i / 120) * eLen),
        t: Math.random(),
        speed: 0.0015 + Math.random() * 0.003,
      }));
    }

    alphaRef.current = 1.0;

    const loop = () => {
      frameRef.current++;

      // Physics
      if (alphaRef.current > 0.004) {
        tick(nodesRef.current, edgesRef.current, w, h, alphaRef.current);
        alphaRef.current *= 0.9935;
      }

      // Advance particles
      const edges = edgesRef.current;
      particlesRef.current.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          // Occasionally jump to a different edge
          if (Math.random() < 0.3 && edges.length > 0) {
            p.edgeIdx = Math.floor(Math.random() * edges.length);
          }
        }
      });

      // Smooth camera lerp
      const cam = cameraTargetRef.current;
      if (cam.active) {
        const { w: cw, h: ch } = sizeRef.current;
        const targetX = cw / 2 - cam.wx * cam.targetScale;
        const targetY = ch / 2 - cam.wy * cam.targetScale;
        const lerp = 0.07;
        const cur = trRef.current;
        const newX = cur.x + (targetX - cur.x) * lerp;
        const newY = cur.y + (targetY - cur.y) * lerp;
        const newS = cur.scale + (cam.targetScale - cur.scale) * lerp;
        trRef.current = { x: newX, y: newY, scale: newS };
        if (Math.abs(newX - targetX) < 0.8 && Math.abs(newY - targetY) < 0.8) {
          cam.active = false;
        }
      }

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { activeCategories, activeChain, selectedNode, searchQuery, timeModifier } = stateRef.current;
        render(
          ctx,
          nodesRef.current,
          edgesRef.current,
          particlesRef.current,
          trRef.current,
          hoveredRef.current,
          selectedNode,
          searchQuery,
          activeCategories,
          activeChain,
          starsRef.current,
          frameRef.current,
          sizeRef.current.w,
          sizeRef.current.h,
          timeModifier,
        );
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => applySize());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  // ── Mouse helpers ────────────────────────────────────────────────────────
  const screenToWorld = (mx: number, my: number) => {
    const { x, y, scale } = trRef.current;
    return { wx: (mx - x) / scale, wy: (my - y) / scale };
  };

  const findNode = (mx: number, my: number): SimNode | null => {
    const { wx, wy } = screenToWorld(mx, my);
    let best: SimNode | null = null;
    let bestDist = Infinity;
    for (const node of nodesRef.current) {
      const d = Math.hypot(wx - node.x, wy - node.y);
      if (d < node.radius + 6 && d < bestDist) {
        best = node;
        bestDist = d;
      }
    }
    return best;
  };

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging.current) {
      const dx = mx - dragStart.current.mx;
      const dy = my - dragStart.current.my;
      if (Math.hypot(dx, dy) > 3) {
        didDrag.current = true;
        cameraTargetRef.current.active = false; // Cancel camera animation on drag
      }
      trRef.current = {
        ...trRef.current,
        x: dragStart.current.tx + dx,
        y: dragStart.current.ty + dy,
      };
      canvasRef.current!.style.cursor = "grabbing";
      return;
    }

    const hovered = findNode(mx, my);
    hoveredRef.current = hovered?.id ?? null;
    canvasRef.current!.style.cursor = hovered ? "pointer" : "grab";
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    didDrag.current = false;
    isDragging.current = true;
    dragStart.current = { mx, my, tx: trRef.current.x, ty: trRef.current.y };
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDragging.current = false;
      if (didDrag.current) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = findNode(mx, my);
      if (hit) {
        // Place panel on the side with more space
        setPanelSide(mx > rect.width * 0.55 ? "left" : "right");
        selectNode(stateRef.current.selectedNode === hit.id ? null : hit.id);
      } else {
        selectNode(null);
      }
    },
    [selectNode]
  );

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    cameraTargetRef.current.active = false;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    const newScale = Math.min(5, Math.max(0.12, trRef.current.scale * factor));
    const { x, y, scale } = trRef.current;
    const wx = (mx - x) / scale;
    const wy = (my - y) / scale;
    trRef.current = { scale: newScale, x: mx - wx * newScale, y: my - wy * newScale };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Touch support ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getRect = () => canvas.getBoundingClientRect();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const rect = getRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        isDragging.current = true;
        didDrag.current = false;
        isTwoFingerRef.current = false;
        dragStart.current = { mx, my, tx: trRef.current.x, ty: trRef.current.y };
        lastPinchDistRef.current = 0;
      } else if (e.touches.length === 2) {
        e.preventDefault();
        isDragging.current = false;
        isTwoFingerRef.current = true;
        cameraTargetRef.current.active = false;
        const t1 = e.touches[0], t2 = e.touches[1];
        lastPinchDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging.current && !isTwoFingerRef.current) {
        const rect = getRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        const dx = mx - dragStart.current.mx;
        const dy = my - dragStart.current.my;
        if (Math.hypot(dx, dy) > 4) {
          didDrag.current = true;
          cameraTargetRef.current.active = false;
        }
        trRef.current = { ...trRef.current, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy };
      } else if (e.touches.length === 2 && lastPinchDistRef.current > 0) {
        const rect = getRect();
        const t1 = e.touches[0], t2 = e.touches[1];
        const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
        const factor = newDist / lastPinchDistRef.current;
        const newScale = Math.min(5, Math.max(0.12, trRef.current.scale * factor));
        const { x, y, scale } = trRef.current;
        const wx = (midX - x) / scale;
        const wy = (midY - y) / scale;
        trRef.current = { scale: newScale, x: midX - wx * newScale, y: midY - wy * newScale };
        lastPinchDistRef.current = newDist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) isTwoFingerRef.current = false;
      if (e.touches.length === 0) {
        isDragging.current = false;
        lastPinchDistRef.current = 0;
        // Tap = select node (only if no drag happened)
        if (!didDrag.current && e.changedTouches.length === 1) {
          const rect = getRect();
          const mx = e.changedTouches[0].clientX - rect.left;
          const my = e.changedTouches[0].clientY - rect.top;
          const hit = (() => {
            const { wx, wy } = (() => {
              const { x, y, scale } = trRef.current;
              return { wx: (mx - x) / scale, wy: (my - y) / scale };
            })();
            let best: SimNode | null = null;
            let bestDist = Infinity;
            for (const node of nodesRef.current) {
              const d = Math.hypot(wx - node.x, wy - node.y);
              if (d < node.radius + 10 && d < bestDist) { best = node; bestDist = d; }
            }
            return best;
          })();
          if (hit) {
            selectNodeRef.current(stateRef.current.selectedNode === hit.id ? null : hit.id);
          } else {
            selectNodeRef.current(null);
          }
        }
      }
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const zoomButton = (dir: "in" | "out" | "reset") => {
    cameraTargetRef.current.active = false;
    if (dir === "reset") {
      trRef.current = { x: 0, y: 0, scale: 0.82 };
      return;
    }
    const f = dir === "in" ? 1.25 : 0.8;
    const { x, y, scale } = trRef.current;
    const cx = sizeRef.current.w / 2;
    const cy = sizeRef.current.h / 2;
    const newScale = Math.min(5, Math.max(0.12, scale * f));
    const wx = (cx - x) / scale;
    const wy = (cy - y) / scale;
    trRef.current = { scale: newScale, x: cx - wx * newScale, y: cy - wy * newScale };
  };

  const selectedNodeData = selectedNode
    ? NODES.find((n) => n.id === selectedNode) ?? null
    : null;

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: "#04040e" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          isDragging.current = false;
          hoveredRef.current = null;
        }}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-10">
        {(["in", "out", "reset"] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => zoomButton(dir)}
            title={dir === "reset" ? "Reset view" : `Zoom ${dir}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a1a]/80 border border-white/[0.1] text-[#6b6b80] hover:text-white hover:border-white/25 transition-all backdrop-blur-sm hover:bg-[#12122a]/80"
          >
            {dir === "in" ? <ZoomIn size={13} /> : dir === "out" ? <ZoomOut size={13} /> : <Maximize2 size={13} />}
          </button>
        ))}
      </div>

      {/* Stats footer */}
      <div className="absolute bottom-6 left-4 flex items-center gap-3 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a0a1a]/70 border border-white/[0.06] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="text-[10px] text-[#4a4a6a]">
            {NODES.length} protocols · {Object.keys(CATEGORY_CONFIG).length} categories
          </span>
        </div>
        {selectedNode && (
          <span className="text-[10px] text-[#5a5a7a] px-2 py-1 rounded-md bg-[#0a0a1a]/60 backdrop-blur-sm">
            Click canvas to deselect
          </span>
        )}
      </div>

      {/* Empty state */}
      {visibleCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-3 text-center pointer-events-auto">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#7c6af718", border: "1px solid #7c6af730" }}>
              <Search size={20} className="text-[#7c6af7]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#6e7681]">No protocols found</p>
              <p className="text-[11px] text-[#484f58] mt-0.5">Try clearing your search or filters</p>
            </div>
            <button
              onClick={() => setSearch("")}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "#7c6af718", color: "#7c6af7", border: "1px solid #7c6af730" }}
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Node panel */}
      {selectedNodeData && (
        <NodePanel node={selectedNodeData} onClose={() => selectNode(null)} side={panelSide} />
      )}
    </div>
  );
}
