package com.satyagrah.el06.core.model

import com.satyagrah.el06.core.workflow.DataType
import com.satyagrah.el06.core.workflow.NodeCapability

enum class ExecutionLocation {
    LOCAL_NPU,
    LOCAL_GPU,
    LOCAL_CPU,
    CLOUD
}

enum class Quantization {
    INT4,
    INT8,
    FP16,
    FP32,
    NONE
}

enum class HardwareDelegate {
    NNAPI,
    GPU_VULKAN,
    GPU_OPENCL,
    CPU,
    CLOUD_API
}

data class ModelSpec(
    val id: String,
    val name: String,
    val version: String,
    val capability: NodeCapability,
    val inputType: DataType,
    val outputType: DataType,
    val sizeMb: Int,
    val ramRequirementMb: Int,
    val quantization: Quantization,
    val supportedDelegates: List<HardwareDelegate>,
    val expectedLatencyMs: Int,
    val qualityScore: Float,
    val isLocalAvailable: Boolean,
    val isCloudAvailable: Boolean,
    val description: String
)

object ModelRegistry {
    private val models = mutableMapOf<String, ModelSpec>()

    init {
        register(
            ModelSpec(
                id = "paddleocr-mobile-v4",
                name = "PaddleOCR Mobile v4",
                version = "v4.1.0-int8",
                capability = NodeCapability.OCR,
                inputType = DataType.IMAGE,
                outputType = DataType.TEXT,
                sizeMb = 28,
                ramRequirementMb = 140,
                quantization = Quantization.INT8,
                supportedDelegates = listOf(HardwareDelegate.NNAPI, HardwareDelegate.GPU_VULKAN),
                expectedLatencyMs = 450,
                qualityScore = 0.92f,
                isLocalAvailable = true,
                isCloudAvailable = false,
                description = "High-speed mobile OCR with NPU acceleration"
            )
        )
        register(
            ModelSpec(
                id = "whisper-tiny-mobile",
                name = "Whisper Tiny Mobile INT8",
                version = "v2.1",
                capability = NodeCapability.SPEECH_TO_TEXT,
                inputType = DataType.AUDIO_STREAM,
                outputType = DataType.TEXT,
                sizeMb = 39,
                ramRequirementMb = 180,
                quantization = Quantization.INT8,
                supportedDelegates = listOf(HardwareDelegate.NNAPI, HardwareDelegate.CPU),
                expectedLatencyMs = 850,
                qualityScore = 0.84f,
                isLocalAvailable = true,
                isCloudAvailable = false,
                description = "Energy-efficient speech-to-text"
            )
        )
        register(
            ModelSpec(
                id = "mobilenet-agrovision-int8",
                name = "MobileNetV4 AgroVision INT8",
                version = "v4.0",
                capability = NodeCapability.PLANT_DISEASE_DIAGNOSIS,
                inputType = DataType.IMAGE,
                outputType = DataType.STRUCTURED_JSON,
                sizeMb = 19,
                ramRequirementMb = 88,
                quantization = Quantization.INT8,
                supportedDelegates = listOf(HardwareDelegate.NNAPI, HardwareDelegate.GPU_VULKAN),
                expectedLatencyMs = 195,
                qualityScore = 0.91f,
                isLocalAvailable = true,
                isCloudAvailable = false,
                description = "Botanical leaf disease vision classifier"
            )
        )
        register(
            ModelSpec(
                id = "cloud-whisper-v3",
                name = "Whisper Large v3 (Cloud)",
                version = "v3",
                capability = NodeCapability.SPEECH_TO_TEXT,
                inputType = DataType.AUDIO_STREAM,
                outputType = DataType.TEXT,
                sizeMb = 0,
                ramRequirementMb = 20,
                quantization = Quantization.NONE,
                supportedDelegates = listOf(HardwareDelegate.CLOUD_API),
                expectedLatencyMs = 900,
                qualityScore = 0.98f,
                isLocalAvailable = false,
                isCloudAvailable = true,
                description = "Cloud serverless speech transcription"
            )
        )
    }

    fun register(model: ModelSpec) {
        models[model.id] = model
    }

    fun getAll(): List<ModelSpec> = models.values.toList()

    fun getByCapability(capability: NodeCapability): List<ModelSpec> =
        models.values.filter { it.capability == capability }
}
