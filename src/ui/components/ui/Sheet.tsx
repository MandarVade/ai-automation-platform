import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  side = 'right',
  className = '',
  size = 'md',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

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
      className="el-sheet-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        className={`el-sheet el-sheet--${side} el-sheet--${size} ${className}`.trim()}
      >
        <div className="el-sheet__header">
          <div className="el-sheet__header-text">
            {title && <h3 className="el-sheet__title">{title}</h3>}
            {description && <p className="el-sheet__description">{description}</p>}
          </div>
          <button
            type="button"
            className="el-sheet__close-btn"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <X size={18} />
          </button>
        </div>
        <div className="el-sheet__body">{children}</div>
      </div>
    </div>
  );
};
