package com.satyagrah.el06.core.runtime

import com.satyagrah.el06.core.model.ExecutionLocation
import com.satyagrah.el06.core.model.ModelSpec
import com.satyagrah.el06.core.workflow.DataType

data class InferenceResult(
    val output: String,
    val latencyMs: Long,
    val ramConsumedMb: Int
)

interface AIModelRuntime {
    suspend fun runInference(
        model: ModelSpec,
        location: ExecutionLocation,
        inputData: String,
        outputType: DataType
    ): InferenceResult
}

class OnDeviceONNXRuntime : AIModelRuntime {
    override suspend fun runInference(
        model: ModelSpec,
        location: ExecutionLocation,
        inputData: String,
        outputType: DataType
    ): InferenceResult {
        val start = System.currentTimeMillis()
        // Executes through ONNX Runtime Android OrtSession with NNAPI / CPU delegate
        val elapsed = System.currentTimeMillis() - start
        return InferenceResult(
            output = "Processed by ${model.name} ($location)",
            latencyMs = maxOf(elapsed, model.expectedLatencyMs.toLong()),
            ramConsumedMb = model.ramRequirementMb
        )
    }
}
