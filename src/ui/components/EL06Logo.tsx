import React from 'react';
import { cn } from '../utils';

export function EL06Emblem({
  size = 36,
  animated = true,
  className
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none overflow-visible', className)}
      aria-label="EL-06 Engine Emblem"
    >
      <defs>
        <linearGradient id="el06AmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="el06CyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon Shadow & Base */}
      <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="#000000" />
      <polygon
        points="32,6 55,19 55,45 32,58 9,45 9,19"
        fill="#111827"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cyan Inner Technical Frame */}
      <polygon
        points="32,9 51,21 51,43 32,54 13,43 13,21"
        fill="#030712"
        stroke="#00F0FF"
        strokeWidth="1.2"
        strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      {/* Geometric 'E' and 'L' Glyphs */}
      <path
        d="M17 20 H30 V25 H23 V29 H29 V34 H23 V39 H30 V44 H17 Z"
        fill="url(#el06AmberGrad)"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <path
        d="M34 20 H40 V38 H47 V44 H34 Z"
        fill="url(#el06CyanGrad)"
        stroke="#000000"
        strokeWidth="1.5"
      />
      {/* Central AI Sensor Dot */}
      <circle cx="32" cy="32" r="4.5" fill="#000000" stroke="#00F0FF" strokeWidth="1.5" />
      <circle
        cx="32"
        cy="32"
        r="2.5"
        fill="#10B981"
        className={animated ? 'animate-pulse' : undefined}
      />
      {/* Crosshair Connectors */}
      <line x1="32" y1="12" x2="32" y2="16" stroke="#FACC15" strokeWidth="2" strokeLinecap="square" />
      <line x1="32" y1="48" x2="32" y2="52" stroke="#FACC15" strokeWidth="2" strokeLinecap="square" />
      <line x1="14" y1="32" x2="17" y2="32" stroke="#00F0FF" strokeWidth="2" strokeLinecap="square" />
      <line x1="47" y1="32" x2="50" y2="32" stroke="#00F0FF" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function EL06Logo({
  variant = 'full',
  size = 'md',
  showSubtitle = true,
  animated = true,
  className
}: {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const sizeMap = {
    sm: { emblemSize: 28, textClass: 'text-base', badgeClass: 'text-[10px] px-1 py-0.5', subClass: 'text-[8px]' },
    md: { emblemSize: 36, textClass: 'text-lg', badgeClass: 'text-xs px-1.5 py-0.5', subClass: 'text-[9px]' },
    lg: { emblemSize: 48, textClass: 'text-2xl', badgeClass: 'text-sm px-2 py-0.5', subClass: 'text-[11px]' },
    xl: { emblemSize: 64, textClass: 'text-4xl', badgeClass: 'text-base px-2.5 py-1', subClass: 'text-xs' }
  };
  const { emblemSize, textClass, badgeClass, subClass } = sizeMap[size];

  if (variant === 'icon') {
    return <EL06Emblem size={emblemSize} animated={animated} className={className} />;
  }

  return (
    <div className={cn('inline-flex items-center gap-3 font-mono select-none', className)}>
      <EL06Emblem size={emblemSize} animated={animated} />
      <div className="flex flex-col truncate">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={cn('font-black tracking-wider text-black', textClass)}>EL-06</span>
          <span
            className={cn(
              'font-mono font-black bg-black text-amber-300 border border-black shadow-[2px_2px_0px_#FACC15]',
              badgeClass
            )}
          >
            AI ENGINE
          </span>
        </div>
        {showSubtitle && (
          <div className={cn('flex items-center gap-1.5 font-bold text-zinc-800 mt-1 truncate tracking-wider', subClass)}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate">AUTONOMOUS ANDROID ORCHESTRATOR</span>
          </div>
        )}
      </div>
    </div>
  );
}
