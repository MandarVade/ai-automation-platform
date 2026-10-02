package com.satyagrah.el06.core.workflow

import kotlinx.serialization.Serializable

@Serializable
enum class NodeType {
    TRIGGER,
    AI,
    TRANSFORM,
    ANDROID_ACTION,
    CONDITION
}

@Serializable
enum class NodeCapability {
    MANUAL,
    CAMERA_CAPTURE,
    AUDIO_RECORD,
    FILE_PICKER,
    NOTIFICATION_ACTION,
    SPEECH_TO_TEXT,
    OCR,
    IMAGE_UNDERSTANDING,
    SUMMARIZATION,
    CONCEPT_EXTRACTION,
    QUESTION_GENERATION,
    EXPENSE_CATEGORIZATION,
    PLANT_DISEASE_DIAGNOSIS,
    TASK_EXTRACTION,
    CALCULATE_TOTAL,
    STRUCTURED_JSON_MAP,
    NOTIFICATION_EMIT,
    SAVE_FILE,
    EXPENSE_TRACKER_STORE,
    CARE_PLAN_STORE,
    STUDY_NOTES_STORE
}

@Serializable
enum class DataType {
    TEXT,
    AUDIO_STREAM,
    IMAGE,
    STRUCTURED_JSON,
    NUMERIC,
    FILE,
    ANY
}

@Serializable
enum class NodeStatus {
    IDLE,
    QUEUED,
    RUNNING,
    SUCCESS,
    FALLBACK,
    FAILED,
    CANCELLED
}

@Serializable
enum class ExecutionPolicy {
    AUTO,
    FORCE_LOCAL,
    FORCE_CLOUD,
    BATTERY_CONSERVE
}

@Serializable
data class WorkflowNode(
    val id: String,
    val label: String,
    val type: NodeType,
    val capability: NodeCapability,
    val inputTypes: List<DataType>,
    val outputType: DataType,
    val dependencies: List<String> = emptyList(),
    val config: Map<String, String> = emptyMap(),
    val assignedModelId: String? = null,
    val executionPolicy: ExecutionPolicy = ExecutionPolicy.AUTO,
    val positionX: Float = 0f,
    val positionY: Float = 0f
)

@Serializable
data class WorkflowEdge(
    val id: String,
    val sourceNodeId: String,
    val targetNodeId: String,
    val dataType: DataType
)

@Serializable
data class Workflow(
    val id: String,
    val name: String,
    val description: String,
    val domain: String,
    val nodes: List<WorkflowNode>,
    val edges: List<WorkflowEdge>,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val version: String = "1.0.0"
)
