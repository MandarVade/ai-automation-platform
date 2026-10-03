import React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`el-badge el-badge-${variant} el-badge-${size} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="el-badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
