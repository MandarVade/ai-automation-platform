import React from 'react';

export type StatusType = 'neutral' | 'success' | 'warning' | 'error' | 'running' | 'info';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`el-status-indicator el-status-indicator--${status} el-status-indicator--${size} ${className}`.trim()}
      role="status"
      {...props}
    >
      <span
        className={`el-status-indicator__dot ${pulse || status === 'running' ? 'el-status-indicator__dot--pulse' : ''}`}
        aria-hidden="true"
      />
      {label && <span className="el-status-indicator__label">{label}</span>}
    </span>
  );
};
