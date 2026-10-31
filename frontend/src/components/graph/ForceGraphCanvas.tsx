import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEffects';

export interface GraphNode {
  id: string;
  label: string;
  type: 'CUSTOMER' | 'DEVICE' | 'ACCOUNT' | 'RECIPIENT_VPA' | string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | string;
  details?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  pinned?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  isThreat?: boolean;
}

interface ForceGraphCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNodeId?: string | null;
  onSelectNode: (node: GraphNode) => void;
}

export const ForceGraphCanvas: React.FC<ForceGraphCanvasProps> = ({
  nodes: initialNodes,
  links: initialLinks,
  selectedNodeId,
  onSelectNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation parameters & state
  const [isPaused, setIsPaused] = useState(false);
  const [repulsion, setRepulsion] = useState(1200);
  const [springLength, setSpringLength] = useState(110);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Physics simulation data structures
  const simNodesRef = useRef<any[]>([]);
  const simLinksRef = useRef<any[]>([]);
  const draggedNodeRef = useRef<any | null>(null);
  const isDraggingRef = useRef(false);

  // Color resolver based on entity type and risk
  const getNodeColor = (type: string, risk: string) => {
    if (risk === 'CRITICAL') return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
    if (risk === 'HIGH') return { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
    if (type === 'DEVICE') return { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' };
    if (type === 'RECIPIENT_VPA') return { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' };
    if (type === 'ACCOUNT') return { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.3)' };
    return { main: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.2)' };
  };

  // Initialize or update nodes with layout positions
  useEffect(() => {
    if (!initialNodes || initialNodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 700;
    const height = containerRef.current?.clientHeight || 450;
    const centerX = width / 2;
    const centerY = height / 2;

    const existingMap = new Map<string, any>();
    simNodesRef.current.forEach((n) => existingMap.set(n.id, n));

    const total = initialNodes.length;
    simNodesRef.current = initialNodes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      const angle = (idx / total) * Math.PI * 2;
      const radius = 90 + Math.random() * 80;

      const baseR = n.type === 'DEVICE' ? 24 : n.type === 'RECIPIENT_VPA' ? 22 : 18;
      const colors = getNodeColor(n.type, n.riskLevel);

      return {
        ...n,
        x: existing ? existing.x : centerX + Math.cos(angle) * radius,
        y: existing ? existing.y : centerY + Math.sin(angle) * radius,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
        radius: baseR,
        color: colors.main,
        glowColor: colors.glow,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    simLinksRef.current = initialLinks.map((l) => ({
      ...l,
      isThreat: l.relationship.includes('CLUSTER') || l.relationship.includes('MULE') || l.isThreat,
      packetProgress: Math.random(),
    }));
  }, [initialNodes, initialLinks]);

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const stepPhysics = (width: number, height: number) => {
      if (isPaused) return;

      const nodes = simNodesRef.current;
      const links = simLinksRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Coulomb Repulsion between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);

          if (dist < 320) {
            const force = repulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== draggedNodeRef.current) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== draggedNodeRef.current) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Hooke's Spring Law for Links
      const nodeMap = new Map<string, any>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      links.forEach((l) => {
        const s = nodeMap.get(l.source);
        const t = nodeMap.get(l.target);
        if (!s || !t) return;

        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const springForce = (dist - springLength) * 0.035;

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (s !== draggedNodeRef.current) {
          s.vx += fx;
          s.vy += fy;
        }
        if (t !== draggedNodeRef.current) {
          t.vx -= fx;
          t.vy -= fy;
        }
      });

      // 3. Center Gravity & Damping Velocity Update
      nodes.forEach((n) => {
        if (n === draggedNodeRef.current) return;

        // Subtle pull toward canvas center
        n.vx += (centerX - n.x) * 0.003;
        n.vy += (centerY - n.y) * 0.003;

        // Friction damping
        n.vx *= 0.86;
        n.vy *= 0.86;

        n.x += n.vx;
        n.y += n.vy;

        // Boundary constraints
        n.x = Math.max(n.radius + 15, Math.min(width - n.radius - 15, n.x));
        n.y = Math.max(n.radius + 15, Math.min(height - n.radius - 15, n.y));
      });
    };

    const render = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 700;
      const height = rect?.height || 450;

      stepPhysics(width, height);

      ctx.clearRect(0, 0, width, height);

      // Subtle Background Matrix Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const nodeMap = new Map<string, any>();
      simNodesRef.current.forEach((n) => nodeMap.set(n.id, n));

      // Draw Links & Traveling Threat Packets
      simLinksRef.current.forEach((l) => {
        const s = nodeMap.get(l.source);
        const t = nodeMap.get(l.target);
        if (!s || !t) return;

        // Draw Edge Line
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = l.isThreat ? 'rgba(239, 68, 68, 0.55)' : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = l.isThreat ? 2 : 1;
        if (l.isThreat) {
          ctx.setLineDash([5, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Relationship text pill on edge midpoint
        const midX = (s.x + t.x) / 2;
        const midY = (s.y + t.y) / 2;
        ctx.font = '8px monospace';
        const labelText = l.relationship;
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = l.isThreat ? 'rgba(69, 10, 10, 0.85)' : 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 6, textWidth + 8, 12);
        ctx.strokeStyle = l.isThreat ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.3)';
        ctx.strokeRect(midX - textWidth / 2 - 4, midY - 6, textWidth + 8, 12);

        ctx.fillStyle = l.isThreat ? '#fca5a5' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, midX, midY);

        // Animate Signal Packet along the link
        l.packetProgress = (l.packetProgress + 0.008) % 1;
        const pktX = s.x + (t.x - s.x) * l.packetProgress;
        const pktY = s.y + (t.y - s.y) * l.packetProgress;

        ctx.beginPath();
        ctx.arc(pktX, pktY, l.isThreat ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = l.isThreat ? '#ef4444' : '#38bdf8';
        ctx.shadowColor = l.isThreat ? '#ef4444' : '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      const now = performance.now() * 0.002;
      simNodesRef.current.forEach((n) => {
        const isSelected = selectedNodeId === n.id;
        const isHovered = hoveredNode?.id === n.id;
        const isCritical = n.riskLevel === 'CRITICAL';

        // Outer Pulsing Glow Ring for Critical or Selected Nodes
        if (isCritical || isSelected || isHovered) {
          const pulseR = n.radius + 6 + Math.sin(now + n.pulseOffset) * 4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#fbbf24' : n.glowColor;
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.stroke();
        }

        // Node Body Background
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Node Border Ring
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#fbbf24' : n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isSelected ? 12 : 5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Node Icon or Identifier Inside
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const glyph = n.type === 'DEVICE' ? 'DEV' : n.type === 'RECIPIENT_VPA' ? 'VPA' : n.type === 'ACCOUNT' ? 'ACC' : 'USR';
        ctx.fillText(glyph, n.x, n.y);

        // Node Label Underneath
        ctx.font = '10px monospace';
        ctx.fillStyle = isSelected ? '#fbbf24' : '#e2e8f0';
        ctx.fillText(n.label, n.x, n.y + n.radius + 12);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused, repulsion, springLength, selectedNodeId, hoveredNode]);

  // Mouse Interaction Handlers for Dragging & Selection
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    const nodes = simNodesRef.current;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
        draggedNodeRef.current = n;
        isDraggingRef.current = true;
        sounds.playClick();
        onSelectNode(n);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);

    if (isDraggingRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    // Hover detection
    const nodes = simNodesRef.current;
    let found: GraphNode | null = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  const handleResetPositions = () => {
    const width = containerRef.current?.clientWidth || 700;
    const height = containerRef.current?.clientHeight || 450;
    const total = simNodesRef.current.length;

    simNodesRef.current.forEach((n, idx) => {
      const angle = (idx / total) * Math.PI * 2;
      const radius = 90 + Math.random() * 80;
      n.x = width / 2 + Math.cos(angle) * radius;
      n.y = height / 2 + Math.sin(angle) * radius;
      n.vx = 0;
      n.vy = 0;
    });
    sounds.playClick();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[380px] bg-[#080a0f] rounded-lg border border-veyra-800 overflow-hidden flex flex-col">
      {/* HUD OVERLAY BAR */}
      <div className="absolute top-2.5 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-3xs font-mono text-slate-400 bg-veyra-950/90 px-2 py-1 rounded border border-veyra-800 shadow-md">
            PHYSICS: <strong className="text-amber-400">{isPaused ? 'PAUSED' : '60FPS ACTIVE'}</strong>
          </span>
          <span className="text-3xs font-mono text-slate-400 bg-veyra-950/90 px-2 py-1 rounded border border-veyra-800 shadow-md hidden sm:inline">
            ENTITIES: <strong className="text-slate-200">{simNodesRef.current.length}</strong>
          </span>
        </div>

        {/* MINIMAL CONTROLS (TEXT PILLS WITHOUT CLUTTER) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2.5 py-1 text-3xs font-mono font-bold rounded bg-veyra-900/90 hover:bg-veyra-800 text-slate-200 border border-veyra-750 transition-colors shadow"
          >
            {isPaused ? 'RESUME SIM' : 'FREEZE FRAME'}
          </button>
          <button
            onClick={handleResetPositions}
            className="px-2.5 py-1 text-3xs font-mono font-bold rounded bg-veyra-900/90 hover:bg-veyra-800 text-slate-200 border border-veyra-750 transition-colors shadow"
          >
            RE-CLUSTER
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full flex-1 ${hoveredNode ? 'cursor-pointer' : 'cursor-grab'} active:cursor-grabbing`}
      />

      {/* FOOTER LEGEND STRIP */}
      <div className="border-t border-veyra-800/80 bg-veyra-950/90 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-3xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200" /> Customer</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Rooted HW</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Account</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Mule Recipient</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">DRAG NODES TO STRETCH · CLICK TO INSPECT FORENSIC EVIDENCE</span>
      </div>
    </div>
  );
};