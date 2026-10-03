import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_VARIANTS } from './motion-tokens';

export interface PageMotionProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * PageMotion provides a standardized entrance animation for major screen routes.
 *
 * Automatically respects user's system preferences for reduced motion:
 * - When reduced motion is requested: instantaneous 50ms opacity fade without displacement.
 * - Standard mode: disciplined 6px vertical settle over 220ms with ease-out curve.
 */
export const PageMotion: React.FC<PageMotionProps> = ({
  children,
  className = '',
  id,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? MOTION_VARIANTS.pageReduced : MOTION_VARIANTS.page;

  return (
    <motion.div
      id={id}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
