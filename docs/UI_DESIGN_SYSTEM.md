# EL-06 Frontend Design Constitution

## Status

This document is the visual and UX source of truth for the EL-06 frontend.

All future frontend changes must follow these rules unless a deliberate design-system revision is explicitly approved.

The frontend is a general-purpose no-code AI automation platform for Android.

The product principle is:

USER SPECIFIES WHAT.
PLATFORM DETERMINES HOW.

The interface must communicate this principle through simplicity, hierarchy, and interaction rather than through marketing language.

---

## 1. Visual Direction

The product uses a minimal black / warm-white / burnt-orange visual system.

The visual character should feel:

* precise
* calm
* technical
* premium
* restrained
* modern
* trustworthy
* product-oriented

It should feel like a serious automation workspace, not an AI marketing website.

The design may take inspiration from the visual restraint of Claude/Anthropic, but must not copy Claude's branding, layouts, assets, or exact visual identity.

The design language is:

OBSIDIAN + WARM WHITE + BURNT ORANGE.

---

## 2. Absolute UI Rules

DO:

* use large amounts of negative space
* use strong typography
* use near-black surfaces
* use warm off-white text
* use orange sparingly
* use thin borders
* use subtle hover states
* use consistent spacing
* use progressive disclosure
* show only information needed at the current decision point
* keep technical information available but secondary
* use animation to communicate state and hierarchy

DO NOT:

* use emojis in the application UI
* use emoji-based icons
* use Unicode characters as navigation icons
* use rainbow gradients
* use purple/blue AI gradients
* use glassmorphism
* use excessive blur
* use glowing cards
* use neon borders
* use floating decorative blobs
* use unnecessary particles
* use 3D decorative objects
* use excessive rounded containers
* use giant text paragraphs
* use marketing copy inside application screens
* use "AI-powered", "smart", "next-gen", "revolutionary" filler labels
* add decorative UI that does not communicate function
* add information simply because it is technically available

The application should be visually quiet.

---

## 3. Color Tokens

Primary background:

#080806

Primary surface:

#0D0C0A

Secondary surface:

#131210

Elevated surface:

#181613

Subtle border:

#28251F

Strong border:

#353129

Primary text:

#F2F0EA

Secondary text:

#A7A39B

Muted text:

#706C64

Primary accent:

#D97752

Accent hover:

#E48763

Accent soft:

#2A1812

Success:

#7FA66A

Warning:

#D59A52

Error:

#C85B4A

The orange accent must remain visually dominant only for actions, focus, selection and important activity.

Do not use blue, cyan, teal, indigo or purple as general-purpose accent colors.

Semantic colors may be used only when they communicate actual state.

---

## 4. Typography

Primary typeface:

Inter.

Weights:

400 body
500 labels
600 headings
650/700 major headings

Technical typeface:

JetBrains Mono.

Use JetBrains Mono only for:

* model IDs
* node types
* JSON
* RAM
* latency
* technical telemetry
* execution IDs
* system diagnostics
* code-like values

Minimum normal UI font size:

12px.

Avoid 9px and 10px text.

Recommended scale:

Display: 64px
Hero: 56px
H1: 36px
H2: 26px
H3: 20px
Body: 15px
Small: 13px
Caption: 12px
Technical: 12px

---

## 5. Spacing

Use a consistent 4px-based spacing system.

Preferred spacing:

4
8
12
16
20
24
32
40
48
64
80
96

Do not introduce arbitrary spacing values unless necessary.

Large sections should have generous vertical spacing.

---

## 6. Cards

Cards are functional containers, not decorative objects.

Default:

background: #0D0C0A
border: 1px solid #28251F
radius: 10px
shadow: none

Hover:

background: #11100E
border: #40382F

Selected:

border: primary orange

Avoid:

* huge corner radii
* heavy shadows
* gradients
* glowing edges
* glass effects

---

## 7. Buttons

Three primary button levels exist.

Primary:

* burnt orange background
* warm white text
* used for the main action

Secondary:

* dark surface
* subtle border
* used for supporting actions

Ghost:

* transparent
* text only
* used for tertiary actions

Only one primary action should normally dominate a section.

Do not create multiple visually equivalent primary buttons.

---

## 8. Icons

Use one icon family throughout the product.

Preferred:

Lucide.

Do not use:

* emojis
* Unicode symbols
* mixed icon libraries
* manually drawn inconsistent icons

Icons should normally be 16px or 18px in compact UI and 20px or 24px in navigation.

---

## 9. Navigation

Primary navigation:

Home
Studio
Workflows
Activity

Do not expose Models and Settings as primary bottom-navigation destinations.

Models and Settings belong in secondary/header navigation.

Studio is the central product workspace.

---

## 10. Home

Home is the product introduction and quick-launch surface.

It must not become another dense engineering dashboard.

Primary structure:

1. concise hero
2. natural-language workflow input
3. example workflows
4. brief product capability explanation
5. optional recent activity/device state

The hero should use large typography and generous negative space.

The hero should remain predominantly black.

Avoid colorful gradient backgrounds.

A subtle warm orange ambient light may be used if extremely restrained.

