# EL-06 Model Selection & Resource Routing
## Autonomous Model Ranking & Explainability Engine
**Team:** SATYAGRAH 2.0  
**Project:** EL-06

---

## 1. Multi-Factor Scoring Formula
Rather than hardcoding models or picking the first match in a list, EL-06 scores every registered model candidate against live Android device telemetry:

$$\text{Total Score} = w_{\text{cap}} \cdot S_{\text{cap}} + w_{\text{acc}} \cdot S_{\text{acc}} + w_{\text{lat}} \cdot S_{\text{lat}} + w_{\text{hw}} \cdot S_{\text{hw}} + w_{\text{bat}} \cdot S_{\text{bat}} + w_{\text{mem}} \cdot S_{\text{mem}} - \text{Penalty}_{\text{res}}$$

### Scoring Factor Breakdown
| Factor | Weight | Evaluation Criteria |
|---|---|---|
| **Capability Fit ($S_{\text{cap}}$)** | 20% | Direct match with requested capability (`OCR`, `SPEECH_TO_TEXT`, etc.) |
| **Model Quality ($S_{\text{acc}}$)** | 25% | F1 score / benchmark accuracy normalized 0–100 |
| **Latency Fit ($S_{\text{lat}}$)** | 15% | Inverse latency penalty: $100 - (\text{latencyMs} / 3000) \times 80$ |
| **Hardware Fit ($S_{\text{hw}}$)** | 15% | NNAPI delegate on NPU (100 pts), Vulkan on GPU (85 pts), CPU (60 pts) |
| **Battery Profile ($S_{\text{bat}}$)** | 10% | Low impact (100 pts), High impact under low battery reserve (20 pts) |
| **Memory Headroom ($S_{\text{mem}}$)** | 15% | Local RAM ratio: $(1 - \frac{\text{RAM Required}}{\text{RAM Available}}) \times 100$ |
| **Resource Penalty ($\text{Penalty}_{\text{res}}$)** | Variable | Thermal throttling active (-40 pts), Metered cellular connection (-25 pts), Power Saver active (-30 pts) |

---

## 2. Hard Disqualification Rules
A candidate model is immediately disqualified ($\text{Score} = -1000$) if:
1. **Cloud Model while OFFLINE:** Device network state is `OFFLINE`.
2. **Cloud Model under Privacy Policy:** User or system disabled `allowCloudInference`.
3. **Local Model Exceeds RAM:** Model's `ramRequirementMb` exceeds 95% of currently available system RAM (prevents OOM kill).
4. **Policy Enforcement Overrides:** Node policy is `FORCE_LOCAL` (disqualifies cloud models) or `FORCE_CLOUD` (disqualifies local models).

---

## 3. Explainability Output ("Why this model?")
For every selected model, EL-06 generates a transparent, human-readable justification displayed in the Execution Monitor:

```
SELECTED MODEL:
PaddleOCR Mobile v4 (INT8)

Score: 89 / 100

REASONS:
✓ Required capability supported: Optical Character Recognition
✓ Hardware NPU acceleration active via Android NNAPI delegate
✓ RAM footprint: 140MB fits within available 3450MB
✓ Energy-efficient execution profile minimizes battery draw
✓ Quality score: 92%
✓ Dispatched to On-Device hardware runtime
```

---

## 4. Local vs. Cloud Execution Routing
The `ExecutionRouter` evaluates routing along three dimensions:
1. **LOCAL:** Run on-device via NPU, GPU, or CPU delegates. Best for low latency, zero network cost, and absolute privacy.
2. **CLOUD:** Offload to secure external endpoint. Selected when local RAM is insufficient, device is plugged in on Wi-Fi, or when high-parameter reasoning is explicitly requested.
3. **HYBRID:** Pipeline routes lightweight steps (Camera, OCR, Audio, Audio transcription) locally on-device, and selectively offloads heavy synthesis to cloud if network allows.
