import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isFullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      isFullWidth = true,
      className = '',
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`el-input-wrapper ${isFullWidth ? 'el-full-width' : ''} ${disabled ? 'el-disabled' : ''}`}>
        {label && (
          <label htmlFor={textareaId} className="el-input-label">
            {label}
          </label>
        )}
        <div className={`el-input-container ${error ? 'el-input-has-error' : ''}`}>
          <textarea
            id={textareaId}
            ref={ref}
            disabled={disabled}
            rows={rows}
            className={`el-textarea ${className}`.trim()}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
            {...props}
          />
        </div>
        {error ? (
          <span id={`${textareaId}-error`} className="el-input-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${textareaId}-helper`} className="el-input-helper">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
