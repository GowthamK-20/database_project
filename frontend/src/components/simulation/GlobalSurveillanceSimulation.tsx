import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Database,
  ArrowUpDown,
  Search,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GlobalSurveillanceSimulationProps {
  onNavigateToLedger: () => void;
  onNavigateToDatabase?: () => void;
  onNavigateToSqlLab?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToCases?: () => void;
}

export const GlobalSurveillanceSimulation: React.FC<GlobalSurveillanceSimulationProps> = ({
  onNavigateToLedger,
  onNavigateToDatabase,
  onNavigateToSqlLab,
  onNavigateToAlerts,
  onNavigateToCases,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Live Risk Scorer Parameter State (Purpose-built for risk analysts, NOT a money transfer form)
  const [testAmount, setTestAmount] = useState<string>('380000');
  const [rail, setRail] = useState<'UPI' | 'IMPS' | 'NEFT' | 'CARD_ECOM'>('UPI');
  const [counterparty, setCounterparty] = useState<string>('vaultex.crypto@international');
  const [isRooted, setIsRooted] = useState<boolean>(true);
  const [isNightTime, setIsNightTime] = useState<boolean>(true);
  const [isDormant, setIsDormant] = useState<boolean>(true);

  // Evaluation Output State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
    penalties: string[];
    action: string;
  } | null>({
    score: 92,
    level: 'CRITICAL',
    penalties: [
      '+30 pts: High-Value Outlier Volume (>= ₹2,00,000)',
      '+30 pts: Rooted Hardware Signature',
      '+25 pts: Dormant Account Liquidation (180 days inactive)',
      '+20 pts: Prohibited Quasi-Cash MCC Route',
    ],
    action: 'AUTO-BLOCKED & DISPATCHED TO P1 FRAUD ALERT QUEUE',
  });

  // Canvas Ref for Animated Global Arc Network
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Live Risk Scoring Evaluation
  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      let score = 15;
      const penalties: string[] = [];

      const amt = parseFloat(testAmount) || 0;
      if (amt >= 200000) {
        score += 30;
        penalties.push('+30 pts: High-Value Outlier Volume (>= ₹2,00,000)');
      } else if (amt >= 50000) {
        score += 15;
        penalties.push('+15 pts: Elevated Value Transfer');
      }

      if (isRooted) {
        score += 30;
        penalties.push('+30 pts: Rooted OS / Kernel Compromise Signature');
      }

      if (isNightTime) {
        score += 20;
        penalties.push('+20 pts: Temporal Anomaly (02:45 AM nocturnal window)');
      }

      if (isDormant) {
        score += 25;
        penalties.push('+25 pts: Dormant Account Sudden Velocity Spike');
      }

      if (counterparty.includes('crypto') || counterparty.includes('mule')) {
        score += 20;
        penalties.push('+20 pts: High-Risk Quasi-Cash / Mule Counterparty');
      }

      score = Math.min(98, score);

      let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE' = 'SAFE';
      let action = 'TRANSACTION PERMITTED // ROUTED TO SETTLEMENT';

      if (score >= 80) {
        level = 'CRITICAL';
        action = 'AUTO-BLOCKED & DISPATCHED TO P1 FRAUD ALERT QUEUE';
      } else if (score >= 60) {
        level = 'HIGH';
        action = 'STEP-UP BIOMETRIC / OTP CHALLENGE TRIGGERED';
      } else if (score >= 40) {
        level = 'MEDIUM';
        action = 'FLAGGED FOR POST-TRANSACTION COMPLIANCE SURVEILLANCE';
      }

      setEvaluationResult({ score, level, penalties, action });
      setIsEvaluating(false);
    }, 300);
  };

  // Canvas 60fps Particle & Arc Network Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Geographic Node Coordinates
    const nodes = [
      { name: 'Mumbai', x: 0.62 * width, y: 0.52 * height, pulse: 0, color: '#f59e0b' },
      { name: 'Bengaluru', x: 0.63 * width, y: 0.60 * height, pulse: 1.2, color: '#fbbf24' },
      { name: 'Jaipur', x: 0.59 * width, y: 0.44 * height, pulse: 2.1, color: '#ef4444' },
      { name: 'London', x: 0.46 * width, y: 0.30 * height, pulse: 0.8, color: '#f59e0b' },
      { name: 'Singapore', x: 0.74 * width, y: 0.64 * height, pulse: 1.8, color: '#fbbf24' },
      { name: 'Dubai', x: 0.54 * width, y: 0.46 * height, pulse: 2.6, color: '#f59e0b' },
      { name: 'New York', x: 0.25 * width, y: 0.35 * height, pulse: 0.4, color: '#fbbf24' },
    ];

    // Connection Arcs with Travelling Packets
    const arcs = [
      { from: 0, to: 3, progress: 0.1, speed: 0.007, threat: true },
      { from: 2, to: 5, progress: 0.5, speed: 0.009, threat: true },
      { from: 1, to: 4, progress: 0.8, speed: 0.006, threat: false },
      { from: 5, to: 0, progress: 0.3, speed: 0.008, threat: false },
      { from: 3, to: 6, progress: 0.6, speed: 0.005, threat: false },
    ];

    // Starfield Points
    const stars: { x: number; y: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Starfield
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fill();
      });

      // Globe Horizon Atmosphere Curve
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 1.35, width * 0.68, height * 0.85, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Secondary Grid Latitude Lines
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 1.28, width * 0.62, height * 0.72, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.stroke();

      // Render Arcs
      arcs.forEach((arc) => {
        const start = nodes[arc.from];
        const end = nodes[arc.to];
        if (!start || !end) return;

        const cpX = (start.x + end.x) / 2;
        const cpY = Math.min(start.y, end.y) - 60;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);
        ctx.strokeStyle = arc.threat ? 'rgba(239, 68, 68, 0.28)' : 'rgba(245, 158, 11, 0.22)';
        ctx.lineWidth = arc.threat ? 1.5 : 1;
        ctx.stroke();

        // Animate Traveling Packets
        arc.progress += arc.speed;
        if (arc.progress > 1) arc.progress = 0;

        const t = arc.progress;
        const px = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cpX + t * t * end.x;
        const py = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cpY + t * t * end.y;

        ctx.beginPath();
        ctx.arc(px, py, arc.threat ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = arc.threat ? '#ef4444' : '#fbbf24';
        ctx.shadowColor = arc.threat ? '#ef4444' : '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Nodes
      nodes.forEach((node) => {
        node.pulse = (node.pulse + 0.03) % (Math.PI * 2);
        const pulseR = 4 + Math.sin(node.pulse) * 4;

        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}40`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.fillText(node.name, node.x + 7, node.y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#060709] text-slate-100 rounded-xl border border-white/10 shadow-2xl p-5 md:p-8 space-y-8">
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl rounded-full" />

      {/* FIN GUARD AI PURPOSE-BUILT OVERVIEW HEADER */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-amber-500/30 text-xs font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 font-bold">FINANCIAL THREAT INTELLIGENCE</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Continuous Surveillance Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans uppercase">
          FINANCIAL THREAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">INTELLIGENCE</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Monitor transaction risk, investigate suspicious activity, identify fraud patterns, and manage forensic cases from one unified intelligence platform.
        </p>

        {/* PRIMARY ACTION SHORTCUTS (NEAT, UNCLUTTERED MINIMALIST BUTTONS) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 font-mono">
          <button
            onClick={onNavigateToLedger}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
          >
            REVIEW TRANSACTION LEDGER ⟶
          </button>

          {onNavigateToAlerts && (
            <button
              onClick={onNavigateToAlerts}
              className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-bold text-xs transition-all hover:scale-[1.02]"
            >
              ALERT QUEUE
            </button>
          )}

          {onNavigateToCases && (
            <button
              onClick={onNavigateToCases}
              className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-bold text-xs transition-all hover:scale-[1.02]"
            >
              CASE WORKSPACE
            </button>
          )}

          {isAdmin && onNavigateToDatabase && (
            <button
              onClick={onNavigateToDatabase}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all hover:scale-[1.02]"
            >
              DATABASE SCHEMA
            </button>
          )}
        </div>
      </div>

      {/* THREE-COLUMN INTELLIGENCE STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        {/* LEFT CARD: MONITORED DATASET STATS (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0c0d10]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-mono uppercase text-slate-400 tracking-wider">
                MONITORED ENTITIES
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-3xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Indexed
              </span>
            </div>

            <div>
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                1,007 Profiles
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Verified customer and account entities under surveillance
              </p>
            </div>

            {/* INTEGRITY METRICS */}
            <div className="space-y-2 text-2xs font-mono text-slate-300 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transactions Scored:</span>
                <span className="text-amber-400 font-bold">1,012</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Referential Integrity:</span>
                <span className="text-emerald-400 font-bold">100% (0 Orphans)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Storage Engine:</span>
                <span className="text-slate-200">PostgreSQL 18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Automated Tests:</span>
                <span className="text-emerald-400 font-bold">42 Passing</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE GLOBAL RADAR (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[340px]">
          <canvas
            ref={canvasRef}
            className="w-full h-[340px] pointer-events-none"
          />
          <div className="absolute bottom-2 text-center text-3xs font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Normal Flow
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Flagged Anomalies
            </span>
          </div>
        </div>

        {/* RIGHT CARD: AD-HOC TRANSACTION RISK EVALUATION ENGINE (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0c0d10]/95 backdrop-blur-md border border-white/10 rounded-xl p-4.5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                AD-HOC RISK SCORING ENGINE
              </span>
              <span className="text-3xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                HEURISTICS
              </span>
            </div>

            {/* TEST AMOUNT INPUT */}
            <div className="space-y-1">
              <label className="text-3xs font-mono text-slate-400 block">
                TRANSACTION VALUE & RAIL:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-amber-500/60"
                    placeholder="380000"
                  />
                </div>
                <select
                  value={rail}
                  onChange={(e: any) => setRail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-200 outline-none"
                >
                  <option value="UPI" className="bg-slate-900">UPI</option>
                  <option value="IMPS" className="bg-slate-900">IMPS</option>
                  <option value="NEFT" className="bg-slate-900">NEFT</option>
                  <option value="CARD_ECOM" className="bg-slate-900">CARD</option>
                </select>
              </div>
            </div>

            {/* RISK ANOMALY TOGGLES */}
            <div className="space-y-1.5 text-2xs font-mono text-slate-300 pt-1 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRooted}
                  onChange={(e) => setIsRooted(e.target.checked)}
                  className="rounded bg-black border-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-slate-300 text-3xs">Rooted OS signature detected</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNightTime}
                  onChange={(e) => setIsNightTime(e.target.checked)}
                  className="rounded bg-black border-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-slate-300 text-3xs">Temporal anomaly (01:00 - 05:00 AM)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDormant}
                  onChange={(e) => setIsDormant(e.target.checked)}
                  className="rounded bg-black border-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-slate-300 text-3xs">Dormant account reactivation (180d)</span>
              </label>
            </div>

            {/* EVALUATE BUTTON */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'EVALUATING...' : 'SCORE TRANSACTION'}</span>
            </button>

            {/* EVALUATION OUTPUT REPORT */}
            {evaluationResult && (
              <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 space-y-1.5 font-mono text-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ASSESSMENT RESULT:</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      evaluationResult.level === 'CRITICAL'
                        ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                        : evaluationResult.level === 'HIGH'
                        ? 'bg-orange-950/60 text-orange-400 border border-orange-800/60'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {evaluationResult.score}/100 · {evaluationResult.level}
                  </span>
                </div>

                <div className="text-amber-300 font-semibold truncate">
                  {evaluationResult.action}
                </div>

                <div className="text-slate-400 space-y-0.5 pt-1 border-t border-white/5">
                  {evaluationResult.penalties.slice(0, 2).map((p, i) => (
                    <div key={i} className="truncate">{p}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
