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
  ArrowUpDown
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

  // Live Simulator Card State
  const [sendAmount, setSendAmount] = useState<string>('380000');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [channel, setChannel] = useState<'UPI' | 'IMPS' | 'NEFT' | 'RTGS'>('UPI');
  const [recipient, setRecipient] = useState<string>('vaultex.crypto@international');
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
      '+30 pts: High-Value Outlier Volume',
      '+30 pts: Rooted Hardware Signature',
      '+25 pts: Dormant Account Liquidation (180 days)',
      '+20 pts: Prohibited Quasi-Cash MCC',
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

      const amt = parseFloat(sendAmount) || 0;
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
        penalties.push('+20 pts: Temporal Anomaly (02:45 AM nocturnal breach)');
      }

      if (isDormant) {
        score += 25;
        penalties.push('+25 pts: Dormant Account Sudden Inflow/Outflow');
      }

      if (recipient.includes('crypto') || recipient.includes('mule')) {
        score += 20;
        penalties.push('+20 pts: Prohibited Quasi-Cash / Mule Counterparty');
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
    }, 400);
  };

  // Canvas 60fps Particle & Arc Network Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 380);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 380;
    };
    window.addEventListener('resize', handleResize);

    // Geographic Node Coordinates (projected onto canvas)
    const nodes = [
      { name: 'Mumbai', x: 0.62 * width, y: 0.52 * height, pulse: 0, color: '#a3e635' },
      { name: 'Bengaluru', x: 0.63 * width, y: 0.60 * height, pulse: 1.2, color: '#a3e635' },
      { name: 'Jaipur', x: 0.59 * width, y: 0.44 * height, pulse: 2.1, color: '#f43f5e' },
      { name: 'London', x: 0.46 * width, y: 0.30 * height, pulse: 0.8, color: '#f59e0b' },
      { name: 'Singapore', x: 0.74 * width, y: 0.64 * height, pulse: 1.8, color: '#38bdf8' },
      { name: 'Dubai', x: 0.54 * width, y: 0.46 * height, pulse: 2.6, color: '#a3e635' },
      { name: 'New York', x: 0.25 * width, y: 0.35 * height, pulse: 0.4, color: '#38bdf8' },
    ];

    // Connection Arcs with Travelling Packets
    const arcs = [
      { from: 0, to: 3, progress: 0.1, speed: 0.007, threat: true }, // Mumbai -> London
      { from: 2, to: 5, progress: 0.5, speed: 0.009, threat: true }, // Jaipur -> Dubai
      { from: 1, to: 4, progress: 0.8, speed: 0.006, threat: false }, // Bengaluru -> Singapore
      { from: 5, to: 0, progress: 0.3, speed: 0.008, threat: false }, // Dubai -> Mumbai
      { from: 3, to: 6, progress: 0.6, speed: 0.005, threat: false }, // London -> New York
    ];

    let t = 0;

    const render = () => {
      t += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Draw faint world continent outline dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < width; x += 18) {
        for (let y = 0; y < height; y += 18) {
          const distFromCenter = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height * 0.7, 2));
          if (distFromCenter > 380 && distFromCenter < 650) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Curved Horizon Atmosphere Line
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 1.05, width * 0.6, height * 0.6, 0, Math.PI, 0, true);
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Connection Arcs
      arcs.forEach((arc) => {
        const p1 = nodes[arc.from];
        const p2 = nodes[arc.to];

        const cx = (p1.x + p2.x) / 2;
        const cy = Math.min(p1.y, p2.y) - 60;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.strokeStyle = arc.threat ? 'rgba(244, 63, 94, 0.25)' : 'rgba(163, 230, 53, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Travelling Packet Particle
        arc.progress = (arc.progress + arc.speed) % 1;
        const pt = arc.progress;
        const px = (1 - pt) * (1 - pt) * p1.x + 2 * (1 - pt) * pt * cx + pt * pt * p2.x;
        const py = (1 - pt) * (1 - pt) * p1.y + 2 * (1 - pt) * pt * cy + pt * pt * p2.y;

        ctx.beginPath();
        ctx.arc(px, py, arc.threat ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = arc.threat ? '#f43f5e' : '#a3e635';
        ctx.shadowColor = arc.threat ? '#f43f5e' : '#a3e635';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Financial Capital Nodes
      nodes.forEach((node) => {
        const pulseSize = 4 + Math.sin(t + node.pulse) * 3;

        // Outer Glow Pulse
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8 + pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = node.color === '#f43f5e' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(163, 230, 53, 0.15)';
        ctx.fill();

        // Inner Core Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(node.name, node.x + 8, node.y + 3);
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
    <div className="relative overflow-hidden bg-[#050505] text-slate-100 rounded-lg border border-white/5 shadow-2xl p-4 md:p-8 space-y-8">
      {/* BACKGROUND AMBIENT RADIAL LIGHT STREAKS */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-lime-500/10 via-lime-500/5 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-10 left-1/4 w-96 h-96 bg-lime-400/5 blur-[120px] rounded-full" />

      {/* TOP PILL BADGE */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-slate-300 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-lime-300 font-semibold">Fast. Secure. Institutional.</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">PostgreSQL 18 Real-Time Surveillance</span>
        </div>
      </div>

      {/* MASSIVE HERO HEADLINE (MATCHING REFERENCE EXACTLY) */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-display">
          TRANS<span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-lime-300 to-emerald-400">FER</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
          Real-time institutional transaction monitoring, automated heuristic scoring, and fraud defense running live on native PostgreSQL 18.
        </p>

        {/* PRIMARY HERO CTA BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateToLedger}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:scale-105"
          >
            <span>Surveillance Ledger (1,012)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isAdmin ? (
            <>
              <button
                onClick={onNavigateToDatabase}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-200 font-semibold text-xs transition-all hover:scale-105"
              >
                <Database className="w-4 h-4 text-blue-400" />
                <span>[ADMIN] PostgreSQL Schema (16 Tables)</span>
              </button>

              <button
                onClick={onNavigateToSqlLab}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>[ADMIN] Analytical SQL Lab (0.53ms)</span>
              </button>
            </>
          ) : (
            <>
              {onNavigateToAlerts && (
                <button
                  onClick={onNavigateToAlerts}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-xs transition-all hover:scale-105"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Alert SLA Queue (3 Critical)</span>
                </button>
              )}

              {onNavigateToCases && (
                <button
                  onClick={onNavigateToCases}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-xs transition-all hover:scale-105"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Forensic Case Dockets</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* THREE-COLUMN SIMULATION STAGE (LEFT METRIC CARD + CENTER GLOBE + RIGHT SIMULATOR CARD) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
        {/* LEFT FLOATING METRIC CARD (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0c0d10]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-mono uppercase text-slate-400 tracking-wider">
                ACTIVE ENTITIES
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-3xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                Live
              </span>
            </div>

            <div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                1,007+
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Verified customer & account profiles in PostgreSQL 18
              </p>
            </div>

            {/* AVATAR CLUSTERS */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-lime-500 to-emerald-400 border-2 border-black flex items-center justify-center text-3xs font-bold text-black">
                  SR
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 border-2 border-black flex items-center justify-center text-3xs font-bold text-black">
                  VM
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-400 border-2 border-black flex items-center justify-center text-3xs font-bold text-black">
                  RG
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center text-3xs font-mono font-bold text-lime-400">
                  +1K
                </div>
              </div>
              <span className="text-3xs font-mono text-slate-400">
                100% Referential Integrity
              </span>
            </div>

            {/* QUICK TELEMETRY LIST */}
            <div className="space-y-1.5 text-3xs font-mono text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Transactions Scored:</span>
                <span className="text-slate-200 font-bold">1,012</span>
              </div>
              <div className="flex justify-between">
                <span>Query Engine Latency:</span>
                <span className="text-lime-400 font-bold">0.53 ms</span>
              </div>
              <div className="flex justify-between">
                <span>Test Suite Validation:</span>
                <span className="text-emerald-400 font-bold">42 Passed</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE GLOBAL MAP ANIMATION (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[360px]">
          <canvas
            ref={canvasRef}
            className="w-full h-[380px] pointer-events-none"
          />
          <div className="absolute bottom-2 text-center text-3xs font-mono text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1 text-lime-400">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              Authorized Traffic
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Intercepted Anomalies
            </span>
          </div>
        </div>

        {/* RIGHT LIVE TRANSFER & HEURISTIC RISK SCORER CARD (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0c0d10]/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-lime-400" />
                LIVE TRANSFER RISK EVALUATOR
              </span>
              <span className="text-3xs font-mono bg-lime-500/10 text-lime-400 px-2 py-0.5 rounded-full border border-lime-500/30">
                ACTIVE HEURISTICS
              </span>
            </div>

            {/* SEND AMOUNT INPUT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-3xs font-mono text-slate-400">
                <span>YOU SEND:</span>
                <span className="text-slate-500">MAX: ₹10,00,000</span>
              </div>
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full bg-transparent font-mono text-base font-bold text-white outline-none"
                  placeholder="380000"
                />
                <select
                  value={currency}
                  onChange={(e: any) => setCurrency(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 outline-none"
                >
                  <option value="INR" className="bg-slate-900">INR (₹)</option>
                  <option value="USD" className="bg-slate-900">USD ($)</option>
                  <option value="EUR" className="bg-slate-900">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* RECIPIENT & CHANNEL */}
            <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">RAIL:</span>
                <select
                  value={channel}
                  onChange={(e: any) => setChannel(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                >
                  <option value="UPI" className="bg-slate-900">UPI (Instant)</option>
                  <option value="IMPS" className="bg-slate-900">IMPS 24x7</option>
                  <option value="NEFT" className="bg-slate-900">NEFT Batch</option>
                  <option value="RTGS" className="bg-slate-900">RTGS Gross</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">RECIPIENT VPA:</span>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none truncate"
                />
              </div>
            </div>

            {/* SIMULATED THREAT INDICATORS TOGGLES */}
            <div className="space-y-1.5 pt-1">
              <span className="text-3xs font-mono uppercase text-slate-400 font-semibold block">
                SIMULATE SUSPICIOUS VECTORS:
              </span>
              <div className="grid grid-cols-3 gap-1 font-mono text-3xs">
                <button
                  onClick={() => setIsRooted(!isRooted)}
                  className={`py-1 px-1.5 rounded-lg border text-center transition-colors ${
                    isRooted
                      ? 'bg-red-950/60 border-red-500/60 text-red-300 font-bold'
                      : 'bg-black/40 border-white/5 text-slate-500'
                  }`}
                >
                  {isRooted ? 'Rooted OS: ON' : 'Rooted: OFF'}
                </button>

                <button
                  onClick={() => setIsNightTime(!isNightTime)}
                  className={`py-1 px-1.5 rounded-lg border text-center transition-colors ${
                    isNightTime
                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-black/40 border-white/5 text-slate-500'
                  }`}
                >
                  {isNightTime ? 'Night: 02:45 AM' : 'Day: Normal'}
                </button>

                <button
                  onClick={() => setIsDormant(!isDormant)}
                  className={`py-1 px-1.5 rounded-lg border text-center transition-colors ${
                    isDormant
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 font-bold'
                      : 'bg-black/40 border-white/5 text-slate-500'
                  }`}
                >
                  {isDormant ? 'Dormant: 180d' : 'Dormant: OFF'}
                </button>
              </div>
            </div>

            {/* EVALUATE BUTTON */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SCORING RISK HEURISTICS...</span>
                </>
              ) : (
                <>
                  <span>EVALUATE & SCORE TRANSFER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* REAL-TIME EVALUATION RESULTS BOX */}
            {evaluationResult && (
              <div className="bg-black/80 rounded-xl p-3 border border-white/10 space-y-2 text-2xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">RISK ASSESSMENT:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{evaluationResult.score}/100</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-3xs font-bold ${
                        evaluationResult.level === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : evaluationResult.level === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {evaluationResult.level}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-3xs text-slate-300">
                  {evaluationResult.penalties.map((pen, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-rose-300">
                      <span className="w-1 h-1 rounded-full bg-rose-400" />
                      <span>{pen}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-white/10 text-3xs text-lime-400 font-bold truncate">
                  {evaluationResult.action}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM TRUSTED COMPLIANCE TICKER (MATCHING REFERENCE IMAGE) */}
      <div className="pt-6 border-t border-white/5 space-y-3 text-center">
        <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest block">
          TRUSTED & REGULATED SURVEILLANCE STANDARDS
        </span>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-60 hover:opacity-100 transition-opacity text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-white text-sm tracking-wider">VISA</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-white text-sm tracking-wider">Mastercard</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-lime-400 font-black">NPCI</span>
            <span>UPI SECURE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200">RBI MASTER DIRECTIONS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200">FIU-IND COMPLIANT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200">POSTGRESQL 18 ACID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
