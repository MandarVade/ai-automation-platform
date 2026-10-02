package com.satyagrah.el06.core.routing

import com.satyagrah.el06.core.model.ExecutionLocation
import com.satyagrah.el06.core.model.ModelSpec
import com.satyagrah.el06.core.resources.DeviceContext
import com.satyagrah.el06.core.workflow.ExecutionPolicy

data class RouteDecision(
    val location: ExecutionLocation,
    val reasons: List<String>,
    val isFallback: Boolean = false
)

object ExecutionRouter {

    fun route(
        model: ModelSpec,
        device: DeviceContext,
        policy: ExecutionPolicy
    ): RouteDecision {
        val reasons = mutableListOf<String>()

        if (policy == ExecutionPolicy.FORCE_LOCAL) {
            reasons.add("Policy enforces On-Device execution")
            return RouteDecision(
                if (device.hasNpu) ExecutionLocation.LOCAL_NPU else ExecutionLocation.LOCAL_CPU,
                reasons
            )
        }

        if (policy == ExecutionPolicy.FORCE_CLOUD) {
            if (device.networkState == "OFFLINE") {
                throw IllegalStateException("Device is OFFLINE; cannot enforce Cloud execution")
            }
            reasons.add("Policy enforces Cloud execution")
            return RouteDecision(ExecutionLocation.CLOUD, reasons)
        }

        if (device.networkState == "OFFLINE" || !device.allowCloudInference) {
            reasons.add("Network unavailable or privacy mode active: Routing On-Device")
            return RouteDecision(
                if (device.hasNpu) ExecutionLocation.LOCAL_NPU else ExecutionLocation.LOCAL_CPU,
                reasons
            )
        }

        // RAM Headroom check
        if (model.isLocalAvailable && model.ramRequirementMb > device.availableRamMb) {
            reasons.add("RAM deficit detected: Autonomous Cloud Offloading activated to prevent OOM")
            return RouteDecision(ExecutionLocation.CLOUD, reasons, isFallback = true)
        }

        return if (model.isLocalAvailable) {
            reasons.add("Optimal local hardware execution")
            RouteDecision(
                if (device.hasNpu) ExecutionLocation.LOCAL_NPU else ExecutionLocation.LOCAL_CPU,
                reasons
            )
        } else {
            reasons.add("Executing via Cloud API")
            RouteDecision(ExecutionLocation.CLOUD, reasons)
        }
    }
}
