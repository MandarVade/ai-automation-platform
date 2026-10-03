import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClass = 'el-btn';
    const variantClass = `el-btn-${variant}`;
    const sizeClass = `el-btn-${size}`;
    const loadingClass = isLoading ? 'el-btn-loading' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim()}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="el-btn-spinner" aria-hidden="true" />
        ) : (
          leftIcon && <span className="el-btn-icon el-btn-icon-left">{leftIcon}</span>
        )}
        <span className="el-btn-text">{children}</span>
        {!isLoading && rightIcon && (
          <span className="el-btn-icon el-btn-icon-right">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
