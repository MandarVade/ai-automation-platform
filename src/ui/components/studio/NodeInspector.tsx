import React from 'react';
import { WorkflowNode, ExecutionPolicy } from '../../../types/workflow';
import { Button, Input } from '../ui';
import { Trash2, Copy, Cpu, Info, CheckCircle, Zap } from 'lucide-react';

export interface NodeInspectorProps {
  node: WorkflowNode | null;
  onUpdatePolicy: (policy: ExecutionPolicy) => void;
  onUpdateLabel: (label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: WorkflowNode) => void;
  onClose?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onUpdatePolicy,
  onUpdateLabel,
  onDeleteNode,
  onDuplicateNode,
  onClose,
}) => {
  if (!node) {
    return (
      <div className="el-node-inspector el-node-inspector--empty">
        <Info size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          No Node Selected
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'center' }}>
          Click any node on the canvas to inspect capabilities, execution policy, and I/O parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="el-node-inspector">
      {/* Header */}
      <div className="el-node-inspector__header">
        <div>
          <span className="el-node-inspector__badge">{node.type}</span>
          <h3 className="el-node-inspector__title">{node.label}</h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicateNode(node)}
            title="Duplicate node"
            aria-label="Duplicate node"
          >
            <Copy size={13} />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteNode(node.id)}
            title="Delete node"
            aria-label="Delete node"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <div className="el-node-inspector__body">
        {/* Label Config */}
        <div className="el-node-inspector__field">
          <Input
            label="Node Display Label"
            value={node.label}
            onChange={(e) => onUpdateLabel(e.target.value)}
          />
        </div>

        {/* Capability Information */}
        <div className="el-node-inspector__field">
          <span className="el-node-inspector__label">Underlying Capability</span>
          <div className="el-node-inspector__value-box">
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-hover)', fontSize: '12px' }}>
              {node.capability}
            </span>
          </div>
        </div>

        {/* Execution Policy Selector */}
        <div className="el-node-inspector__field">
          <label htmlFor="node-execution-policy" className="el-node-inspector__label">
            Execution Policy
          </label>
          <select
            id="node-execution-policy"
            className="el-node-inspector__select"
            value={node.executionPolicy}
            onChange={(e) => onUpdatePolicy(e.target.value as ExecutionPolicy)}
          >
            <option value="AUTO">AUTO (Resource & Edge-Aware)</option>
            <option value="FORCE_LOCAL">FORCE_LOCAL (Strict On-Device Privacy)</option>
            <option value="FORCE_CLOUD">FORCE_CLOUD (Maximum Capability)</option>
            <option value="BATTERY_CONSERVE">BATTERY_CONSERVE (Low-Power Optimization)</option>
          </select>
          <p className="el-node-inspector__hint">
            Controls autonomous routing: on-device NPU/CPU delegates vs encrypted cloud fallback.
          </p>
        </div>

        {/* Assigned Model (if any) */}
        {node.assignedModelId && (
          <div className="el-node-inspector__field">
            <span className="el-node-inspector__label">Assigned Model Delegate</span>
            <div className="el-node-inspector__value-box" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={13} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {node.assignedModelId}
              </span>
            </div>
          </div>
        )}

        {/* I/O Contracts */}
        <div className="el-node-inspector__grid-2">
          <div className="el-node-inspector__field">
            <span className="el-node-inspector__label">Inputs</span>
            <div className="el-node-inspector__value-box">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {node.inputTypes.length ? node.inputTypes.join(', ') : 'None (Source)'}
              </span>
            </div>
          </div>
          <div className="el-node-inspector__field">
            <span className="el-node-inspector__label">Output Type</span>
            <div className="el-node-inspector__value-box">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {node.outputType}
              </span>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="el-node-inspector__field">
          <span className="el-node-inspector__label">Upstream Dependencies</span>
          <div className="el-node-inspector__value-box">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {node.dependencies.length ? node.dependencies.join(', ') : 'No direct predecessors'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
