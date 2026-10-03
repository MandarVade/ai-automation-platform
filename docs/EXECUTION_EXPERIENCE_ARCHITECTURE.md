# EL-06 — Execution & Activity Experience Architecture

This document establishes the architecture, presentation hierarchy, component contracts, and UX patterns for the EL-06 execution monitor and Activity history experience (Phase 7).

---

## 1. Design Philosophy: Result-First Experience

In earlier prototypes, executing an automation immediately exposed engineering telemetry: JSON dumps, hardware flags, internal node IDs, RAM allocation, and latency tables.

Phase 7 inverts this model to make execution feel like a **finished product result first and an engineering debugger second**.

### The Presentation Hierarchy

```text
Result
  ↓
Execution Summary
  ↓
Workflow Timeline
  ↓
Step Details
  ↓
Technical Data
```

1. **Result**: A clear, human-readable outcome statement explaining what happened, whether it succeeded, and what was produced.
2. **Execution Summary**: At-a-glance metrics showing steps completed, total elapsed duration, timeline timestamps, device target, and cache efficiency.
3. **Workflow Timeline**: Clean vertical sequence showing data flow through the pipeline with semantic status indicators.
4. **Step Details**: Step-specific inspector showing the human purpose of the step, formatted intermediate outputs, and resolved ML delegate.
5. **Technical Data (Progressive Disclosure)**: Raw JSON payloads, latency breakdowns, memory peaks, and console logs placed behind collapsible controls rather than cluttering initial view.

---

## 2. Unified Presentation: Live Runtime vs. Historical Audit

Rather than maintaining separate UI implementations for live execution runs and historical activity inspection, EL-06 utilizes **one unified execution detail container**:

```
                              ┌─────────────────────────────────────┐
                              │         ExecutionDetailView         │
                              └──────────────────┬──────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
        ExecutionMonitorScreen                                         ActivityScreen
           (isLiveMode = true)                                     (isLiveMode = false)
   - Live WorkflowEngine subscriptions                     - ExecutionHistoryStore persistent logs
   - Live telemetry and active step selection              - Search and status filtering
   - User file upload & test presets                       - Drill-down into past executions
   - Re-execute / Re-run capabilities                      - Historical model resolution audit
```

### Benefits of Unified Detail Architecture:
- **Zero Mental Context Switching**: Users inspect past runs using the exact same visual grammar and interaction model as live runs.
- **Single Source of Presentation Truth**: Any enhancement to output viewers, explainability modals, or status indicators immediately applies across all screens.
- **Progressive Input Controls**: In live mode, file upload and input presets appear subordinate below the summary bar; in historical audit mode, input controls are automatically omitted.

---

## 3. Component Architecture & Roles

### 3.1 `ExecutionResultCard` (`src/ui/components/execution/ExecutionResultCard.tsx`)
- **Role**: Hero outcome container anchored at the top of the execution experience.
- **States**:
  - `COMPLETED`: Success badge, check icon, and domain-tailored narrative (e.g. *"Receipt image analyzed, items extracted, sum verified, and recorded into expense ledger"*).
  - `FAILED`: Error badge, alert icon, and halting node label with exact error message.
  - `RUNNING`: Animated pulsing badge, active node label, and real-time step counter.
  - `CANCELLED`: Warning badge with step completion count.
- **Actions**: `Back` button, optional `View Result` button (direct focus to terminal output step), and `Re-run` action (with `id="re-execute-btn"` for automation testing).

### 3.2 `ExecutionSummaryBar` (`src/ui/components/execution/ExecutionSummaryBar.tsx`)
- **Role**: High-density horizontal telemetry bar.
- **Elements**:
  - Step progress: `Step X of Y completed` with colored progress fill bar.
  - Elapsed duration: formatted in seconds or milliseconds (`1.45s`).
  - Timeline bounds: Start timestamp → End timestamp in local time.
  - Device info: Target model (e.g., `Pixel 8 Pro`).
  - Cache hits: Distinct green chip with lightning badge when cache reuse occurred.

### 3.3 `ExecutionTimeline` (`src/ui/components/execution/ExecutionTimeline.tsx`)
- **Role**: Vertical sequence tracking data flow from trigger to action.
- **Elements**:
  - Semantic status marker: `CheckCircle2` (success), `Zap` (running), `AlertCircle` (failure), `AlertTriangle` (fallback), or numbered index (queued).
  - Step title with execution latency in `JetBrains Mono`.
  - Data flow label derived from `node-presentation-registry` (e.g., `Hardware Camera → Image Buffer`, `Image → Extracted Text`).
  - Cache badge (`⚡ Cache Hit`).
  - Click-to-inspect step selection with accessible keyboard focus.

### 3.4 `ExecutionStepDetails` (`src/ui/components/execution/ExecutionStepDetails.tsx`)
- **Role**: Step-level deep inspector.
- **Elements**:
  - Category badge and data flow contract description.
  - Status indicator with step completion latency.
  - Output slot housing `IntermediateResultViewer`.
  - Resolved ML delegate chip displaying model name (e.g., `PaddleOCR-v4-Mobile`), execution location (`On-Device NPU/CPU`), and `Why this model? ↗` explainability modal trigger.
  - Collapsible **Technical Diagnostics & Logs** toggle revealing RAM consumption, exact millisecond latency, cache hit status, and the terminal log stream.

### 3.5 `IntermediateResultViewer` (`src/ui/components/execution/IntermediateResultViewer.tsx`)
- **Role**: Content-aware formatter for intermediate step outputs.
- **Data Rendering**:
  - **Images**: Direct image preview with file metadata.
  - **Plain Text**: Clean typography paragraph with whitespace preservation.
  - **Structured Key-Value**: Formatted card grid (e.g., `merchant`, `subtotal`, `tax`, `total`).
  - **Arrays / Lists**: Compact itemized tags.
  - **Raw JSON**: Accessible via progressive disclosure toggle with one-click clipboard copy.

### 3.6 `ActivityScreen` (`src/ui/screens/ActivityScreen.tsx`)
- **Role**: Reusable execution log and audit history.
- **Features**:
  - Persistent subscriber to `ExecutionHistoryStore`.
  - Live client-side search across workflow names and execution statuses.
  - Status filter tabs (`All Runs`, `Successful`, `Failed`) with live count chips.
  - High-density activity cards rendering status indicator, relative execution time (`12m ago`), step count, device model, duration, RAM usage, and cache hit metrics.
  - Selection seamlessly renders `<ExecutionDetailView>` with back navigation.

---

## 4. Responsive & Mobile Strategy

- **Desktop (Viewport > 900px)**:
  - Dual-column split container (`.el-exec-split-container`): Timeline on left (`1.1fr`), Step Details Inspector on right (`1fr`).
- **Mobile (Viewport ≤ 900px)**:
  - Timeline expands to full width (`1fr`).
  - Selecting any timeline step slides up a bottom `Sheet` drawer containing `ExecutionStepDetails`.
  - Touch targets maintain minimum 44px dimensions.

---

## 5. Visual Consistency & Styling

All components strictly consume tokens from `docs/UI_DESIGN_SYSTEM.md`:
- **Theme**: Obsidian (`#080806`), Surface (`#141412`), Raised Surface (`#1C1B18`).
- **Accents**: Burnt Orange (`#D97752`), Cyan telemetry accents.
- **Semantic Colors**: Emerald (`#34D399`) for Success/Cache, Rose (`#F87171`) for Errors, Amber (`#FBBF24`) for Warnings.
- **Typography**: Inter for interface narrative and headlines, JetBrains Mono for durations, memory allocations, timestamps, and model IDs.
