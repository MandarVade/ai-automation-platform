import React from 'react';
import { ModelSpec, ModelCapability } from '../../../types/model';
import { Badge, StatusIndicator, Button } from '../ui';
import { getNodePresentation } from '../studio/node-presentation-registry';
import { Cpu, Cloud, Layers, Clock, HardDrive, HelpCircle, ArrowRight } from 'lucide-react';

export interface ModelCardProps {
  model: ModelSpec;
  isLoaded?: boolean;
  isCurrentSelection?: boolean;
  onSelect?: (model: ModelSpec) => void;
  onInspect: (model: ModelSpec) => void;
  onExplain?: (capability: ModelCapability) => void;
  onToggleLoad?: (model: ModelSpec) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isLoaded = false,
  isCurrentSelection = false,
  onSelect,
  onInspect,
  onExplain,
  onToggleLoad,
}) => {
  const presentation = getNodePresentation('AI', model.capability);

  // Execution location descriptor
  const getLocationDescriptor = () => {
    if (model.isLocalAvailable && model.isCloudAvailable) {
      return {
        label: 'On-device + Cloud',
        icon: <Cpu size={12} aria-hidden="true" />,
        badgeVariant: 'neutral' as const,
      };
    }
    if (model.isLocalAvailable) {
      return {
        label: 'On-device',
        icon: <Cpu size={12} aria-hidden="true" />,
        badgeVariant: 'neutral' as const,
      };
    }
    return {
      label: 'Cloud API',
      icon: <Cloud size={12} aria-hidden="true" />,
      badgeVariant: 'neutral' as const,
    };
  };

  const location = getLocationDescriptor();

  return (
    <div
      className={`el-model-card ${isLoaded ? 'el-model-card--loaded' : ''} ${
        isCurrentSelection ? 'el-model-card--selected' : ''
      }`}
      role="article"
      aria-label={`Model: ${model.name}`}
    >
      {/* Top Header: Category & Location Badges */}
      <div className="el-model-card__header">
        <div className="el-model-card__badges">
          <span className="el-model-card__capability-badge">
            <span className="el-model-card__cap-icon" aria-hidden="true">
              {presentation.icon}
            </span>
            <span>{presentation.categoryLabel}</span>
          </span>

          <span className="el-model-card__location-badge">
            {location.icon}
            <span>{location.label}</span>
          </span>

          {isCurrentSelection && (
            <Badge variant="accent" size="sm">
              Selected
            </Badge>
          )}
        </div>

        <div className="el-model-card__quant">
          {model.quantization !== 'NONE' && (
            <span className="el-model-card__quant-chip">{model.quantization}</span>
          )}
          {model.sizeMb > 0 && (
            <span className="el-model-card__size-chip">{model.sizeMb} MB</span>
          )}
        </div>
      </div>

      {/* Model Name & Version */}
      <div className="el-model-card__identity">
        <h3 className="el-model-card__name">{model.name}</h3>
        <span className="el-model-card__version">{model.version}</span>
      </div>

      {/* Contract: Input -> Output */}
      <div className="el-model-card__contract">
        <span className="el-model-card__contract-label">I/O Contract:</span>
        <span className="el-model-card__contract-val">
          {model.inputType} <ArrowRight size={10} style={{ display: 'inline' }} /> {model.outputType}
        </span>
      </div>

      {/* Description */}
      <p className="el-model-card__desc">{model.description}</p>

      {/* Telemetry Metrics Strip: Latency, RAM, Quality */}
      <div className="el-model-card__metrics">
        <div className="el-model-card__metric">
          <span className="el-model-card__metric-label">Latency</span>
          <span className="el-model-card__metric-val">~{model.expectedLatencyMs}ms</span>
        </div>

        <div className="el-model-card__metric">
          <span className="el-model-card__metric-label">RAM Req</span>
          <span className="el-model-card__metric-val">{model.ramRequirementMb} MB</span>
        </div>

        <div className="el-model-card__metric">
          <span className="el-model-card__metric-label">Quality Score</span>
          <span className="el-model-card__metric-val el-model-card__metric-val--quality">
            {Math.round(model.qualityScore * 100)}%
          </span>
        </div>
      </div>

      {/* Memory Lifecycle State */}
      <div className="el-model-card__lifecycle-row">
        <div className="el-model-card__ram-status">
          <StatusIndicator
            status={isLoaded ? 'success' : 'neutral'}
            label={isLoaded ? 'Active in RAM' : 'Idle in Storage'}
            size="sm"
          />
        </div>

        {model.supportedDelegates && model.supportedDelegates.length > 0 && (
          <div className="el-model-card__delegates">
            <span className="el-model-card__delegates-label">HW:</span>
            <span className="el-model-card__delegates-val">
              {model.supportedDelegates.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="el-model-card__actions">
        {onExplain && (
          <button
            type="button"
            className="el-model-card__explain-btn"
            onClick={() => onExplain(model.capability)}
            aria-label={`Why would ${model.name} be chosen for ${model.capability}?`}
          >
            <HelpCircle size={12} aria-hidden="true" />
            <span>Why this model? ↗</span>
          </button>
        )}

        <div className="el-model-card__action-btns">
          {onToggleLoad && model.isLocalAvailable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLoad(model)}
              aria-label={isLoaded ? `Unload ${model.name} from memory` : `Load ${model.name} into memory`}
            >
              {isLoaded ? 'Unload' : 'Preload'}
            </Button>
          )}

          {onSelect && !isCurrentSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(model)}
              aria-label={`Select ${model.name}`}
            >
              Select
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onInspect(model)}
            aria-label={`Inspect specification for ${model.name}`}
          >
            Inspect Spec
          </Button>
        </div>
      </div>
    </div>
  );
};
