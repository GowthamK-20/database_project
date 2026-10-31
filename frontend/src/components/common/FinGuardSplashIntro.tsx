import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Sparkles, ArrowRight, Activity, Terminal } from 'lucide-react';

interface FinGuardSplashIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const FinGuardSplashIntro: React.FC<FinGuardSplashIntroProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bootStep, setBootStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bootLogs = [
    'INITIALIZING FINGUARD AI NEURAL KERNEL...',
    'CONNECTING TO NATIVE POSTGRESQL 18 LEDGER...',
    'CALIBRATING MULTI-RAIL FRAUD DETECTION MATRIX...',
    'INDEXING 1,007 VERIFIED CUSTOMER IDENTITIES...',
    'SURVEILLANCE SURGE ENGINE ONLINE · SYSTEM SECURE',
  ];

  // Particle Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create converging particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.2,
      });
    }

    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.fillStyle = 'rgba(4, 6, 9, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw particles gravitating toward center
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Pull slightly toward center
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 50) {
          p.vx += (dx / dist) * 0.03;
          p.vy += (dy / dist) * 0.03;
        }

        // Dampen velocity
        p.vx *= 0.98;
        p.vy *= 0.98;

        ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Progress and Boot Sequence Simulation
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2600; // 2.6 seconds total intro

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      const logIndex = Math.min(
        bootLogs.length - 1,
        Math.floor((pct / 100) * bootLogs.length)
      );
      setBootStep(logIndex);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          handleDismiss();
        }, 300);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 700);
  };

  if (!isVisible && !forceShow) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#040608] select-none cursor-pointer overflow-hidden transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radiant Amber Atmospheric Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/15 via-amber-600/5 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* SKIP BUTTON IN TOP RIGHT */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-amber-400 bg-veyra-900/90 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg"
        >
          <span>SKIP INTRO</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MAIN ANIMATED SHIELD CONTAINER */}
      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
        {/* SHIELD GRAPHIC WITH LASER TRACING */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-8">
          {/* Concentric Radar Rings */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-30" />
          <div className="absolute w-48 h-48 rounded-full border border-amber-500/10 animate-spin opacity-40 [animation-duration:12s]" />

          {/* SVG Animated Beveled Shield */}
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Hex Shield Trace with laser dasharray */}
            <path
              d="M50 5 L88 22 L88 65 C88 95 50 115 50 115 C50 115 12 95 12 65 L12 22 Z"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="300"
              strokeDashoffset={300 - (progress / 100) * 300}
              className="transition-all duration-75 ease-linear"
            />

            {/* Inner Shield Facet */}
            <path
              d="M50 16 L78 30 L78 63 C78 86 50 102 50 102 C50 102 22 86 22 63 L22 30 Z"
              fill="url(#shieldGradient)"
              stroke="#FBBF24"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />

            {/* Central Biometric Hexagon / Lock Node */}
            <polygon
              points="50,42 63,50 63,66 50,74 37,66 37,50"
              fill="#060709"
              stroke="#F59E0B"
              strokeWidth="1.8"
              className="animate-pulse"
            />

            {/* Verification Checkmark Inside Lock */}
            <path
              d="M44 58 L48 62 L57 52"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Radar Sweep Line */}
            <line
              x1="50"
              y1="58"
              x2="78"
              y2="30"
              stroke="#FBBF24"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 58"
                to="360 50 58"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>

            {/* Gradients */}
            <defs>
              <linearGradient id="shieldGradient" x1="50" y1="16" x2="50" y2="102" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Pulsing Beacon */}
          <div className="absolute w-3 h-3 rounded-full bg-amber-400 animate-ping" />
        </div>

        {/* TYPOGRAPHIC BRAND REVEAL */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-slate-100 flex items-center gap-2 drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
              <span>FINGUARD</span>
              <span className="text-black bg-amber-400 px-2.5 py-0.5 rounded-lg text-2xl font-black shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                AI
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-mono tracking-wider text-amber-400/90 uppercase font-semibold">
            FINANCIAL THREAT INTELLIGENCE & TRANSACTION SURVEILLANCE
          </p>
        </div>

        {/* PROGRESS BAR WITH LASER TIP */}
        <div className="w-full max-w-sm space-y-2 font-mono">
          <div className="flex items-center justify-between text-3xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>CORE BOOT SEQUENCE</span>
            </span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-veyra-900 border border-veyra-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all duration-75 relative shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing laser tip */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-xs" />
            </div>
          </div>

          {/* TELEMETRY BOOT LOG */}
          <div className="h-6 flex items-center justify-center text-3xs font-mono text-slate-300 overflow-hidden">
            <span className="text-amber-400 mr-1.5">❯</span>
            <span className="truncate">{bootLogs[bootStep]}</span>
          </div>
        </div>

        {/* CLICK TO ENTER PROMPT */}
        <div className="mt-6 text-3xs font-mono text-slate-500 tracking-wider animate-pulse">
          [ CLICK ANYWHERE OR PRESS ANY KEY TO ENTER ]
        </div>
      </div>
    </div>
  );
};
