import React, { useState } from 'react';
import { ModelSpec } from '../../../types/model';
import { Sheet, Button, StatusIndicator } from '../ui';
import { getNodePresentation } from '../studio/node-presentation-registry';
import { Cpu, Cloud, Copy, Check, ChevronDown, ChevronRight, HardDrive, Clock, Zap, ArrowRight } from 'lucide-react';

export interface ModelDetailSheetProps {
  model: ModelSpec | null;
  isOpen: boolean;
  onClose: () => void;
  isLoaded?: boolean;
  onToggleLoad?: (model: ModelSpec) => void;
}

export const ModelDetailSheet: React.FC<ModelDetailSheetProps> = ({
  model,
  isOpen,
  onClose,
  isLoaded = false,
  onToggleLoad,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!model) return null;

  const presentation = getNodePresentation('AI', model.capability);

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(model, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={model.name}
      side="right"
    >
      <div className="el-model-detail" role="region" aria-label={`Model Details: ${model.name}`}>
        {/* Header Summary */}
        <div className="el-model-detail__header">
          <div className="el-model-detail__badge-row">
            <span className="el-model-card__capability-badge">
              <span className="el-model-card__cap-icon" aria-hidden="true">
                {presentation.icon}
              </span>
              <span>{presentation.categoryLabel}</span>
            </span>

            <span className="el-model-card__location-badge">
              {model.isLocalAvailable ? <Cpu size={12} /> : <Cloud size={12} />}
              <span>{model.isLocalAvailable ? 'On-Device Inference' : 'Cloud Endpoint'}</span>
            </span>
          </div>

          <h2 className="el-model-detail__title">{model.name}</h2>
          <span className="el-model-detail__version">{model.version}</span>
          <p className="el-model-detail__desc">{model.description}</p>
        </div>

        {/* Section 1: Data Contract */}
        <div className="el-model-detail__section">
          <h3 className="el-model-detail__section-title">Data Contract & Capability</h3>
          <div className="el-model-detail__contract-box">
            <div className="el-model-detail__contract-step">
              <span className="el-model-detail__contract-label">Input</span>
              <span className="el-model-detail__contract-val">{model.inputType}</span>
            </div>
            <ArrowRight size={14} className="el-model-detail__contract-arrow" aria-hidden="true" />
            <div className="el-model-detail__contract-step">
              <span className="el-model-detail__contract-label">Output</span>
              <span className="el-model-detail__contract-val">{model.outputType}</span>
            </div>
          </div>
          <p className="el-model-detail__dataflow-note">
            {presentation.dataFlowDescription}
          </p>
        </div>

        {/* Section 2: Resource & Execution Profile */}
        <div className="el-model-detail__section">
          <h3 className="el-model-detail__section-title">Hardware & Performance Profile</h3>
          <div className="el-model-detail__grid">
            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">RAM Requirement</span>
              <span className="el-model-detail__grid-val">{model.ramRequirementMb} MB</span>
            </div>

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Expected Latency</span>
              <span className="el-model-detail__grid-val">~{model.expectedLatencyMs}ms</span>
            </div>

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Quality Score</span>
              <span className="el-model-detail__grid-val" style={{ color: 'var(--color-success)' }}>
                {Math.round(model.qualityScore * 100)}%
              </span>
            </div>

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Package Size</span>
              <span className="el-model-detail__grid-val">
                {model.sizeMb > 0 ? `${model.sizeMb} MB` : 'Cloud API (0 MB local)'}
              </span>
            </div>

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Quantization</span>
              <span className="el-model-detail__grid-val">{model.quantization}</span>
            </div>

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Battery Impact</span>
              <span className="el-model-detail__grid-val">{model.batteryImpact}</span>
            </div>

            {model.parametersCount && (
              <div className="el-model-detail__grid-item">
                <span className="el-model-detail__grid-label">Parameters</span>
                <span className="el-model-detail__grid-val">{model.parametersCount}</span>
              </div>
            )}

            <div className="el-model-detail__grid-item">
              <span className="el-model-detail__grid-label">Supported Hardware</span>
              <span className="el-model-detail__grid-val">
                {model.supportedDelegates.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Memory Lifecycle & Preloading */}
        {model.isLocalAvailable && onToggleLoad && (
          <div className="el-model-detail__section">
            <h3 className="el-model-detail__section-title">Memory Allocation Status</h3>
            <div className="el-model-detail__lifecycle-card">
              <div className="el-model-detail__lifecycle-left">
                <StatusIndicator
                  status={isLoaded ? 'success' : 'neutral'}
                  label={isLoaded ? 'Active in Memory' : 'Not Loaded in RAM'}
                />
                <span className="el-model-detail__lifecycle-desc">
                  {isLoaded
                    ? `Occupies ${model.ramRequirementMb} MB in Android execution runtime.`
                    : 'Weights remain stored on disk until pipeline execution.'}
                </span>
              </div>

              <Button
                variant={isLoaded ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onToggleLoad(model)}
              >
                {isLoaded ? 'Unload Weights' : 'Preload into RAM'}
              </Button>
            </div>
          </div>
        )}

        {/* Section 4: Progressive Disclosure of Raw Specification JSON */}
        <div className="el-model-detail__section">
          <button
            type="button"
            className="el-model-detail__raw-toggle"
            onClick={() => setShowRawJson((prev) => !prev)}
            aria-expanded={showRawJson}
          >
            <span>{showRawJson ? 'Hide Raw Specification' : 'Show Raw Specification (JSON)'}</span>
            {showRawJson ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showRawJson && (
            <div className="el-model-detail__raw-box">
              <div className="el-model-detail__raw-header">
                <span className="el-model-detail__raw-title">model-spec.json</span>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={copied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                  onClick={handleCopyJson}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="el-model-detail__raw-code">
                {JSON.stringify(model, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
};
