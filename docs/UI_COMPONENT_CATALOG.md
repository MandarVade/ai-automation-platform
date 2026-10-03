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

