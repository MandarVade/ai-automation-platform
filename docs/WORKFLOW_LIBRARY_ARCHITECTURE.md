# EL-06 Workflow Library Architecture

## 1. Role & Separation of Concerns

EL-06 maintains a strict mental model separation across its primary navigation screens:

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│        WORKFLOWS        │       │         STUDIO          │       │        ACTIVITY         │
│                         │       │                         │       │                         │
│ Reusable Automation     │ ────► │ Authoring, Editing,     │ ────► │ Execution Telemetry,    │
│ Discovery & Execution   │       │ Visual DAG & NL Planner │       │ Latency & Audit Logs    │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

The Workflows screen is **NOT** a technical metrics dashboard; it is a discovery and execution library where users quickly identify, inspect, open, and run automations without cognitive overload.

---

## 2. Information Architecture of a Workflow Card

Every automation in the library is rendered using `WorkflowCard.tsx`:
```text
┌────────────────────────────────────────────────────────┐
│ [FINANCE]                                  5 steps · v1.2.0 │
│ Smart Bill & Expense Processor                         │
│ Take a photo of a handwritten bill, extract items...    │
├────────────────────────────────────────────────────────┤
│ [📷 Camera] ──► [📄 OCR] ──► [⚡ Calc] ──► [💾 Store]  │ <-- WorkflowPreview
├────────────────────────────────────────────────────────┤
│ ▤ Capabilities: Camera · OCR · Calculation · +2 more   │
│ ● Last run · 15m ago · Completed                       │
├────────────────────────────────────────────────────────┤
│                           [ 📁 Open ]    [ ▶ Run ]     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Lightweight Workflow Preview (`WorkflowPreview.tsx`)

To avoid mounting resource-heavy canvas engines inside each card, `WorkflowPreview` provides a lightweight, deterministic projection:
- **Topological Sorting**: Traverses DAG root nodes to leaf targets using `workflow.edges`.
- **Phase 5 Consistency**: Reuses Lucide capability icons and presentation metadata from `node-presentation-registry.tsx`.
- **Directional Connectors**: Renders SVG arrows (`ArrowRight`) between pipeline steps.
- **Overflow Handling**: Workflows with > 5 nodes display a compact overflow badge (`+N more`) within a touch-friendly horizontal track.
- **Read-Only**: Zero drag handlers, zero editable controls, zero performance lag.

---

## 4. Execution State & Audit Sync

Execution status is derived live from `ExecutionHistoryStore.getInstance()`:
- `startTime`: Formatted via `formatRelativeTime` (`Just now`, `12m ago`, `2h ago`, `Yesterday`, `4d ago`).
- `status`: Mapped to EL-06 semantic status tokens:
  - `COMPLETED` -> `StatusIndicator status="success" label="Last run · ... · Completed"`
  - `FAILED` -> `StatusIndicator status="error" label="Last run · ... · Failed"`
  - `RUNNING` -> `StatusIndicator status="running" label="Running now..." pulse`
  - Unrun workflows -> `StatusIndicator status="neutral" label="Not run yet"`

---

## 5. Navigation & Handoff Semantics

- **Open Action**:
  - Passes the authoritative `Workflow` object directly into Studio (`handleEditInVisualBuilder(wf)`).
  - Preserves node positions, configuration, model delegates, and edge semantics.
- **Run Action**:
  - Invokes `handleRunWorkflow(wf)`.
  - Handoff directly transitions to `ExecutionMonitorScreen` for real-time telemetry, model delegate monitoring, and result persistence.
- **New Workflow Action**:
  - Launches Studio in creation mode (`handleStartNLPlan('')`).
