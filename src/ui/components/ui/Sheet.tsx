import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../motion';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
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
  const shouldReduceMotion = useReducedMotion();

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

  const getSlideInitial = () => {
    if (shouldReduceMotion) return { opacity: 0 };
    if (side === 'bottom') return { opacity: 0, y: 24 };
    if (side === 'left') return { opacity: 0, x: -24 };
    return { opacity: 0, x: 24 };
  };

  const getSlideAnimate = () => {
    if (shouldReduceMotion) return { opacity: 1 };
    if (side === 'bottom') return { opacity: 1, y: 0 };
    if (side === 'left') return { opacity: 1, x: 0 };
    return { opacity: 1, x: 0 };
  };

  const getSlideExit = () => {
    if (shouldReduceMotion) return { opacity: 0 };
    if (side === 'bottom') return { opacity: 0, y: 16 };
    if (side === 'left') return { opacity: 0, x: -16 };
    return { opacity: 0, x: 16 };
  };

  return (
    <motion.div
      className="el-sheet-overlay"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.05 : MOTION_DURATIONS.micro }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        ref={sheetRef}
        className={`el-sheet el-sheet--${side} el-sheet--${size} ${className}`.trim()}
        initial={getSlideInitial()}
        animate={getSlideAnimate()}
        exit={getSlideExit()}
        transition={{
          duration: shouldReduceMotion ? 0.05 : MOTION_DURATIONS.standard,
          ease: MOTION_EASINGS.easeOut,
        }}
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
      </motion.div>
    </motion.div>
  );
};
