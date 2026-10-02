import { DataType, NodeCapability } from './workflow';

export type ModelCapability = Extract<
  NodeCapability,
  | 'SPEECH_TO_TEXT'
  | 'OCR'
  | 'IMAGE_UNDERSTANDING'
  | 'SUMMARIZATION'
  | 'CONCEPT_EXTRACTION'
  | 'QUESTION_GENERATION'
  | 'EXPENSE_CATEGORIZATION'
  | 'PLANT_DISEASE_DIAGNOSIS'
  | 'TASK_EXTRACTION'
>;

export type ExecutionLocation = 'LOCAL_NPU' | 'LOCAL_GPU' | 'LOCAL_CPU' | 'CLOUD';

export type Quantization = 'INT4' | 'INT8' | 'FP16' | 'FP32' | 'NONE';

export type HardwareDelegate = 'NNAPI' | 'GPU_OPENCL' | 'GPU_VULKAN' | 'CPU' | 'CLOUD_API';

export type BatteryImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ModelSpec {
  id: string;
  name: string;
  version: string;
  capability: ModelCapability;
  inputType: DataType;
  outputType: DataType;
  sizeMb: number;
  ramRequirementMb: number;
  quantization: Quantization;
  supportedDelegates: HardwareDelegate[];
  expectedLatencyMs: number;
  qualityScore: number; // 0.0 - 1.0
  batteryImpact: BatteryImpact;
  isLocalAvailable: boolean;
  isCloudAvailable: boolean;
  downloadSourceUrl?: string;
  description: string;
  parametersCount?: string;
}

export interface ModelScoreBreakdown {
  modelId: string;
  modelName: string;
  totalScore: number;
  capabilityFit: number;
  accuracyScore: number;
  latencyScore: number;
  hardwareFitScore: number;
  batteryFitScore: number;
  memoryFitScore: number;
  availabilityScore: number;
  resourcePenalty: number;
  location: ExecutionLocation;
  reasons: string[];
  disqualificationReason?: string;
  selected: boolean;
}
