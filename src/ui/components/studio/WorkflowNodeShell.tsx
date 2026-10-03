import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNode, NodeStatus } from '../../../types/workflow';
import { getNodePresentation } from './node-presentation-registry';
import { StatusIndicator } from '../ui';
import { Cpu } from 'lucide-react';

export interface WorkflowNodeShellProps {
  node: WorkflowNode;
  selected?: boolean;
  hasErrors?: boolean;
  status?: NodeStatus;
  isSource?: boolean;
  children?: React.ReactNode;
}

export const WorkflowNodeShell: React.FC<WorkflowNodeShellProps> = ({
  node,
  selected = false,
  hasErrors = false,
  status = 'IDLE',
  isSource = false,
  children,
}) => {
  const presentation = getNodePresentation(node.type, node.capability);
  const hasInputs = node.inputTypes && node.inputTypes.length > 0;

  // Semantic state mapping
  const getSemanticStatus = () => {
    if (hasErrors) return 'error';
    switch (status) {
      case 'RUNNING':
        return 'running';
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'FALLBACK':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      className={`el-flow-node ${selected ? 'el-flow-node--selected' : ''} ${
        hasErrors ? 'el-flow-node--error' : ''
      } ${status === 'RUNNING' ? 'el-flow-node--running' : ''}`}
      role="group"
      aria-label={`${node.label} (${node.capability})`}
    >
      {/* Target Connection Handle (Top) */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          className="el-flow-node__handle el-flow-node__handle--target"
          aria-label={`Input: ${node.inputTypes.join(', ')}`}
        />
      )}

      {/* Node Header */}
      <div className="el-flow-node__header">
        <div className="el-flow-node__icon" aria-hidden="true">
          {presentation.icon}
        </div>
        <div className="el-flow-node__type-badge">{presentation.categoryLabel}</div>
        <div className="el-flow-node__policy-badge">
          {node.executionPolicy === 'AUTO' ? 'AUTO' : node.executionPolicy.replace('FORCE_', '')}
        </div>
      </div>

      {/* Node Body (Title & Concise Dataflow) */}
      <div className="el-flow-node__body">
        <div className="el-flow-node__label-row">
          <span className="el-flow-node__label">{node.label}</span>
          {status !== 'IDLE' && (
            <StatusIndicator
              status={getSemanticStatus()}
              size="sm"
              pulse={status === 'RUNNING'}
            />
          )}
        </div>
        <div className="el-flow-node__dataflow">{presentation.dataFlowDescription}</div>
      </div>

      {/* Optional Inner Children (progressive disclosure slot) */}
      {children}

      {/* Node Footer (Contract I/O & Assigned Model Delegate) */}
      <div className="el-flow-node__footer">
        <span className="el-flow-node__io" title={`Output Type: ${node.outputType}`}>
          {node.outputType}
        </span>

        {node.assignedModelId ? (
          <span className="el-flow-node__model" title={`Model Delegate: ${node.assignedModelId}`}>
            <Cpu size={11} aria-hidden="true" />
            <span>{node.assignedModelId.split('/').pop()}</span>
          </span>
        ) : (
          <span className="el-flow-node__location" title="Execution delegate resolved dynamically">
            {node.executionPolicy === 'FORCE_LOCAL'
              ? 'On-Device'
              : node.executionPolicy === 'FORCE_CLOUD'
              ? 'Cloud'
              : 'Auto Edge'}
          </span>
        )}
      </div>

      {/* Source Connection Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="el-flow-node__handle el-flow-node__handle--source"
        aria-label={`Output: ${node.outputType}`}
      />
    </div>
  );
};
