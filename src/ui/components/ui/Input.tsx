import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isFullWidth = true,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`el-input-wrapper ${isFullWidth ? 'el-full-width' : ''} ${disabled ? 'el-disabled' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="el-input-label">
            {label}
          </label>
        )}
        <div className={`el-input-container ${error ? 'el-input-has-error' : ''}`}>
          {leftIcon && <span className="el-input-icon el-input-icon-left">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`el-input ${leftIcon ? 'el-input-with-left-icon' : ''} ${
              rightIcon ? 'el-input-with-right-icon' : ''
            } ${className}`.trim()}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && <span className="el-input-icon el-input-icon-right">{rightIcon}</span>}
        </div>
        {error ? (
          <span id={`${inputId}-error`} className="el-input-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${inputId}-helper`} className="el-input-helper">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
