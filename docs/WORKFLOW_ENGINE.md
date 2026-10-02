# EL-06 Workflow Engine Specification
## Directed Acyclic Graph (DAG) Execution & Validation
**Team:** SATYAGRAH 2.0  
**Project:** EL-06

---

## 1. Typed DAG Representation
Workflows in EL-06 are represented as strictly typed Directed Acyclic Graphs. Nodes specify required input data types, emitted output data types, and dependencies.

### Node Categories
1. **TRIGGER:** Initiates pipeline execution (`CAMERA_CAPTURE`, `AUDIO_RECORD`, `FILE_PICKER`, `MANUAL`).
2. **AI:** Executes machine learning inference (`OCR`, `SPEECH_TO_TEXT`, `SUMMARIZATION`, `CONCEPT_EXTRACTION`, `QUESTION_GENERATION`, `PLANT_DISEASE_DIAGNOSIS`, `EXPENSE_CATEGORIZATION`).
3. **TRANSFORM:** Deterministic mathematical or formatting operations (`CALCULATE_TOTAL`, `STRUCTURED_JSON_MAP`, `TEXT_FORMATTER`).
4. **ANDROID_ACTION:** Controlled interaction with Android operating system subsystems (`EXPENSE_TRACKER_STORE`, `STUDY_NOTES_STORE`, `CARE_PLAN_STORE`, `NOTIFICATION_EMIT`, `SAVE_FILE`).

---

## 2. Graph Validation & Cycle Detection
Before any workflow is executed, it passes through `DAGValidator.validate()`:
1. **Cycle Detection:** Depth-First Search with an active recursion stack. Any back-edge triggers a diagnostic error indicating the exact loop path.
2. **Disconnected Edge Verification:** Checks that all edge sources and targets exist within the workflow node set.
3. **Data Type Compatibility:** Verifies that source node `outputType` matches target node `inputTypes` (e.g., flags an invalid attempt to feed an raw `IMAGE` directly into a `SPEECH_TO_TEXT` node without an adapter).
4. **Topological Ordering:** Computes a deterministic execution sequence using Kahn's in-degree queue algorithm.

---

## 3. Dynamic Model Lifecycle Management
Mobile devices operate under severe memory constraints. Keeping multiple transformer models simultaneously loaded into memory triggers the Android Low Memory Killer (LMK).
EL-06 solves this via `ModelLifecycleManager`:
- **Lazy Loading:** Models are loaded into RAM only when the pipeline execution reaches the corresponding node.
- **LRU Eviction:** If total allocated model weights exceed the device active memory budget (e.g. 2048MB), inactive models are unmapped and evicted using Least Recently Used (LRU) policy.
- **Proactive Unloading:** Heavy generative models (>300MB) are proactively unloaded upon step completion to restore system memory headroom for subsequent pipeline stages.

---

## 4. Deterministic Intermediate Result Caching
To minimize latency and preserve battery reserves, expensive AI steps check the `IntermediateResultCache`:
$$\text{CacheKey} = \text{SHA256}(\text{WorkflowId} \parallel \text{NodeId} \parallel \text{InputHash} \parallel \text{ModelVersion} \parallel \text{Parameters})$$
- If the cache key matches a previously computed result, the model is not loaded, inference is bypassed, latency drops to ~0ms, and battery draw is zero.
- Re-executing workflows in the EL-06 platform immediately flags steps with `⚡ CACHE HIT`.

---

## 5. Failure Handling and Fallback Architecture
If an on-device inference failure or simulated Out-of-Memory (OOM) occurs:
1. The engine catches the exception and transitions the node to `FALLBACK` state.
2. If `fallbackPolicy.enableSmallerModelFallback` is enabled, memory is released and a quantized lightweight model is invoked.
3. If `fallbackPolicy.enableCloudFallback` is enabled and network is available, the request is transparently offloaded to a secure cloud endpoint.
4. If all fallbacks fail, the workflow reports a clean, user-friendly diagnostic error without crashing the host Android environment.
