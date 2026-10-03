import React, { useState } from 'react';
import { WorkflowNode } from '../../../types/workflow';
import { NodeExecutionRecord } from '../../../types/execution';
import { getNodePresentation } from '../studio/node-presentation-registry';
import { IntermediateResultViewer } from './IntermediateResultViewer';
import { StatusIndicator, Button } from '../ui';
import {
  Cpu,
  HardDrive,
  Clock,
  Zap,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
} from 'lucide-react';

export interface ExecutionStepDetailsProps {
  node: WorkflowNode;
  record?: NodeExecutionRecord;
  className?: string;
  onExplainModel?: () => void;
}

export const ExecutionStepDetails: React.FC<ExecutionStepDetailsProps> = ({
  node,
  record,
  className = '',
  onExplainModel,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const presentation = getNodePresentation(node.type, node.capability);

  // Status mapping
  const getSemanticStatus = () => {
    if (!record) return { status: 'neutral' as const, label: 'Queued' };
    switch (record.status) {
      case 'SUCCESS':
        return {
          status: 'success' as const,
          label: record.latencyMs !== undefined ? `Completed in ${record.latencyMs}ms` : 'Completed',
        };
      case 'RUNNING':
        return { status: 'running' as const, label: 'Executing now...' };
      case 'FAILED':
        return { status: 'error' as const, label: 'Execution Failed' };
      case 'FALLBACK':
        return { status: 'warning' as const, label: 'Fallback Active' };
      default:
        return { status: 'neutral' as const, label: 'Queued' };
    }
  };

  const semStatus = getSemanticStatus();

  return (
    <div className={`el-step-details ${className}`.trim()} role="region" aria-label={`Step Details: ${node.label}`}>
      {/* 1. Step Identity Header */}
      <div className="el-step-details__header">
        <div className="el-step-details__title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="el-step-details__icon" aria-hidden="true">
              {presentation.icon}
            </span>
            <span className="el-step-details__badge">{presentation.categoryLabel}</span>
          </div>
          <h3 className="el-step-details__title">{node.label}</h3>
          <p className="el-step-details__dataflow">{presentation.dataFlowDescription}</p>
        </div>

        <div className="el-step-details__status">
          <StatusIndicator
            status={semStatus.status}
            label={semStatus.label}
            pulse={semStatus.status === 'running'}
            size="sm"
          />
        </div>
      </div>

      {/* 2. Error Banner if Step Failed */}
      {record?.error && (
        <div className="el-step-details__error-banner" role="alert">
          <AlertTriangle size={15} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <span>{record.error}</span>
        </div>
      )}

      {/* 3. Primary Step Output / Result */}
      <div className="el-step-details__section">
        <h4 className="el-step-details__section-title">Step Output</h4>
        <IntermediateResultViewer
          data={record?.outputData}
          title={record?.outputData ? 'Produced Output' : 'Awaiting Output'}
        />
      </div>

      {/* 4. Model & Execution Delegate Summary */}
      {record?.selectedModelName && (
        <div className="el-step-details__model-card">
          <div className="el-step-details__model-header">
            <div>
              <span className="el-step-details__model-tag">Resolved ML Delegate</span>
              <div className="el-step-details__model-name">{record.selectedModelName}</div>
            </div>

            {record.scoreBreakdown && onExplainModel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExplainModel}
                className="el-step-details__explain-btn"
                aria-label="Explain why this model was selected"
              >
                Why this model? ↗
              </Button>
            )}
          </div>

          <div className="el-step-details__meta-chips">
            {record.executionLocation && (
              <span className="el-step-details__chip">
                {record.executionLocation === 'CLOUD' ? 'Cloud API' : 'On-Device NPU/CPU'}
              </span>
            )}
            {record.latencyMs !== undefined && (
              <span className="el-step-details__chip">
                <Clock size={11} aria-hidden="true" />
                <span>{record.latencyMs}ms</span>
              </span>
            )}
            {record.ramConsumedMb !== undefined && record.ramConsumedMb > 0 && (
              <span className="el-step-details__chip">
                <HardDrive size={11} aria-hidden="true" />
                <span>{record.ramConsumedMb} MB</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. Progressive Disclosure: Technical Details & Logs */}
      <div className="el-step-details__technical-toggle-wrapper">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTechnicalDetails((prev) => !prev)}
          className="el-step-details__technical-btn"
          aria-expanded={showTechnicalDetails}
        >
          <span>{showTechnicalDetails ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics & Logs'}</span>
          {showTechnicalDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>

        {showTechnicalDetails && (
          <div className="el-step-details__technical-content">
            {/* Technical metrics */}
            <div className="el-step-details__metric-grid">
              <div className="el-step-details__metric-item">
                <span className="el-step-details__metric-label">Execution Target</span>
                <span className="el-step-details__metric-val">
                  {record?.executionLocation || 'Native OS Runtime'}
                </span>
              </div>
              <div className="el-step-details__metric-item">
                <span className="el-step-details__metric-label">Memory Peak</span>
                <span className="el-step-details__metric-val">
                  {record?.ramConsumedMb ? `${record.ramConsumedMb} MB` : '< 5 MB (System)'}
                </span>
              </div>
              <div className="el-step-details__metric-item">
                <span className="el-step-details__metric-label">Cache State</span>
                <span className="el-step-details__metric-val">
                  {record?.cacheHit ? 'CACHE HIT (0ms Saved)' : 'CACHE MISS'}
                </span>
              </div>
              <div className="el-step-details__metric-item">
                <span className="el-step-details__metric-label">Policy Rule</span>
                <span className="el-step-details__metric-val">{node.executionPolicy}</span>
              </div>
            </div>

            {/* Console Log stream */}
            {record?.logLines && record.logLines.length > 0 && (
              <div className="el-step-details__logs-section">
                <div className="el-step-details__logs-header">
                  <Terminal size={12} aria-hidden="true" />
                  <span>Telemetry Log Stream</span>
                </div>
                <div className="el-step-details__logs-console" tabIndex={0} aria-label="Step telemetry logs">
                  {record.logLines.map((line, i) => (
                    <div key={i} className="el-step-details__log-line">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
