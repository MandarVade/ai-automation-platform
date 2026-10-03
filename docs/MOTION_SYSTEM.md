# EL-06 Motion System & Micro-Interactions

## 1. Motion Principles

Motion in EL-06 is not cosmetic. It is governed by a singular rule:

> **Animation communicates state, hierarchy, or causality.**

Every motion curve and micro-interaction must answer:
1. **State:** Did something change? (e.g., node selected, model resident in RAM, execution step completed).
2. **Hierarchy:** Did something enter or become primary? (e.g., page navigation, inspector drawer opening, confirmation modal).
3. **Causality:** Did a user or system action cause this result? (e.g., natural language prompt generating DAG nodes sequentially, execution progressing through nodes).

If an animation communicates none of these, it must not exist.

### Prohibited Motion (Strict Constraints)
- No decorative AI particle effects or floating background orbs.
- No glowing gradient borders or neon execution trails.
- No continuous graph canvas animations or simulated neural networks.
- No exaggerated spring bounce or overshoot on ordinary UI cards and buttons.
- No layout shifts (transforms and opacity only).

---

## 2. Timing Tiers & Easing Conventions

Motion durations are centralized in [`src/ui/motion/motion-tokens.ts`](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/src/ui/motion/motion-tokens.ts) and mirror CSS custom properties in [`src/index.css`](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/src/index.css):

| Tier | Duration | Use Case | CSS Token |
| :--- | :--- | :--- | :--- |
| **Micro** | `140ms` (`0.14s`) | Hover highlights, active button press (`scale(0.985)`), handle focus, toggle switches. | `--motion-duration-micro` |
| **Standard** | `220ms` (`0.22s`) | Page entrance settle, Dialog entrance, Sheet slide-in, execution timeline step updates. | `--motion-duration-standard` |
| **Emphasis** | `320ms` (`0.32s`) | Complete modal panel reveals, workflow generation settlement, final result presentation. | `--motion-duration-emphasis` |

### Easing Profiles
- **`easeOut`** (`cubic-bezier(0.16, 1, 0.3, 1)`): Restrained deceleration curve for elements entering the viewport or settling into place.
- **`easeInOut`** (`cubic-bezier(0.4, 0, 0.2, 1)`): Smooth transition for state toggles, status pills, and dimensional shifts.
- **`subtleSpring`** (`{ damping: 26, stiffness: 320 }`): Controlled physical damping strictly without visual overshoot or oscillations.

---

## 3. Reusable Patterns & Components

### `PageMotion` (`src/ui/motion/PageMotion.tsx`)
Standard route wrapper for all top-level screen containers (`Home`, `Studio`, `Workflows`, `Activity`, `Models`, `Settings`, `Execution`):
```tsx
<PageMotion id="page-studio" className="el-screen-container">
  {/* Screen Content */}
</PageMotion>
```
- **Standard**: Restrained 6px vertical settle (`y: 6 → 0`) with 220ms ease-out opacity (`0 → 1`).
- **Reduced Motion**: Instantaneous 50ms opacity fade without spatial displacement (`y: 0`).

### `Dialog` Modal Transitions (`src/ui/components/ui/Dialog.tsx`)
- Overlay fades from `opacity: 0` to `opacity: 1` over 140ms.
- Dialog container settles with a subtle 2% scale (`scale: 0.98 → 1`) and vertical shift (`y: 8 → 0`) over 220ms ease-out.
- Keyboard focus is trapped; ESC and overlay clicks trigger immediate dismissal.

### `Sheet` Drawer Transitions (`src/ui/components/ui/Sheet.tsx`)
- Right drawer (`side="right"`): Slides along X-axis (`x: 24 → 0`) with opacity fade over 220ms ease-out.
- Mobile bottom drawer (`side="bottom"`): Slides along Y-axis (`y: 24 → 0`) with opacity fade over 220ms ease-out.
- Closed sheets unmount from DOM immediately to preserve accessibility tree integrity.

---

## 4. React Flow & Node Motion Guidance

### Static Canvas Edges
- Canvas edges in [`WorkflowCanvas.tsx`](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/src/ui/components/studio/WorkflowCanvas.tsx) explicitly specify `animated: false`.
- Permanently animated edge strokes are prohibited to prevent idle CPU battery drain on mobile Android devices and visual distraction.

### Node State Transitions
- **Selected**: Immediate burnt orange outline (`border-color: var(--color-burnt-orange)`) and subtle drop shadow (`box-shadow: 0 0 0 1px var(--color-burnt-orange)`). Nodes do not scale or shift position on selection.
- **Running**: Status indicator displays a restrained pulse dot (`.el-status-indicator__dot--pulse`). The node body does not pulsate or shake.
- **Success / Error**: Clean semantic border and status icon transition (Green `#34D399` / Red `#F87171`) with 140ms micro duration.

### Natural Language Workflow Generation Causality
- Prompt panel (`StudioPromptPanel.tsx`) transitions to causal planning state on submission (`Planning DAG...`).
- When generated DAG is transferred to Studio canvas, nodes reveal in topological dependency order without bouncing or layout displacement.

---

## 5. Execution State & Timeline Motion

### Execution Progress
- Timeline steps (`.el-exec-timeline__step`) transition states (`PENDING` → `RUNNING` → `SUCCESS` / `FAILED`) using standard 140ms transitions.
- The active running step highlights with a pulsing status dot.
- Connecting lines between steps (`.el-exec-timeline__connector`) fill with semantic color upon predecessor completion, communicating causality.

### Result Disclosure
- Final execution result and intermediate outputs appear with a single 220ms opacity fade.
- Long text and JSON output do not use typing effects or character-by-character animations.

---

## 6. Reduced Motion (`prefers-reduced-motion: reduce`)

Accessible motion behavior is mandatory across all surfaces:
1. **Framer Motion / Motion Hook**: All animated components check `useReducedMotion()`. When true, all spatial translations (`x`, `y`, `scale`) are disabled, and durations are collapsed to `<= 50ms`.
2. **CSS Level**: Global rule in `src/index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
3. **Accessibility**: Reduced motion never hides content or alters semantic state. Information density and readability remain 100% equivalent.

---

## 7. Performance & Mobile Considerations

- **Composite Properties Only**: Motion is strictly restricted to `transform` and `opacity`. Layout properties (`height`, `width`, `margin`, `padding`, `top`, `left`) are never animated.
- **Memory Footprint**: Components unmount when hidden rather than lingering with zero opacity.
- **Frame Rate**: All transitions target stable 60fps on mobile Android WebView (Pixel 8 Pro and mid-range devices).
