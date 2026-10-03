import React from 'react';

export type ContentWidth = 'compact' | 'default' | 'wide' | 'full';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: ContentWidth;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  width = 'default',
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`el-page-container el-page-container--${width} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  badge,
  className = '',
}) => {
  return (
    <header className={`el-page-header ${className}`.trim()}>
      <div className="el-page-header__main">
        <div className="el-page-header__title-row">
          <h1 className="el-page-header__title">{title}</h1>
          {badge && <div className="el-page-header__badge">{badge}</div>}
        </div>
        {description && <p className="el-page-header__description">{description}</p>}
      </div>
      {actions && <div className="el-page-header__actions">{actions}</div>}
    </header>
  );
};
