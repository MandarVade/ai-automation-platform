import * as React from 'react';
import { cn } from '../utils';

export type BadgeVariant =
  | 'default'
  | 'cyber'
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'dark'
  | 'purple';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-amber-300 text-black',
  cyber: 'bg-cyan-300 text-black',
  success: 'bg-emerald-300 text-black',
  danger: 'bg-rose-400 text-black',
  warning: 'bg-orange-300 text-black',
  neutral: 'bg-white text-black',
  dark: 'bg-black text-white',
  purple: 'bg-purple-300 text-black'
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000]',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
