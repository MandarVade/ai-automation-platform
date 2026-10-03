import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      loading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isSpinnerActive = loading !== undefined ? loading : isLoading;
    const baseClass = 'el-btn';
    const variantClass = `el-btn--${variant}`;
    const sizeClass = `el-btn--${size}`;
    const loadingClass = isSpinnerActive ? 'el-btn--loading' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isSpinnerActive}
        className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim()}
        aria-busy={isSpinnerActive}
        {...props}
      >
        {isSpinnerActive ? (
          <span className="el-btn__spinner" aria-hidden="true" />
        ) : (
          leftIcon && <span className="el-btn-icon el-btn-icon-left">{leftIcon}</span>
        )}
        <span className="el-btn-text">{children}</span>
        {!isSpinnerActive && rightIcon && (
          <span className="el-btn-icon el-btn-icon-right">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

