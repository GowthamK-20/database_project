import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md',
}) => {
  const normLevel = (level || 'SAFE').toUpperCase();

  const getColors = () => {
    switch (normLevel) {
      case 'CRITICAL':
        return 'bg-red-950/40 text-red-400 border-red-800/60';
      case 'HIGH':
        return 'bg-orange-950/40 text-orange-400 border-orange-800/60';
      case 'MEDIUM':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      case 'LOW':
        return 'bg-slate-800/80 text-slate-300 border-slate-700/80';
      case 'SAFE':
      default:
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
    }
  };

  const getDotColor = () => {
    switch (normLevel) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
        return 'bg-slate-400';
      case 'SAFE':
      default:
        return 'bg-emerald-500';
    }
  };

  const sizeClass = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium border ${getColors()} ${sizeClass} tracking-wide select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{normLevel}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 border-l border-current/20 pl-1 ml-0.5">{score}</span>
      )}
    </span>
  );
};
