# EL-06 UI Component Catalog

This catalog documents the reusable React UI primitives implemented in Phase 1 according to the design constitution in [UI_DESIGN_SYSTEM.md](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/docs/UI_DESIGN_SYSTEM.md).

All primitives are located in [`src/ui/components/ui/`](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/src/ui/components/ui/) and consume centralized tokens defined in [`src/index.css`](file:///home/mandar/Desktop/mandar/trash/dj/ai-automation-platform/src/index.css).

---

## 1. Button (`Button.tsx`)

**Purpose:**
Primary interactive trigger for user actions, form submissions, and workflow controls.

**Variants:**
- `primary`: Burnt Orange (`#D97752`) background, warm white text.
- `secondary`: Dark surface (`#131210`) with subtle border (`#28251F`), warm white text.
- `ghost`: Transparent background, muted text, subtle hover highlight.
- `destructive`: Restrained error background (`#281412`), red text (`#F87171`), error border.

**Sizes:**
- `sm` (28px height, 12px font)
- `md` (36px height, 13px font)
- `lg` (44px height, 15px font)

**States:**
- `default`, `hover`, `active`, `focus-visible` (2px burnt orange outline), `disabled` (45% opacity), `loading` (accessible spinning indicator with disabled state).

**Usage:**
```tsx
import { Button } from './components/ui';

<Button variant="primary" size="md" onClick={handleRun}>Run Workflow</Button>
<Button variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>
<Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
<Button variant="primary" loading>Generating...</Button>
```

**Do not use for:**
- Plain text links or navigation bar items.

---

## 2. Input (`Input.tsx`)

**Purpose:**
Single-line textual input fields for workflow names, parameters, search queries, and prompt editing.

**Variants & Modifiers:**
- Standard input
- With left icon (`leftIcon={<Search size={14} />}`)
- With right icon (`rightIcon={<X size={14} />}`)
- With label and error text (`label="Workflow Name"`, `error="Name is required"`)
- With helper caption (`helper="Unique identifier for DAG routing"`)

**States:**
- `default`, `hover`, `focus` (burnt orange border, elevated background), `disabled`, `error` (restrained error border).

**Usage:**
```tsx
import { Input } from './components/ui';
import { Search } from 'lucide-react';

<Input
  label="Filter Workflows"
  placeholder="Search by name or tag..."
  leftIcon={<Search size={14} />}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

---

## 3. Textarea (`Textarea.tsx`)

**Purpose:**
Multi-line textual input for natural language workflow generation, node descriptions, or code/JSON configuration.

**States:**
- `default`, `hover`, `focus`, `disabled`, `error`.

**Usage:**
```tsx
import { Textarea } from './components/ui';

<Textarea
  label="Natural Language Workflow Prompt"
  placeholder="Describe an automated Android workflow..."
  rows={3}
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
/>
```

---

## 4. Card (`Card.tsx`)

**Purpose:**
Structural container for grouped content, workflow summary cards, telemetry metrics, and node inspectors.

**Sections:**
- `Card`: Top-level container (`#0D0C0A` background, `#28251F` border, `10px` radius).
- `CardHeader`: Title and description container.
- `CardTitle`: 15px semi-bold warm white heading.
- `CardDescription`: 13px secondary muted description.
- `CardContent`: Flexible inner content area.
- `CardFooter`: Border-separated bottom actions area.

**Variants:**
- `interactive`: Adds hover border highlight and cursor pointer.
- `selected`: Adds burnt orange border and selected surface tint.

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from './components/ui';

<Card interactive>
  <CardHeader>
    <CardTitle>Expense Receipt Scanner</CardTitle>
    <CardDescription>Triggers on receipt photo, extracts items via OCR</CardDescription>
  </CardHeader>
  <CardContent>
    <p>3 DAG Nodes • Gemini Nano (NPU)</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary" size="sm">Inspect</Button>
  </CardFooter>
</Card>
```

---

## 5. Badge (`Badge.tsx`)

**Purpose:**
Compact visual indicator for classification, tags, runtime locations (`ON_DEVICE`, `CLOUD`), and node categories.

**Variants:**
- `neutral`: Muted surface and border.
- `accent`: Burnt orange soft background and warm orange text.
- `success`: Olive green soft background and success text.
- `warning`: Amber soft background and warning text.
- `error`: Crimson soft background and error text.
- `outline`: Transparent background with subtle border.

**Sizes:**
- `sm` (11px text), `md` (12px text).

**Usage:**
```tsx
import { Badge } from './components/ui';

<Badge variant="accent">ON_DEVICE</Badge>
<Badge variant="success">PASSED</Badge>
<Badge variant="warning">THROTTLED</Badge>
```

---

## 6. StatusIndicator (`StatusIndicator.tsx`)

**Purpose:**
Communicates live execution, health, or connection state with an accessible colored dot and optional label.

**Status Types:**
- `neutral`: Muted idle state.
- `success`: Nominal / completed state.
- `warning`: Throttling / thermal warning state.
- `error`: Execution failure or offline error.
- `running`: Active execution (includes automatic pulse animation).
- `info`: Informational status.

**Usage:**
```tsx
import { StatusIndicator } from './components/ui';

<StatusIndicator status="running" label="Executing OCR node..." pulse />
<StatusIndicator status="success" label="DAG Validated" />
```

---

## 7. Dialog (`Dialog.tsx`)

**Purpose:**
Modal dialog for high-priority user decisions, confirmations, and simulation configuration.

**Features:**
- Accessible backdrop with click-outside dismiss.
- Escape key listener and body scroll-lock.
- Semantic header, title, description, body, and footer actions.
- Uses Lucide `X` icon for close action.

**Usage:**
```tsx
import { Dialog, Button } from './components/ui';

<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Device Resource Simulator"
  description="Test autonomous model selection under edge hardware constraints."
  footer={
    <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>
      Apply Context
    </Button>
  }
>
  <div>Simulator Controls...</div>
</Dialog>
```

---

## 8. Sheet (`Sheet.tsx`)

**Purpose:**
Slide-over drawer for deep technical inspection, node configuration, telemetry timelines, and responsive mobile inspectors.

**Positions:**
- `right` (default for desktop inspector side-panels).
- `left` (for side navigation drawer).
- `bottom` (for mobile-friendly contextual sheets).

**Usage:**
```tsx
import { Sheet } from './components/ui';

<Sheet
  open={inspectorOpen}
  onClose={() => setInspectorOpen(false)}
  side="right"
  title="Node Telemetry Inspector"
  description="Real-time execution latency and memory profiling."
>
  <div>Telemetry Timeline...</div>
</Sheet>
```

---

## 9. Tooltip (`Tooltip.tsx`)

**Purpose:**
Brief contextual hint for compact buttons, technical metrics, and icon-only navigation elements.

**Positions:**
- `top` (default), `bottom`, `left`, `right`.

**Usage:**
```tsx
import { Tooltip, Button } from './components/ui';
import { SlidersHorizontal } from 'lucide-react';

<Tooltip content="Adjust simulated RAM, battery, and thermal state" position="bottom">
  <button className="icon-btn" aria-label="Simulate Device">
    <SlidersHorizontal size={14} />
  </button>
</Tooltip>
```

---

## 10. Navigation Primitives (`Nav.tsx`)

**Purpose:**
Modular primitives for constructing the application navigation in Phase 2.

**Components:**
- `NavItem`: Interactive navigation tab/button with optional Lucide icon, label, and counter badge. Supports `active` and `compact` states.
- `NavGroup`: Container for logically grouped navigation items with an optional uppercase title.
- `NavDivider`: Semantic separator between navigation sections.

**Usage:**
```tsx
import { NavItem, NavGroup, NavDivider } from './components/ui';
import { Home, Workflow, Activity, Settings } from 'lucide-react';

<NavGroup title="Main">
  <NavItem icon={Home} label="Overview" active onClick={() => navigate('home')} />
  <NavItem icon={Workflow} label="Workflows" badge={3} onClick={() => navigate('workflows')} />
</NavGroup>
<NavDivider />
<NavGroup title="System">
  <NavItem icon={Activity} label="Activity" onClick={() => navigate('activity')} />
  <NavItem icon={Settings} label="Settings" onClick={() => navigate('settings')} />
</NavGroup>
```

---

## 11. PageContainer & PageHeader (`PageContainer.tsx`)

**Purpose:**
Standardizes horizontal layout padding, max content widths, vertical rhythm, and screen headings across all routes.

**Widths:**
- `compact`: `680px` (focused forms and wizards)
- `default`: `960px` (standard dashboard / home screens)
- `wide`: `1280px` (workflow library, visual canvas, telemetry monitors)
- `full`: `100%` (specialized edge-to-edge views)

**Usage:**
```tsx
import { PageContainer, PageHeader } from './components/ui';

<PageContainer width="wide">
  <PageHeader
    title="Workflow Library"
    description="Pre-configured and user-defined multi-step AI automations."
    actions={<Button variant="primary" size="sm">Create Workflow</Button>}
  />
  <div className="content">...</div>
</PageContainer>
```

---

## 12. Application Shell & Navigation Architecture (Phase 2)

**Primary Navigation (4 Destinations):**
- **Home**: Dashboard and quick natural language intent initiation.
- **Studio**: Transitional unified workspace combining Visual DAG Builder and Natural Language Planner (with mode switcher until Phase 4).
- **Workflows**: Multi-step automations library and templates.
- **Activity**: Live and historical execution audits, token consumption, and latency telemetry.

**Secondary Navigation (System & Platform):**
- **Models**: On-device (Gemini Nano, NPU TFLite) and cloud model registry.
- **Settings**: Device execution quota, fallback policies, and runtime logs.

**Responsive Shell Behavior:**
- **Desktop (≥901px)**: Primary navigation in top sticky header (`AppHeader`), secondary links adjacent to simulation action, no bottom bar.
- **Mobile (≤900px)**: 4-item primary bottom navigation bar (`BottomNav`), secondary navigation accessible through responsive slide-over sheet drawer (`Menu` button in header).

---

## 13. Studio Unified Editor Components (Phase 4)

Studio is the central workflow-authoring environment unifying Natural Language intent planning and interactive visual DAG construction.

**Key Components:**
- `WorkflowCanvas`: React Flow wrapper (`@xyflow/react`) projecting the authoritative `Workflow` DAG onto an interactive canvas with pan, zoom, fit view, and node/edge interaction.
- `WorkflowCanvasNode`: Custom React Flow node adhering to the EL-06 Obsidian/Warm White/Burnt Orange design system, rendering node type, capability, assigned model delegate, I/O ports, and status indicators.
- `StudioToolbar`: Editor action bar providing workflow title, real-time `DAGValidator` status badge, undo/redo buttons, "Describe" NL prompt toggle, "Add Node" action, and primary "Run" execution trigger.
- `NodeInspector`: Deep inspection and editing panel for selected nodes. Modifies node display label, execution policy (`AUTO`, `FORCE_LOCAL`, `FORCE_CLOUD`, `BATTERY_CONSERVE`), displays underlying capability, input/output data types, model delegates, and upstream dependencies. Renders as a side panel on desktop and a bottom `Sheet` on mobile.
- `AddNodeDialog`: Accessible modal allowing users to search and add supported triggers (`CAMERA_CAPTURE`, `AUDIO_RECORD`, `MANUAL`), AI capabilities (`OCR`, `SPEECH_TO_TEXT`, `SUMMARIZATION`, `CONCEPT_EXTRACTION`, `QUESTION_GENERATION`, `PLANT_DISEASE_DIAGNOSIS`), transforms (`CALCULATE_TOTAL`, `STRUCTURED_JSON_MAP`), and Android actions (`EXPENSE_TRACKER_STORE`, `NOTIFICATION_EMIT`, `SAVE_FILE`).
- `StudioPromptPanel`: Integrated natural-language generator that calls `NLWorkflowPlanner.planFromPrompt` and synchronizes the resulting workflow directly with the canvas.

---

## 14. Workflow Node System & Inspector (Phase 5)

Phase 5 formalizes ONE reusable, consistent workflow node architecture that every current and future workflow node uses, eliminating bespoke, per-capability node markup.

### Core Architectural Primitives

- **`WorkflowNodeShell` (`WorkflowNodeShell.tsx`)**:
  - Unified shell component rendering all node types across triggers, AI capabilities, data transforms, and Android actions.
  - Structure:
    - **Header**: Standard Lucide capability icon, category badge, execution policy badge (`AUTO`, `LOCAL`, `CLOUD`, `BATTERY`).
    - **Body**: Node display label, optional semantic status indicator (`RUNNING`, `SUCCESS`, `FAILED`, `FALLBACK`), concise transformation dataflow string (`Image → Extracted Text`).
    - **Footer**: Output data type badge, resolved model delegate ID (or edge execution location).
    - **Handles**: Standardized target handle (top, only if `inputTypes.length > 0`) and source handle (bottom) with ARIA accessibility labels.
  - Sizing & Styling: 220px standard width, 10px radius (`--radius-md`), Obsidian surface (`--color-surface`), subtle border (`--color-border`), burnt-orange accent outline (`#D97752`) when selected. Zero gradients, glow, or colorful category backgrounds.

- **`node-presentation-registry.tsx`**:
  - Centralized presentation metadata registry mapping all 25+ domain capabilities to standard Lucide icons, human-readable category badges, and dataflow transformation strings.
  - Never mutates domain logic; acts strictly as an authoritative UI projection layer.

- **`WorkflowCanvasNode.tsx`**:
  - Lightweight React Flow memoized wrapper that directly delegates all visual and interaction rendering to `WorkflowNodeShell`.

- **Enhanced `NodeInspector` (`NodeInspector.tsx`)**:
  - Unified, multi-section configuration panel for selected nodes on desktop (fixed 320px right aside) and mobile (bottom slide-over `Sheet`).
  - **Identity**: Capability icon, category, display title, dataflow description, underlying engine name.
  - **Configuration**: Editable display label input with immediate graph synchronization.
  - **Execution Policy**: Direct control over `AUTO`, `FORCE_LOCAL`, `FORCE_CLOUD`, and `BATTERY_CONSERVE`.
  - **Model Delegate Selection**: Queries `ModelRegistry.getByCapability(node.capability)` to present valid model choices or `AUTO`. Calls `ModelSelector.selectBestModel` to present explainable routing rationale (reasons and scores).
  - **Resource Profile**: Surfaces real hardware telemetry (RAM requirement, expected latency ms, battery impact, model quantization, package size, delegate targets). For non-ML nodes, displays native Android OS IPC/service metrics.
  - **Data Contracts (I/O)**: Shows input type badges and output type badge.
  - **Dependencies**: Lists upstream predecessor node IDs.
  - **Actions**: Accessible buttons for duplicating or deleting the active node.

---

## 15. Workflow Library & WorkflowCard System (Phase 6)

Phase 6 rebuilds the Workflows destination as the reusable automation library for EL-06, maintaining a clean architectural separation between library discovery, Studio authoring, and Activity audit logging.

### Core Components

- **`WorkflowsScreen` (`WorkflowsScreen.tsx`)**:
  - Full-screen library container using `PageContainer width="wide"`.
  - **Header**: Standard `PageHeader` with title, subtitle, and primary `New Workflow` action opening Studio.
  - **Client-Side Search**: Live search filtering across workflow names, descriptions, and underlying node capabilities/labels. Includes clear button.
  - **Domain Filters**: Pill-based category filtering (`All Automations`, `Finance`, `Education`, `Healthcare`, `Productivity`) with active count and reset action.
  - **Responsive Grid**: Adaptive layout rendering 1 column on mobile (≤768px), 2 columns on tablet, and 3 columns on desktop (≥1024px).
  - **Empty States**: Distinct, accessible empty states for zero library workflows vs no search/filter matches.

- **`WorkflowCard` (`WorkflowCard.tsx`)**:
  - Reusable card component adhering to the EL-06 Obsidian design system (`--color-surface`, 10px radius, 1px border, burnt-orange accents).
  - **Header**: Domain badge (`Badge variant="neutral"`), version and step count in `JetBrains Mono`, primary workflow title, and 2-line clamped description.
  - **Preview Slot**: Houses `WorkflowPreview` providing immediate visual recognition of the DAG pipeline.
  - **Capability Summary**: Compact, intelligent summary of unique capabilities (e.g. `Camera · OCR · Calculation · +2 more`).
  - **Execution Status**: Real-time integration with `ExecutionHistoryStore` rendering relative timestamp and semantic status (`Completed`, `Failed`, `Running`, or `Not run yet`).
  - **Action Footer**: Subordinate secondary `Open` button (enters Studio) and primary `Run` button (triggers execution handoff).

- **`WorkflowPreview` (`WorkflowPreview.tsx`)**:
  - Lightweight, non-editable read-only DAG preview visualizer.
  - Derives topological execution sequence directly from workflow nodes and edges.
  - Renders miniature node shells with Lucide icons from `node-presentation-registry` and directional `ArrowRight` connectors.
  - Features horizontal scroll track with smooth overflowing and overflow badge (`+N more`).
  - Non-draggable, zero-overhead, completely accessible with ARIA description of the pipeline.

---

## 16. Execution & Activity Experience System (Phase 7)

Phase 7 restructures the execution and activity monitor around a **result-first information hierarchy** (`Result → Execution Summary → Workflow Timeline → Step Details → Technical Data`), creating a unified experience across live workflow runs and historical audit logs.

### Core Presentation Components

- **`ExecutionResultCard` (`ExecutionResultCard.tsx`)**:
  - Result-first outcome hero answering: *What happened? Did it succeed? What did the workflow produce?*
  - Replaces raw latency and hardware counters with human-readable outcome narratives tailored to each domain (Finance, Education, Healthcare, Productivity).
  - Semantic status pill (`StatusIndicator`), workflow title, and clear action row (`Back`, `View Result`, `Re-run` with `id="re-execute-btn"`).
  - Dynamically updates with live progress during workflow execution.

- **`ExecutionSummaryBar` (`ExecutionSummaryBar.tsx`)**:
  - Compact, high-density telemetry strip providing at-a-glance run progress.
  - Step counter and live progress track (`X of Y steps completed`).
  - Formatted elapsed duration (e.g., `1.45s`), start/end timeline timestamps, device model chip, and cache efficiency hits indicator.

- **`ExecutionTimeline` (`ExecutionTimeline.tsx`)**:
  - Clean vertical sequence visualizer tracking data flow across the automation pipeline.
  - Semantic status icons for each step (`CheckCircle2` for success, `Zap` for active, `AlertCircle` for failure, `AlertTriangle` for fallback).
  - Displays data flow description (e.g., `Image → Extracted Text`), resolved execution latency in `JetBrains Mono`, and cache hit badges.
  - Click-to-inspect step selection with accessible keyboard navigation (`Enter` / `Space`).

- **`ExecutionStepDetails` (`ExecutionStepDetails.tsx`)**:
  - Step-level inspection card presenting step purpose, intermediate outputs, and resolved ML delegate.
  - Incorporates `IntermediateResultViewer` to display human-readable outputs first.
  - Resolved ML delegate chip with hardware target (On-Device NPU/CPU vs Cloud API) and deep explainability trigger (`Why this model? ↗`).
  - Progressive disclosure toggle for **Technical Diagnostics & Logs**, revealing memory consumption, execution latency, and console log lines.

- **`IntermediateResultViewer` (`IntermediateResultViewer.tsx`)**:
  - Intelligent output formatter rendering text strings as readable paragraphs, structured records as clean key-value grids, and images as inline previews.
  - Includes progressive disclosure button for raw JSON inspection with copy-to-clipboard functionality.

- **`ExecutionDetailView` (`ExecutionDetailView.tsx`)**:
  - Unified detail container shared between live runtime monitoring (`ExecutionMonitorScreen`) and historical audit review (`ActivityScreen`).
  - Dual-column responsive split layout on desktop (Timeline on left, Step Inspector on right).
  - Bottom `Sheet` drawer on mobile viewports (≤900px) when selecting timeline steps.
  - Subordinate, collapsible input source bar for live execution (`#real-image-input` file upload and preset selectors).

- **`ActivityScreen` (`ActivityScreen.tsx`)**:
  - Redesigned execution audit log replacing legacy JSON modals with a clean card list and seamless drill-down into `ExecutionDetailView`.
  - Search input for filtering by workflow name or status.
  - Status filter tabs (`All Runs`, `Successful`, `Failed`) with live record counts.
  - High-density activity cards displaying relative execution timestamps, step counts, duration, RAM usage, and cache hit metrics.

---

## 17. Models & Settings Surfaces (Phase 8)

### Architectural Intent
Models and Settings are supporting technical control surfaces in the secondary product hierarchy. They provide deep, transparent inspectability and runtime configuration without competing visually or conceptually with the primary workflow builder (Studio) or library (Workflows).

### Models Catalog (`src/ui/components/models/`)
- **`ModelCard` (`ModelCard.tsx`)**:
  - Standardized technical card representing an individual registered model from `ModelRegistry`.
  - Visual grammar:
    - Top header: Capability category badge (with Lucide icon from `node-presentation-registry`), execution location badge (`On-device`, `Cloud API`, `On-device + Cloud`), quantization chip (`INT8`, `FP16`), and package size in MB.
    - Identity: Model name and version tag.
    - I/O Contract: Clean arrow notation (`IMAGE → TEXT`, `AUDIO_STREAM → TEXT`).
    - Description: Concise purpose summary.
    - Performance Metrics Strip: Expected latency in `JetBrains Mono` (e.g., `~320ms`), RAM requirement (e.g., `65 MB`), and quality benchmark percentage (e.g., `81%`).
    - Memory Lifecycle Status: Real-time resident RAM allocation state via `StatusIndicator` (`Active in RAM` vs `Idle in Storage`) and supported hardware delegates (`NNAPI`, `GPU_VULKAN`, `CPU`).
    - Actions: Deep explainability trigger (`Why this model? ↗`), manual selection/pinning (`Select` / `Selected`), memory allocation toggle (`Preload` / `Unload`), and detail inspector (`Inspect Spec`).
- **`ModelDetailSheet` (`ModelDetailSheet.tsx`)**:
  - Progressive disclosure drawer implemented using the design system `Sheet` primitive.
  - Hardware & Performance Profile grid: RAM requirement, expected latency, quality score, package size, quantization, battery impact, parameters count, and supported delegates.
  - Memory Allocation Status: Live allocation toggle allowing manual memory preload/unload with instant memory budget recalculation.
  - Collapsible Raw Specification: Toggable `model-spec.json` preview with one-click clipboard copying.
- **`ModelRegistryScreen` (`ModelRegistryScreen.tsx`)**:
  - Technical catalog view with compact header and active memory budget tracker (`X MB / 2048 MB budget`).
  - Automatic execution policy rationale callout explaining dynamic scoring based on thermal, battery, and memory state.
  - Fast search input filtering across model names, capabilities, delegates, and architectures.
  - Capability selector dropdown and execution target filter tabs (`All`, `On-Device`, `Cloud`).
  - Dynamic `ExplainabilityModal` integration displaying genuine multi-factor compatibility scores.

### Settings Control Panel (`src/ui/components/settings/`)
- **`SettingsSection` (`SettingsSection.tsx`)**:
  - Reusable card container standardizing settings visual grammar with section icon, title, description, and optional header action.
- **`SettingsToggle` (`SettingsToggle.tsx`)**:
  - Accessible toggle switch meeting WAI-ARIA guidelines (`role="switch"`, `aria-checked`), complete with title, explanatory description, and status badge.
- **`SettingsScreen` (`SettingsScreen.tsx`)**:
  - Structured 5-section control panel:
    1. **Data Privacy & Cloud Boundary**: Explicit toggle for `allowCloudInference` with unambiguous local data boundary implications and live network connectivity status.
    2. **Model Lifecycle & Active Memory**: Progress bar tracking active weights against mobile RAM budget (2048 MB), list of currently resident models with individual unload triggers, and destructive `Unload All` dialog with explicit confirmation.
    3. **Deterministic Intermediate Result Cache**: Live cache telemetry (cached entries, hits, misses, hit ratio percentage), explicit cache key structure (`workflowId::nodeId::inputHash::modelVersion::parameters`), and destructive `Clear Cache` dialog with explicit confirmation.
    4. **Runtime Hardware Simulation & Constraints**: One-touch hardware presets (`Pixel 8 Pro (NPU)`, `Budget (4GB RAM)`, `Offline Field Device`), power saver toggle, battery percentage/charging indicator, and thermal status.
    5. **Platform & System Information**: Definition-list grid rendering actual device context (OS, target device, RAM capacity, hardware acceleration, CPU cores, runtime version) and project attribution.

---

## 18. Motion System & Micro-Interactions (Phase 9)

### Architectural Intent
Motion in EL-06 is strictly governed by the principle:
> **Animation communicates state, hierarchy, or causality.**

Motion does not decorate, distract, or compensate for missing structure. The application strictly prohibits decorative AI tropes (no particle systems, glowing blobs, liquid gradients, neural net animations, or continuously moving graph backgrounds).

### Motion Tokens (`src/ui/motion/motion-tokens.ts`)
Standardized duration tiers and controlled easing curves:
- **Duration Tiers**:
  - `micro`: `140ms` (hover, button press active scale, handle highlights, toggle state shifts).
  - `standard`: `220ms` (page entrance settle, dialog / sheet transitions, list filtering updates, step transitions).
  - `emphasis`: `320ms` (complete panel reveals, complex modal layout changes, causal result card reveal).
- **Controlled Easing**:
  - `easeOut`: `[0.16, 1, 0.3, 1]` (clean deceleration for entering elements).
  - `easeInOut`: `[0.4, 0, 0.2, 1]` (smooth state and dimension shifts).
  - `subtleSpring`: `{ damping: 26, stiffness: 320 }` (physics-guided without visual bounce or overshoot).

### Reusable Motion Primitives & Patterns (`src/ui/motion/`)
- **`PageMotion` (`PageMotion.tsx`)**:
  - Wraps all top-level screen containers (`page-home`, `page-studio`, `page-workflows`, `page-models`, `page-activity`, `page-settings`, `page-execution`).
  - Standard mode: restrained 6px vertical settle with 220ms ease-out opacity.
  - Reduced-motion mode: instantaneous 50ms opacity fade without positional displacement.
- **`Dialog` & `Sheet` Motion**:
  - `Dialog`: Opacity fade on overlay + 2% scale settle (`scale: 0.98 -> 1`) with 220ms ease-out.
  - `Sheet`: Directional slide (`x: 24 -> 0` for right sheets, `y: 24 -> 0` for bottom mobile sheets).
- **Node Selection & Execution Motion**:
  - Selected state: Burnt orange border transition with subtle box-shadow highlight without scaling or repositioning nodes.
  - Running state: Status indicator dot pulses (`el-status-indicator__dot--pulse`); edges are intentionally static (`animated: false`) to avoid idle CPU burn and graph-wide distraction.
- **Workflow Generation Causality**:
  - Natural language planner reveals generation state with spinner and causal status indicator (`Planning DAG...`) before rendering nodes in topological execution order.
- **Reduced Motion Support**:
  - All primitives consume `useReducedMotion()` from `motion/react` and CSS `@media (prefers-reduced-motion: reduce)`.
  - In reduced-motion mode, all non-essential transitions are set to 0.01ms / disabled while maintaining full state and accessibility clarity.




