import React, { useMemo } from 'react';
import { WorkflowNode, ExecutionPolicy } from '../../../types/workflow';
import { ModelCapability, ModelSpec } from '../../../types/model';
import { ModelRegistry } from '../../../core/model/registry';
import { ModelSelector, SelectionResult } from '../../../core/model/selector';
import { DeviceContextManager } from '../../../core/resources/device-context';
import { getNodePresentation } from './node-presentation-registry';
import { Button, Input, Badge } from '../ui';
import {
  Trash2,
  Copy,
  Cpu,
  Info,
  Layers,
  ArrowRight,
  Battery,
  Clock,
  HardDrive,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export interface NodeInspectorProps {
  node: WorkflowNode | null;
  onUpdatePolicy: (policy: ExecutionPolicy) => void;
  onUpdateLabel: (label: string) => void;
  onUpdateModel?: (modelId: string | undefined) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (node: WorkflowNode) => void;
  onClose?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onUpdatePolicy,
  onUpdateLabel,
  onUpdateModel,
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
          Select any node on the canvas to inspect identity, execution policy, model delegates, and resource metrics.
        </p>
      </div>
    );
  }

  // Derive presentation metadata
  const presentation = getNodePresentation(node.type, node.capability);

  // Retrieve compatible models for this capability from ModelRegistry
  const candidateModels = useMemo(() => {
    return ModelRegistry.getByCapability(node.capability as ModelCapability);
  }, [node.capability]);

  // Model selection analysis & explainability
  const selectionInfo = useMemo<SelectionResult | null>(() => {
    if (candidateModels.length === 0) return null;
    try {
      const device = DeviceContextManager.getInstance().getContext();
      return ModelSelector.selectBestModel(
        node.capability as ModelCapability,
        device,
        node.executionPolicy,
        node.assignedModelId
      );
    } catch {
      return null;
    }
  }, [candidateModels, node.capability, node.executionPolicy, node.assignedModelId]);

  const activeModelSpec = selectionInfo?.selectedModel || candidateModels[0] || null;

  return (
    <div className="el-node-inspector" role="region" aria-label={`Node Inspector: ${node.label}`}>
      {/* 1. Header with Node Identity and Actions */}
      <div className="el-node-inspector__header">
        <div className="el-node-inspector__header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="el-node-inspector__icon" aria-hidden="true">
              {presentation.icon}
            </span>
            <span className="el-node-inspector__badge">{presentation.categoryLabel}</span>
          </div>
          <h3 className="el-node-inspector__title">{node.label}</h3>
          <span className="el-node-inspector__dataflow">{presentation.dataFlowDescription}</span>
        </div>

        <div className="el-node-inspector__actions">
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
        {/* 2. Configuration Section */}
        <div className="el-node-inspector__section">
          <h4 className="el-node-inspector__section-title">Configuration</h4>

          <div className="el-node-inspector__field">
            <Input
              label="Node Display Label"
              value={node.label}
              onChange={(e) => onUpdateLabel(e.target.value)}
              placeholder="Enter node title..."
            />
          </div>

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
              <option value="AUTO">AUTO (Edge & Resource Aware)</option>
              <option value="FORCE_LOCAL">FORCE_LOCAL (Strict On-Device Privacy)</option>
              <option value="FORCE_CLOUD">FORCE_CLOUD (Maximum Capability)</option>
              <option value="BATTERY_CONSERVE">BATTERY_CONSERVE (Low-Power Optimization)</option>
            </select>
            <p className="el-node-inspector__hint">
              Governs whether this node prefers on-device NPU/CPU or cloud inference endpoints.
            </p>
          </div>
        </div>

        {/* 3. Model Delegate & Routing */}
        <div className="el-node-inspector__section">
          <h4 className="el-node-inspector__section-title">Model Delegate & Routing</h4>

          {candidateModels.length > 0 ? (
            <>
              <div className="el-node-inspector__field">
                <label htmlFor="node-model-select" className="el-node-inspector__label">
                  Assigned ML Model
                </label>
                <select
                  id="node-model-select"
                  className="el-node-inspector__select"
                  value={node.assignedModelId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateModel?.(val ? val : undefined);
                  }}
                >
                  <option value="">AUTO (Dynamic Model Routing)</option>
                  {candidateModels.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name} ({spec.quantization}, {spec.sizeMb}MB)
                    </option>
                  ))}
                </select>
              </div>

              {/* Explainable Rationale */}
              {selectionInfo && (
                <div className="el-node-inspector__rationale-card">
                  <div className="el-node-inspector__rationale-header">
                    <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {node.assignedModelId ? 'Pinned Model' : 'Auto Resolved Target'}: {selectionInfo.selectedModel.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 6px 0', lineHeight: 1.35 }}>
                    {selectionInfo.selectedModel.description}
                  </p>
                  {selectionInfo.breakdown.reasons.length > 0 && (
                    <div className="el-node-inspector__reasons-list">
                      {selectionInfo.breakdown.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="el-node-inspector__reason-item">
                          <span>•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="el-node-inspector__value-box">
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Native Android system capability. Executes directly via OS service without ML inference.
              </span>
            </div>
          )}
        </div>

        {/* 4. Real Resource Profiles */}
        <div className="el-node-inspector__section">
          <h4 className="el-node-inspector__section-title">Resource Profile</h4>

          {activeModelSpec ? (
            <div className="el-node-inspector__resource-grid">
              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Clock size={11} /> Latency
                </div>
                <div className="el-node-inspector__resource-val">
                  ~{activeModelSpec.expectedLatencyMs}ms
                </div>
              </div>

              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <HardDrive size={11} /> Memory
                </div>
                <div className="el-node-inspector__resource-val">
                  {activeModelSpec.ramRequirementMb} MB
                </div>
              </div>

              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Battery size={11} /> Battery
                </div>
                <div className="el-node-inspector__resource-val">
                  {activeModelSpec.batteryImpact}
                </div>
              </div>

              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Zap size={11} /> Quantization
                </div>
                <div className="el-node-inspector__resource-val">
                  {activeModelSpec.quantization}
                </div>
              </div>
            </div>
          ) : (
            <div className="el-node-inspector__resource-grid">
              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Clock size={11} /> Latency
                </div>
                <div className="el-node-inspector__resource-val">&lt; 15ms</div>
              </div>
              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <HardDrive size={11} /> Memory
                </div>
                <div className="el-node-inspector__resource-val">&lt; 5 MB</div>
              </div>
              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Battery size={11} /> Battery
                </div>
                <div className="el-node-inspector__resource-val">LOW</div>
              </div>
              <div className="el-node-inspector__resource-card">
                <div className="el-node-inspector__resource-lbl">
                  <Cpu size={11} /> Target
                </div>
                <div className="el-node-inspector__resource-val">Native IPC</div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Input / Output Contracts */}
        <div className="el-node-inspector__section">
          <h4 className="el-node-inspector__section-title">Data Contracts (I/O)</h4>
          <div className="el-node-inspector__grid-2">
            <div className="el-node-inspector__field">
              <span className="el-node-inspector__label">Inputs</span>
              <div className="el-node-inspector__tag-box">
                {node.inputTypes.length > 0 ? (
                  node.inputTypes.map((t) => (
                    <span key={t} className="el-node-inspector__tag">
                      {t}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    None (Trigger Source)
                  </span>
                )}
              </div>
            </div>

            <div className="el-node-inspector__field">
              <span className="el-node-inspector__label">Output</span>
              <div className="el-node-inspector__tag-box">
                <span className="el-node-inspector__tag el-node-inspector__tag--output">
                  {node.outputType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Upstream Dependencies */}
        <div className="el-node-inspector__section">
          <h4 className="el-node-inspector__section-title">Dependencies</h4>
          <div className="el-node-inspector__value-box">
            {node.dependencies.length > 0 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {node.dependencies.join(', ')}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                No direct upstream dependencies (Root Node)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

