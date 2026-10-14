import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normStatus = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normStatus) {
      case 'SUCCESS':
      case 'RESOLVED_FRAUD':
      case 'RESOLVED_FALSE_POSITIVE':
      case 'ACTIVE':
        return 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40';
      case 'PENDING_REVIEW':
      case 'INVESTIGATING':
      case 'IN_REVIEW':
      case 'ACKNOWLEDGED':
        return 'bg-amber-950/30 text-amber-300 border-amber-800/40';
      case 'BLOCKED':
      case 'FROZEN':
      case 'CLOSED_CONFIRMED_FRAUD':
      case 'FAILED':
        return 'bg-red-950/30 text-red-300 border-red-800/40';
      case 'NEW':
      case 'OPEN':
        return 'bg-blue-950/30 text-blue-300 border-blue-800/40';
      case 'DORMANT':
      case 'DISMISSED':
      case 'CLOSED':
      default:
        return 'bg-slate-800/40 text-slate-300 border-slate-700/60';
    }
  };

  const sizeClass = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-mono rounded font-medium border ${getStyle()} ${sizeClass} tracking-wide select-none`}
    >
      {normStatus.replace(/_/g, ' ')}
    </span>
  );
};
