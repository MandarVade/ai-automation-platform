import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: LucideIcon;
  label: string;
  badge?: string | number;
  compact?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  active = false,
  icon: Icon,
  label,
  badge,
  compact = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`el-nav-item ${active ? 'el-nav-item--active' : ''} ${compact ? 'el-nav-item--compact' : ''} ${className}`.trim()}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {Icon && <Icon className="el-nav-icon" size={18} aria-hidden="true" />}
      {!compact && <span className="el-nav-label">{label}</span>}
      {badge !== undefined && (
        <span className="el-nav-badge">{badge}</span>
      )}
    </button>
  );
};

export interface NavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export const NavGroup: React.FC<NavGroupProps> = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`el-nav-group ${className}`.trim()} {...props}>
      {title && <span className="el-nav-group__title">{title}</span>}
      <div className="el-nav-group__items">{children}</div>
    </div>
  );
};

export const NavDivider: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({
  className = '',
  ...props
}) => {
  return <hr className={`el-nav-divider ${className}`.trim()} {...props} />;
};