---

## 11. Studio

Studio is the central workspace.

It combines:

Natural Language Workflow Creation
+
Visual Workflow Editing

The intended flow is:

Describe
→ Generate
→ Inspect
→ Edit
→ Validate
→ Run

The user should not have to navigate between separate NL Create and Visual Builder screens.

---

## 12. Workflow Canvas

The workflow canvas must behave as a true no-code editor.

Nodes must support:

* drag
* select
* edit
* duplicate
* delete
* connect
* disconnect
* zoom
* pan

The canvas should support:

* undo
* redo
* validation
* visible input/output types
* selected-node inspection
* node configuration

The visual design should remain minimal.

Do not use large colorful cards for nodes.

Selection should be communicated primarily through a thin orange outline and subtle state changes.

---

## 13. Node Design

Nodes should visually communicate:

* name
* category
* input/output
* model when relevant
* execution mode when relevant

Do not overload the node with technical information.

Detailed configuration belongs in the inspector.

---

## 14. Node Inspector

The inspector is the advanced control surface.

It should expose:

* node name
* capability
* model
* execution policy
* input type
* output type
* configuration
* resource estimate
* model-selection explanation

The inspector should use progressive disclosure.

---

## 15. Model Registry

The model registry is an advanced technical surface.

The primary product should not force users to manually choose models.

Default behavior:

AUTO SELECT.

The UI should explain:

Selected model
Why it was selected
Resource implications

Manual model override should remain available for technical users.

---

## 16. Execution

Execution results must be user-first.

First show:

* completed state
* actual result
* important outcome
* concise execution summary

Then allow the user to open:

* model
* RAM
* latency
* routing
* cache
* intermediate output
* technical logs

The execution screen must not present raw JSON as the primary result.

---

## 17. Technical Information

Technical depth is important to the product and hackathon demonstration.

However:

technical information is secondary.

Use progressive disclosure.

Normal:

"Saved expense: ₹48.06"

Advanced:

"PaddleOCR Mobile v4 · LOCAL_NPU · 140 MB · 450 ms"

Developer:

Raw execution data / JSON / telemetry.

---

## 18. Animation

Animation should communicate:

* state changes
* hierarchy
* transitions
* workflow execution
* selection
* progress

Animation should not exist only for decoration.

Preferred library:

Motion for React.

Preferred animation characteristics:

* short
* subtle
* smooth
* interruptible
* low amplitude

Avoid:

* infinite decorative animation
* particle systems
* animated gradients
* 3D objects
* excessive parallax
* attention-grabbing effects

Respect reduced-motion preferences.

---

## 19. Home Page Animation

Acceptable:

* subtle hero entrance
* workflow node sequence reveal
* scroll reveal
* button micro-interaction
* workflow line animation
* restrained ambient movement

Not acceptable:

* colorful AI blobs
* liquid gradients
* floating spheres
* shader-heavy backgrounds
* glowing particles
* 3D AI objects

---

## 20. Information Density

Every screen should answer:

"What does the user need to know or do here?"

Remove anything that does not help answer that question.

Do not expose internal architecture merely because the information exists.

Do not add explanatory paragraphs where a label, number, status or visual relationship is sufficient.

Prefer:

"Local"

over:

"Execution is currently being performed using local device inference."

Prefer:

"3.4 GB available"

over:

"The device currently has approximately 3.4 GB of available RAM headroom."

---

## 21. Copywriting

Application copy must be:

* concise
* direct
* factual
* functional

Avoid:

* marketing slogans inside dashboards
* excessive descriptions
* AI buzzwords
* filler
* conversational assistant language

Buttons should use verbs:

Create
Run
Edit
Save
Inspect
Open
Delete
Retry
Change model

---

## 22. Responsive Behavior

Desktop/tablet:

* optimized for workflow construction
* larger canvas
* side inspector
* technical controls

Mobile:

* optimized for execution
* camera
* microphone
* notifications
* results
* compact workflow inspection

The same design language must apply to both.

---

## 23. Component Consistency

Reusable components must be preferred over screen-specific implementations.

Core shared components should include:

Button
Input
Card
Badge
Dialog
Drawer
Sheet
Tooltip
Tabs
Select
Dropdown
Status
Metric
Node
NodeInspector
WorkflowCard
ExecutionStatus
SectionHeader

New screens should compose these primitives rather than inventing new styles.

---

## 24. Source of Truth

Before implementing a new UI pattern:

1. Check this design constitution.
2. Check existing shared components.
3. Reuse existing design tokens.
4. Search the approved component registry if appropriate.
5. Only create a new component when an existing component cannot reasonably support the requirement.

Do not introduce a new visual pattern casually.

---

## 25. Definition of a Successful Frontend

The final frontend should feel like:

A serious automation workspace.

It should not feel like:

An AI landing page.
A generic SaaS dashboard.
A developer console.
A collection of unrelated demo screens.

The interface should make the product concept immediately understandable:

Describe what you want.
See how EL-06 plans to do it.
Edit the workflow.
Run it.
Understand the result.
Inspect the technical decisions when needed.

The architecture can be complex.

The interface should not be.
