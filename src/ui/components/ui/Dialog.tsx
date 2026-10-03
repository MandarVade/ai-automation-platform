import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className = '',
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="el-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'el-dialog-title' : undefined}
      aria-describedby={description ? 'el-dialog-desc' : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`el-dialog el-dialog--max-${maxWidth} ${className}`.trim()}
      >
        <div className="el-dialog__header">
          <div className="el-dialog__header-text">
            {title && (
              <h2 id="el-dialog-title" className="el-dialog__title">
                {title}
              </h2>
            )}
            {description && (
              <p id="el-dialog-desc" className="el-dialog__description">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="el-dialog__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="el-dialog__body">{children}</div>

        {footer && <div className="el-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
};
