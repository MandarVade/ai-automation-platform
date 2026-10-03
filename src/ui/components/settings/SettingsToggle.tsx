import React from 'react';

export interface SettingsToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
  className = '',
}) => {
  return (
    <div className={`el-settings-toggle ${disabled ? 'el-settings-toggle--disabled' : ''} ${className}`.trim()}>
      <div className="el-settings-toggle__info">
        <div className="el-settings-toggle__label-row">
          <label htmlFor={id} className="el-settings-toggle__label">
            {label}
          </label>
          {badge}
        </div>
        {description && (
          <p className="el-settings-toggle__desc">{description}</p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`el-switch ${checked ? 'el-switch--checked' : ''}`}
        aria-label={label}
      >
        <span className="el-switch__thumb" />
      </button>
    </div>
  );
};
