import React from 'react';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  headerAction,
  children,
  className = '',
}) => {
  return (
    <section className={`el-settings-section ${className}`.trim()} aria-labelledby={`settings-sec-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="el-settings-section__header">
        <div className="el-settings-section__title-group">
          {icon && <span className="el-settings-section__icon" aria-hidden="true">{icon}</span>}
          <div>
            <h2 id={`settings-sec-${title.toLowerCase().replace(/\s+/g, '-')}`} className="el-settings-section__title">
              {title}
            </h2>
            {description && (
              <p className="el-settings-section__desc">{description}</p>
            )}
          </div>
        </div>

        {headerAction && (
          <div className="el-settings-section__header-action">
            {headerAction}
          </div>
        )}
      </div>

      <div className="el-settings-section__content">
        {children}
      </div>
    </section>
  );
};
