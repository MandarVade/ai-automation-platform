# EL-06 — Models & Settings Architecture

## Product Hierarchy Context

EL-06 maintains a strict distinction between primary workflow experiences and secondary technical control surfaces:

```text
Primary Product Experience
  Home (First-Entry & Fast-Start Templates)
    ↓
  Studio (Unified NL + Visual Graph Authoring)
    ↓
  Workflows (Automation Library & Lifecycle)
    ↓
  Activity (Execution Timeline & Audit History)

Secondary Supporting Technical Surfaces
  Models (Catalog, Contracts & Explainable Selection)
  Settings (Privacy Boundary, Memory Lifecycle, Caching & Telemetry)
```

The Models and Settings screens support the user and system operations without competing visually or conceptually with Studio. They are disciplined technical control surfaces that avoid decorative visual noise, oversized marketing headers, or gamified metric badges.

---

## 1. Models Catalog & Selection Architecture

### 1.1 Core Principles
- **No Marketplace Metaphors**: Models are functional execution engines registered in `ModelRegistry`, not marketplace items. No ratings, stars, or arbitrary rankings.
- **Genuine Specifications**: All telemetry (latency, memory consumption, quality benchmarks, quantization, supported delegates) originates directly from concrete `ModelSpec` definitions.
- **Explainable Selection**: Autonomous model routing (`AUTO`) uses multi-attribute scoring based on current device conditions (thermal state, battery reserve, available RAM, network bandwidth, and hardware delegates). Users can query selection rationale through `ExplainabilityModal`.
- **Manual Pinning**: Workflows can lock specific models when required, visually differentiated from autonomous routing.

### 1.2 ModelCard Anatomy
Every model card follows a unified visual grammar:
1. **Header Badges**:
   - Capability Category (with iconography from `node-presentation-registry`)
   - Execution Location (`On-device`, `Cloud API`, `On-device + Cloud`)
   - Quantization chip (`INT8`, `FP16`, `INT4`) and disk size
   - Selection status badge (`Selected`)
2. **Identity**: Model name and semantic version string.
3. **I/O Contract**: Clean arrow notation specifying input/output data types (`IMAGE → TEXT`, `AUDIO_STREAM → TEXT`).
4. **Purpose Description**: Brief functional summary.
5. **Performance Strip**: Expected latency (e.g. `~320ms`), resident RAM requirement (e.g. `65 MB`), and quality benchmark percentage (e.g. `81%`).
6. **Memory Lifecycle**: Live residency indicator (`Active in RAM` vs `Idle in Storage`) and supported hardware acceleration targets (`NNAPI`, `GPU_VULKAN`, `CPU`, `CLOUD_API`).
7. **Action Triggers**:
   - Explainability (`Why this model? ↗`)
   - Preload / Unload weight buffers
   - Deep Specification Inspector (`Inspect Spec`)

### 1.3 Progressive Disclosure via ModelDetailSheet
When inspecting a model's specification, information unfolds progressively:
- Functional summary and I/O contracts
- Full hardware and resource profile
- Resident memory status with immediate preload/unload actions
- Collapsible raw `model-spec.json` with one-click copy

---

## 2. Settings & System Control Architecture

### 2.1 Section Hierarchy
The Settings screen organizes technical controls into five coherent sections:

1. **Data Privacy & Cloud Boundary**:
   - Explicit toggle for `allowCloudInference` (`DeviceContextManager`).
   - Unambiguous privacy guarantees: When disabled, all camera, audio, and document inputs remain strictly on-device.
   - Live network status indicators (`High-Speed Wi-Fi`, `Cellular`, `Offline`).
2. **Model Lifecycle & Active Memory**:
   - Live visual progress bar monitoring active model weights against the 2048 MB mobile RAM budget (`ModelLifecycleManager`).
   - Resident model registry showing memory footprint and execution counters.
   - Individual unload triggers and destructive `Unload All` dialog with explicit confirmation.
3. **Deterministic Intermediate Result Cache**:
   - Telemetry grid tracking cached entries, cache hits, cache misses, and calculated hit ratio (`IntermediateResultCache`).
   - Transparent cache key specification: `workflowId::nodeId::inputHash::modelVersion::parameters`.
   - Destructive `Clear Cache` dialog with confirmation.
4. **Runtime Hardware Simulation & Constraints**:
   - Quick testing presets for Android hardware tiers:
     - `Pixel 8 Pro (NPU)` (Tensor G3, 12GB RAM, NPU enabled)
     - `Budget (4GB RAM)` (Quad-core, 4GB RAM, CPU fallback)
     - `Offline Field Device` (Battery critical, cellular disabled, local execution only)
   - Mobile power saver mode toggle.
   - Real-time battery level and thermal status indicators.
5. **Platform & System Information**:
   - Technical definition grid rendering actual Android API, target hardware model, total/available RAM, hardware acceleration, CPU cores, and runtime version.
   - Project attribution (EL-06 by Team SATYAGRAH 2.0).

---

## 3. Safe Operations & State Synchronization

- **Synchronous Context Updates**: Changes in Settings instantly propagate to `DeviceContextManager`, `IntermediateResultCache`, and `ModelLifecycleManager` through event subscriptions.
- **Destructive Action Confirmation**: Destructive operations (`Clear Cache`, `Unload All Models`) require explicit modal confirmation through the design system `Dialog` primitive.
- **Zero Core Tampering**: Frontend presentation cleanly separates from backend semantics in `src/core/`. No model selection algorithms, execution routers, or Android bindings were altered.
