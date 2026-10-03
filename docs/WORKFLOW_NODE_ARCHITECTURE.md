# EL-06 Workflow Node System & Inspector Architecture

## 1. Architectural Philosophy

Phase 5 formalizes **ONE reusable, consistent workflow node architecture** for the EL-06 AI Automation Platform. 

In early stages, visual workflow editors often suffer from "component fragmentation" — where every new capability (OCR, Whisper, LLM Summarizer, Camera Trigger) introduces its own custom React component, custom markup, and ad-hoc CSS. 

EL-06 avoids this by adhering to a **Single Shell Principle**:
```text
WorkflowNode (Authoritative Domain Data)
      │
      ▼
node-presentation-registry.tsx (Presentation Projection)
      │
      ▼
WorkflowNodeShell.tsx (Unified Visual Grammar & Handle Anchor)
      │
      ▼
NodeInspector.tsx (Progressive Disclosure & Explainable Routing)
```

Adding future capabilities requires **zero new UI components**; it simply requires registering the capability's presentation metadata in the presentation registry and defining models in `ModelRegistry`.

---

## 2. Shared Node Visual Grammar

Every node rendered on the React Flow canvas adheres strictly to the EL-06 Obsidian Design System:
- **Surface**: Obsidian Dark (`#141412` / `var(--color-surface)`)
- **Border**: 1px solid restrained border (`#282724` / `var(--color-border)`)
- **Corner Radius**: 10px (`var(--radius-md)`)
- **Selection State**: 1px solid Burnt Orange (`#D97752` / `var(--color-accent)`), subtle background lift, no neon, no glow, no shadow.
- **Dimensions**: Fixed 220px width to ensure legible typography and avoid oversized canvas cards.

```text
┌──────────────────────────────────────┐
│ [Icon]  CATEGORY LABEL        POLICY │  <-- Node Header
├──────────────────────────────────────┤
│ Node Display Label         [Status]  │  <-- Node Body (Label & Status)
│ Input → Output Summary               │  <-- Dataflow Transformation
├──────────────────────────────────────┤
│ Output Type         Model / Location │  <-- Node Footer
└──────────────────────────────────────┘
```

---

## 3. Node Semantic States

Nodes derive their visual state directly from domain and execution semantics:
1. **Default (`IDLE`)**: Neutral border, muted secondary metadata.
2. **Selected**: 1px burnt-orange border (`.el-flow-node--selected`), darker surface selection tint.
3. **Running (`RUNNING`)**: Subtle 2px burnt-orange left edge highlight (`.el-flow-node--running`) and pulsing status indicator; no intrusive canvas-wide pulsing.
4. **Success (`SUCCESS`)**: Semantic green status indicator (`var(--color-success)`).
5. **Error (`FAILED` or DAG Invalid)**: Semantic red border (`var(--color-error)` / `.el-flow-node--error`).
6. **Fallback (`FALLBACK`)**: Semantic warning amber indicator (`var(--color-warning)`).

---

## 4. Connection Handle System

Handles are standardized across all node variants:
- **Target Handle (Input)**: Centered at `Position.Top`. Automatically suppressed when `node.inputTypes.length === 0` (preventing invalid incoming edges into source/trigger nodes).
- **Source Handle (Output)**: Centered at `Position.Bottom`.
- **Dimensions**: 8px diameter circular handle with 2px surface border.
- **Hover/Connecting State**: Transitions to burnt-orange accent (`#D97752`).
- **Accessibility**: Standardized `aria-label` declaring input and output data types.

---

## 5. Node Inspector Architecture

The Node Inspector (`NodeInspector.tsx`) serves as the deep technical inspection and editing surface, adhering to progressive disclosure:

1. **Identity**: Lucide capability icon, category badge, editable display title, dataflow description, underlying engine name.
2. **Configuration**:
   - Node Display Label input (synchronizes immediately to `Workflow` state).
   - Execution Policy selector (`AUTO`, `FORCE_LOCAL`, `FORCE_CLOUD`, `BATTERY_CONSERVE`).
3. **Model Delegate & Routing**:
   - Model selection dropdown populated dynamically from `ModelRegistry.getByCapability(node.capability)`.
   - Explainable Routing Card: Leverages `ModelSelector.selectBestModel` and `DeviceContextManager` to surface real algorithmic decision rationale (e.g. why Tesseract was selected over PaddleOCR or Cloud Vision given current device thermal and battery budget).
4. **Resource Profile**:
   - Displays real metrics from `ModelSpec` (Latency, RAM requirement, Battery impact, Quantization).
   - For native Android nodes, displays native IPC and lightweight OS service metrics.
5. **Data Contracts (I/O)**:
   - Input types and output type rendered as clean monochrome tags.
6. **Dependencies**:
   - Lists upstream predecessor node IDs.
7. **Responsive Parity**:
   - Rendered as a 320px right-hand side panel on desktop (≥901px).
   - Rendered in a bottom slide-over `Sheet` drawer on mobile (≤900px) with identical controls and synchronization.

---

## 6. Authoritative Workflow Synchronization

All changes initiated in the visual canvas or the inspector flow unidirectionally through the authoritative domain model:
```text
Inspector / Canvas Mutation
         │
         ▼
handleWorkflowChange(updatedWorkflow)
         │
         ├──► pushHistory(newWorkflow) (Undo / Redo stack)
         ├──► setWorkflow(newWorkflow)
         └──► DAGValidator.validate(newWorkflow) (Immediate topological validation)
```
Neither the canvas node nor the inspector maintains disconnected local state.
