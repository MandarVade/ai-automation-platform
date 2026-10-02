export type NodeType = 'TRIGGER' | 'AI' | 'TRANSFORM' | 'ANDROID_ACTION' | 'CONDITION';

export type NodeCapability =
  // Triggers
  | 'MANUAL'
  | 'CAMERA_CAPTURE'
  | 'AUDIO_RECORD'
  | 'FILE_PICKER'
  | 'NOTIFICATION_ACTION'
  | 'SCHEDULED'
  // AI Capabilities
  | 'SPEECH_TO_TEXT'
  | 'OCR'
  | 'IMAGE_UNDERSTANDING'
  | 'SUMMARIZATION'
  | 'CONCEPT_EXTRACTION'
  | 'QUESTION_GENERATION'
  | 'EXPENSE_CATEGORIZATION'
  | 'PLANT_DISEASE_DIAGNOSIS'
  | 'TASK_EXTRACTION'
  // Transforms
  | 'CALCULATE_TOTAL'
  | 'STRUCTURED_JSON_MAP'
  | 'TEXT_FORMATTER'
  | 'FILTER'
  | 'AGGREGATE'
  // Android Actions
  | 'NOTIFICATION_EMIT'
  | 'SAVE_FILE'
  | 'EXPENSE_TRACKER_STORE'
  | 'SHARE_INTENT'
  | 'CARE_PLAN_STORE'
  | 'STUDY_NOTES_STORE'
  // Condition
  | 'VALUE_COMPARE'
  | 'CONFIDENCE_CHECK';

export type DataType =
  | 'TEXT'
  | 'AUDIO_STREAM'
  | 'IMAGE'
  | 'STRUCTURED_JSON'
  | 'NUMERIC'
  | 'FILE'
  | 'BOOLEAN'
  | 'ANY';

export type NodeStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FALLBACK'
  | 'FAILED'
  | 'CANCELLED';

export type ExecutionPolicy = 'AUTO' | 'FORCE_LOCAL' | 'FORCE_CLOUD' | 'BATTERY_CONSERVE';

export interface FallbackPolicy {
  enableSmallerModelFallback: boolean;
  enableCloudFallback: boolean;
  maxMemoryThresholdMb?: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: NodeType;
  capability: NodeCapability;
  inputTypes: DataType[];
  outputType: DataType;
  dependencies: string[];
  config: Record<string, any>;
  assignedModelId?: string;
  executionPolicy: ExecutionPolicy;
  fallbackPolicy?: FallbackPolicy;
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  dataType: DataType;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  domain: 'FINANCE' | 'EDUCATION' | 'HEALTHCARE' | 'PRODUCTIVITY' | 'GENERAL';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
  version: string;
  triggerNotificationAction?: string;
}

export interface ValidationDiagnostic {
  nodeId?: string;
  level: 'ERROR' | 'WARNING';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  diagnostics: ValidationDiagnostic[];
  topologicalOrder: string[];
}
