/**
 * EL-06 Centralized Motion System Tokens & Variants (Phase 9)
 *
 * Strict Principles:
 * - Motion communicates state, hierarchy, or causality.
 * - No decorative AI motion, particles, liquid gradients, or sci-fi HUDs.
 * - Restrained timing tiers (~140ms micro, ~220ms standard, ~320ms emphasis).
 * - Full prefers-reduced-motion compatibility everywhere.
 */

export const MOTION_DURATIONS = {
  micro: 0.14,    // 140ms: toggle switches, hover highlights, chip selections
  standard: 0.22, // 220ms: dialogs, sheets, step activations, panel disclosures
  emphasis: 0.32, // 320ms: page entrances, workflow generation result reveals
} as const;

export const MOTION_EASINGS = {
  easeOut: [0.16, 1, 0.3, 1] as const,       // Smooth deceleration for entrances
  easeInOut: [0.4, 0, 0.2, 1] as const,      // Balanced transition for state morphs
  subtleSpring: {
    type: 'spring' as const,
    damping: 24,
    stiffness: 260,
    mass: 0.8,
  },
} as const;

/**
 * Reusable motion variants for standard UI transitions.
 */
export const MOTION_VARIANTS = {
  // Page entrance (restrained opacity + 6px vertical settle)
  page: {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      y: -4,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.easeInOut,
      },
    },
  },

  // Reduced motion alternative for page entrance (pure crossfade)
  pageReduced: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.05 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.05 },
    },
  },

  // Modal Dialog entrance (subtle scale 0.98 -> 1.0 + fade)
  dialog: {
    initial: { opacity: 0, scale: 0.98, y: 6 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 4,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.easeInOut,
      },
    },
  },

  // Drawer Sheet entrance (slide from right or bottom)
  sheetRight: {
    initial: { opacity: 0, x: 24 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      x: 16,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.easeInOut,
      },
    },
  },

  sheetBottom: {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      y: 16,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.easeInOut,
      },
    },
  },

  // Staggered list container (for Model cards, Workflows library, Activity items)
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.02,
      },
    },
  },

  // Individual list item reveal
  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
  },

  // Progressive technical disclosure (diagnostics, raw JSON, inspector collapsible)
  disclosure: {
    initial: { opacity: 0, height: 0, overflow: 'hidden' as const },
    animate: {
      opacity: 1,
      height: 'auto',
      overflow: 'visible' as const,
      transition: {
        duration: MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      overflow: 'hidden' as const,
      transition: {
        duration: MOTION_DURATIONS.micro,
        ease: MOTION_EASINGS.easeInOut,
      },
    },
  },
} as const;
