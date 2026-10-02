# EL-06 Hackathon Demonstration Guide
## Step-by-Step Presentation Script for Judges
**Team:** SATYAGRAH 2.0  
**Project:** EL-06 — General-Purpose No-Code AI Automation Platform for Android  
**Target Pitch Time:** 60–90 seconds

---

## 1. Opening Statement (15 seconds)
> *"Judges, today building multi-model AI automations on Android requires hardcoded developer pipelines and manual model integration.  
> Our project, **EL-06 by Team SATYAGRAH 2.0**, is a general-purpose, no-code AI automation platform built on one core principle:  
> **The user defines WHAT; the platform autonomously decides HOW.**"*

---

## 2. Live Demo Step 1: Natural Language Intent Planning (20 seconds)
1. Open the platform at `http://localhost:5173/` or launch the app.
2. In the hero box on the Home screen or **NL Create** tab, point to the input:
   > *"Watch how a single natural language request is understood:"*
3. Click or type:  
   `"Take a photo of my bill, extract items and prices, calculate total and categorize the expense."`
4. Click **Plan Workflow**:
   - Highlight the **Intent Recognition & Slot Extraction** panel:
     - Detects Camera capture
     - Identifies OCR capability
     - Flags calculation & summation
     - Assigns BERT expense categorization
     - Routes to SQLite expense ledger
   - Show the generated, validated 5-node DAG on the SVG canvas.

---

## 3. Live Demo Step 2: Device-Aware Autonomous Execution (30 seconds)
1. Click **▶ Run Workflow Now** (or select the **Smart Bill & Expense Processor** from the home screen).
2. On the **Execution Monitor** screen:
   - Point to the live DAG highlighting each node as it executes.
   - Point to **PaddleOCR Mobile v4**:
     > *"Notice that our platform didn't just pick a hardcoded model. It queried the Android device context: detected an active NPU via NNAPI, checked that 140MB RAM was available, and ranked PaddleOCR at 89/100."*
   - Click on the step in the timeline and click **Why this model? ↗**:
     - Show the judges the multi-factor score breakdown (Accuracy, Latency, Hardware delegate, RAM headroom).
   - Show step 3 (**Extract & Calculate Sums**): Subtotal $32.50 + Tax $2.76 = Total $35.26.
   - Show step 4 (**BERT Categorization**): Groceries & Household Supplies (96% confidence).
   - Show step 5 (**Expense Ledger DB**): Stored into local ledger and notification emitted.
3. Click **↺ Re-execute Workflow**:
   > *"Watch what happens on re-run: Our Deterministic Intermediate Result Cache identifies identical input hashes and serves the result instantly with `⚡ CACHE HIT`, saving computation and battery."*

---

## 4. Live Demo Step 3: Edge Constraint Simulation & Multi-Domain Proof (20 seconds)
1. Click **⚙️ Simulate Device** in the top bar:
   - Click **⚠️ Offline Critical (14% Bat / Severe)**.
   - Click **Apply Context**.
   - Show judges how the top bar immediately updates to Offline & Low Battery.
2. Navigate to **NL Create** and choose:
   `"Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions."`
   > *"Here is our second official PS workflow running on the EXACT same workflow engine: Speech-to-Text, Concept extraction, Study notes summarization, and a 5-question multiple-choice quiz generator."*
3. Click **Visual Builder**:
   - Click **Load Plant Template**:
   - Show the botanical pathology pipeline (*MobileNetV4 AgroVision Pathologist -> Treatment Synthesizer -> Save Care Plan*), fulfilling the third official PS requirement.

---

## 5. Live Demo Step 4: The Single Notification Controllable Action (10 seconds)
1. Point to the top **Notification Action Bar**:
   > *"As required by the official Problem Statement, the entire execution is controllable from a single notification controllable action with progress tracking and pause/run triggers."*
2. Conclude:
   > *"This is not a mock landing page or a toy demo. It is a genuine, general-purpose, device-aware AI execution platform for Android."*
