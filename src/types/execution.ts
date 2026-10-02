import { ExecutionLocation, ModelScoreBreakdown } from './model';
import { NodeStatus } from './workflow';
import { DeviceContext } from './device';

export type WorkflowExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface NodeExecutionRecord {
  nodeId: string;
  label: string;
  status: NodeStatus;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  selectedModelId?: string;
  selectedModelName?: string;
  executionLocation?: ExecutionLocation;
  ramConsumedMb?: number;
  cacheHit: boolean;
  inputData?: any;
  outputData?: any;
  error?: string;
  fallbackTriggered?: boolean;
  fallbackReason?: string;
  scoreBreakdown?: ModelScoreBreakdown;
  logLines: string[];
}

export interface WorkflowExecutionReport {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionStatus;
  startTime: number;
  endTime?: number;
  totalDurationMs?: number;
  nodeRecords: Record<string, NodeExecutionRecord>;
  deviceContextSnapshot: DeviceContext;
  cacheHitsCount: number;
  totalMemoryPeakMb: number;
  finalOutputs: Record<string, any>;
  error?: string;
}

export interface CacheEntry {
  key: string;
  workflowId: string;
  nodeId: string;
  inputHash: string;
  modelVersion: string;
  outputData: any;
  timestamp: number;
  executionLocation: ExecutionLocation;
}
