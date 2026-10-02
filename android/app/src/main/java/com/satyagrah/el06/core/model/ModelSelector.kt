package com.satyagrah.el06.core.model

import com.satyagrah.el06.core.resources.DeviceContext
import com.satyagrah.el06.core.workflow.ExecutionPolicy
import com.satyagrah.el06.core.workflow.NodeCapability

data class ModelScoreResult(
    val selectedModel: ModelSpec,
    val score: Int,
    val reasons: List<String>,
    val location: ExecutionLocation
)

object ModelSelector {

    fun selectModel(
        capability: NodeCapability,
        device: DeviceContext,
        policy: ExecutionPolicy = ExecutionPolicy.AUTO
    ): ModelScoreResult {
        val candidates = ModelRegistry.getByCapability(capability)
        if (candidates.isEmpty()) {
            throw IllegalStateException("No models found for capability $capability")
        }

        var bestModel: ModelSpec? = null
        var highestScore = -9999
        var bestReasons = emptyList<String>()
        var bestLocation = ExecutionLocation.LOCAL_CPU

        for (model in candidates) {
            val reasons = mutableListOf<String>()
            var score = 0

            // Disqualification checks
            if (model.isCloudAvailable && !model.isLocalAvailable) {
                if (policy == ExecutionPolicy.FORCE_LOCAL || !device.allowCloudInference || device.networkState == "OFFLINE") {
                    continue
                }
            }

            if (model.isLocalAvailable && !model.isCloudAvailable && policy == ExecutionPolicy.FORCE_CLOUD) {
                continue
            }

            // Quality / Accuracy Fit (25%)
            val accuracyScore = (model.qualityScore * 100).toInt()
            score += (accuracyScore * 0.25).toInt()
            reasons.add("Quality score: $accuracyScore%")

            // Memory Fit (25%)
            if (model.isLocalAvailable) {
                val fitsRam = model.ramRequirementMb <= device.availableRamMb
                if (!fitsRam) {
                    score -= 50
                    reasons.add("RAM penalty: Needs ${model.ramRequirementMb}MB, available ${device.availableRamMb}MB")
                } else {
                    score += 25
                    reasons.add("RAM Headroom: Fits comfortably in available memory")
                }
            } else {
                score += 25
            }

            // Hardware Fit (25%)
            var location = ExecutionLocation.LOCAL_CPU
            if (model.isLocalAvailable) {
                if (device.hasNpu && model.supportedDelegates.contains(HardwareDelegate.NNAPI)) {
                    score += 25
                    location = ExecutionLocation.LOCAL_NPU
                    reasons.add("NNAPI NPU acceleration active")
                } else if (device.hasGpu && model.supportedDelegates.contains(HardwareDelegate.GPU_VULKAN)) {
                    score += 20
                    location = ExecutionLocation.LOCAL_GPU
                    reasons.add("GPU Vulkan delegate active")
                } else {
                    score += 10
                    location = ExecutionLocation.LOCAL_CPU
                }
            } else {
                score += 20
                location = ExecutionLocation.CLOUD
                reasons.add("Dispatched to low-latency cloud endpoint")
            }

            // Battery preservation (25%)
            if (device.batteryPercentage < 20 && !device.isCharging && model.sizeMb > 100) {
                score -= 30
                reasons.add("Penalized due to low battery reserve")
            } else {
                score += 20
            }

            if (score > highestScore) {
                highestScore = score
                bestModel = model
                bestReasons = reasons
                bestLocation = location
            }
        }

        val chosen = bestModel ?: candidates.first()
        return ModelScoreResult(
            selectedModel = chosen,
            score = highestScore,
            reasons = bestReasons,
            location = bestLocation
        )
    }
}
