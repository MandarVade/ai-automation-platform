import React from 'react';
import { cn } from '../utils';

export type StatusPillType =
  | 'online'
  | 'offline'
  | 'busy'
  | 'isolated'
  | 'verified'
  | 'warning'
  | 'real'
  | 'simulated'
  | 'metadata';

export interface StatusPillProps {
  label: string;
  status?: StatusPillType;
  showDot?: boolean;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function StatusPill({
  label,
  status = 'online',
  showDot = true,
  className,
  title,
  onClick
}: StatusPillProps) {
  const statusStyles: Record<StatusPillType, string> = {
    online: 'bg-emerald-300 text-black border-black',
    offline: 'bg-zinc-200 text-zinc-700 border-black',
    busy: 'bg-amber-300 text-black border-black',
    isolated: 'bg-rose-400 text-white border-black',
    verified: 'bg-cyan-300 text-black border-black',
    warning: 'bg-orange-300 text-black border-black',
    real: 'bg-emerald-400 text-black border-black shadow-[2px_2px_0px_#000]',
    simulated: 'bg-amber-300 text-black border-black shadow-[2px_2px_0px_#000]',
    metadata: 'bg-cyan-200 text-black border-black shadow-[2px_2px_0px_#000]'
  };

  const dotStyles: Record<StatusPillType, string> = {
    online: 'bg-emerald-700 animate-pulse',
    offline: 'bg-zinc-600',
    busy: 'bg-amber-800 animate-ping',
    isolated: 'bg-rose-900 animate-pulse',
    verified: 'bg-cyan-800',
    warning: 'bg-orange-800 animate-bounce',
    real: 'bg-emerald-800 animate-pulse',
    simulated: 'bg-amber-800',
    metadata: 'bg-cyan-800'
  };

  return (
    <div
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold uppercase border-2 shadow-[2px_2px_0px_#000] select-none',
        statusStyles[status],
        onClick && 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-transform',
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-2 h-2 rounded-full border border-black shrink-0', dotStyles[status])}
        />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}
