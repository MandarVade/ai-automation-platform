# EL-06 Architecture Documentation
## General-Purpose No-Code AI Automation Platform for Android
**Team:** SATYAGRAH 2.0  
**Project Identifier:** EL-06 (DJS NSDC Hackathon)

---

## 1. Architectural Philosophy: User Defines What, Platform Decides How
Traditional automation tools on mobile either provide rigid, hardcoded single-purpose pipelines or expose complex developer-facing low-level APIs. EL-06 bridges this chasm by decoupling user intent from execution details:
- **Intent Ingestion:** Users express their desired automation using either Natural Language ("*Take a photo of my bill, calculate total and add to expense tracker*") or visual block composition (Triggers, AI steps, Transforms, and Android Actions).
- **Autonomous Device-Aware Runtime:** The underlying platform inspects the execution graph, evaluates device resources (RAM headroom, battery %, thermal state, network connectivity, and hardware acceleration delegates like NPU/GPU), autonomously selects and ranks models from a curated registry, decides between on-device and cloud routing, manages model memory lifecycles dynamically, and executes Android actions.

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|    Natural Language Intent Planner  |  Visual No-Code DAG Canvas        |
|    Single Notification Controllable Action  |  Execution Inspector      |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                             WORKFLOW CORE                               |
|   NL Parser & Slot Extractor  -->  Typed DAG Schema & Validator (DFS)   |
|   Kahn's Topological Scheduler -->  State Machine (QUEUED->RUNNING)     |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  AUTONOMOUS MODEL SELECTION & ROUTING                   |
|   Model Registry  <-- Multi-Factor Scoring Engine --> Device Context    |
|   (Size, Latency,       (Score = CapFit + Quality      (RAM, Battery,   |
|    Delegates, RAM)       + HWFit + MemFit - Penalty)    Thermals, Net)  |
|                                    |                                    |
|              Hybrid Execution Router (Local vs Cloud)                   |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       EXECUTION & RESOURCE RUNTIME                      |
|   Deterministic Cache (SHA-256) | Memory Lifecycle Manager (LRU Unload) |
|   ONNX Runtime Mobile / LiteRT  | Cloud Inference Gateway               |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           ANDROID ACTION LAYER                          |
|   CameraX Adapter  | AudioRecorder Adapter | SQLite Expense Ledger      |
|   NotificationCompat | File Sandbox Storage | Share Intents             |
+-------------------------------------------------------------------------+
```

---

## 2. Clean Architecture Breakdown

### A. Core Layer (`core/`)
- `core/workflow/`:
  - `DAGModels.ts` / `DAGModels.kt`: Typed nodes, edges, I/O data types, and lifecycle states.
  - `dag-validator.ts` / `DAGValidator.kt`: Cycle detection using Depth-First Search with recursion stacks, missing dependency checks, data type compatibility verification, and Kahn's topological sort.
  - `nl-planner.ts`: Slot extraction rule engine converting natural language text into a structured, validated DAG.
  - `engine.ts`: Asynchronous DAG execution engine with event streaming, intermediate data routing, and fallback recovery.
- `core/model/`:
  - `registry.ts` / `ModelRegistry.kt`: Catalog of on-device and cloud models with complete metadata (RAM, latency, quantization, hardware delegates).
  - `selector.ts` / `ModelSelector.kt`: Multi-factor scoring algorithm and explainability generator.
  - `lifecycle.ts`: Dynamic memory-aware model loader and LRU unloader to prevent mobile Out-Of-Memory (OOM) conditions.
- `core/resources/`:
  - `device-context.ts` / `AndroidDeviceManager.kt`: Real-time tracking of RAM, battery %, charging state, thermal throttling, and network status with live simulation controls.
- `core/routing/`:
  - `execution-router.ts` / `ExecutionRouter.kt`: Intelligent decision matrix routing tasks to `LOCAL_NPU`, `LOCAL_GPU`, `LOCAL_CPU`, or `CLOUD`.
- `core/cache/`:
  - `result-cache.ts` / `IntermediateResultCache.kt`: Deterministic SHA-256 hashing based on `workflowId + nodeId + inputHash + modelVersion + params`.
- `core/actions/`:
  - `android-actions.ts` / `AndroidActionAdapter.kt`: Controlled bridge isolating AI execution from Android system APIs (Camera, Audio, Storage, Notifications, Ledger).
- `core/notification/`:
  - `notification-controller.ts`: Implements the Problem Statement requirement: *"Everything must be controllable from a single notification controllable action."*

### B. Data Layer (`data/`)
- `templates.ts`: First-class implementations of the 3 Problem Statement workflows (Finance Bill OCR, Education Lecture STT & Quiz, Botanical Healthcare Plant Vision).
- `history-store.ts` / `WorkflowEntity.kt`: Persistent storage of execution telemetry and audit records.
- `AppDatabase.kt`: Room SQLite database for persistent background workflows.

### C. UI / Presentation Layer (`ui/`)
- Pure Vanilla CSS Material 3 Dark engineering aesthetic.
- Zero generic SaaS fluff, zero rainbow gradients, zero fake delays.
- Real-time SVG DAG visualizer, live telemetry meters, and interactive explainability modals.
