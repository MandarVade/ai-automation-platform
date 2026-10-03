import React, { useState, useEffect, useMemo } from 'react';
import { ModelRegistry } from '../../core/model/registry';
import { ModelLifecycleManager } from '../../core/model/lifecycle';
import { DeviceContextManager } from '../../core/resources/device-context';
import { ModelSelector } from '../../core/model/selector';
import { ModelSpec, ModelCapability, ModelScoreBreakdown } from '../../types/model';
import { ModelCard } from '../components/models/ModelCard';
import { ModelDetailSheet } from '../components/models/ModelDetailSheet';
import { ExplainabilityModal } from '../components/ExplainabilityModal';
import { Input, Button } from '../components/ui';
import { Search, Cpu, Cloud, Layers, Info, Filter, HardDrive } from 'lucide-react';

export const ModelRegistryScreen: React.FC = () => {
  const lifecycle = ModelLifecycleManager.getInstance();
  const deviceMgr = DeviceContextManager.getInstance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'LOCAL' | 'CLOUD'>('ALL');

  // Inspection & Explainability states
  const [inspectModel, setInspectModel] = useState<ModelSpec | null>(null);
  const [explainBreakdown, setExplainBreakdown] = useState<ModelScoreBreakdown | null>(null);
  const [explainCandidates, setExplainCandidates] = useState<ModelScoreBreakdown[]>([]);
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  // Live subscriptions for lifecycle and device context
  const [loadedModelIds, setLoadedModelIds] = useState<Set<string>>(
    new Set(lifecycle.getLoadedModels().map((r) => r.modelSpec.id))
  );
  const [activeRamMb, setActiveRamMb] = useState<number>(lifecycle.getTotalActiveRamMb());
  const [deviceContext, setDeviceContext] = useState(deviceMgr.getContext());

  useEffect(() => {
    const unsubLifecycle = lifecycle.subscribe(() => {
      setLoadedModelIds(new Set(lifecycle.getLoadedModels().map((r) => r.modelSpec.id)));
      setActiveRamMb(lifecycle.getTotalActiveRamMb());
    });

    const unsubDevice = deviceMgr.subscribe((ctx) => {
      setDeviceContext(ctx);
    });

    return () => {
      unsubLifecycle();
      unsubDevice();
    };
  }, []);

  const allModels = useMemo(() => ModelRegistry.getAll(), []);

  const onDeviceCount = useMemo(
    () => allModels.filter((m) => m.isLocalAvailable).length,
    [allModels]
  );
  const cloudCount = useMemo(
    () => allModels.filter((m) => m.isCloudAvailable).length,
    [allModels]
  );

  const capabilities: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Capabilities' },
    { id: 'OCR', label: 'OCR / Document Vision' },
    { id: 'SPEECH_TO_TEXT', label: 'Speech-to-Text' },
    { id: 'SUMMARIZATION', label: 'Summarization' },
    { id: 'CONCEPT_EXTRACTION', label: 'Concept Extraction' },
    { id: 'QUESTION_GENERATION', label: 'Question Generation' },
    { id: 'EXPENSE_CATEGORIZATION', label: 'Expense Categorization' },
    { id: 'PLANT_DISEASE_DIAGNOSIS', label: 'Plant Pathology' },
    { id: 'TASK_EXTRACTION', label: 'Task Extraction' },
  ];

  // Filtering
  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        query === '' ||
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.capability.toLowerCase().includes(query) ||
        m.quantization.toLowerCase().includes(query) ||
        m.supportedDelegates.some((d) => d.toLowerCase().includes(query));

      const matchesCap = selectedCap === 'ALL' || m.capability === selectedCap;

      const matchesLocation =
        filterType === 'ALL'
          ? true
          : filterType === 'LOCAL'
          ? m.isLocalAvailable
          : m.isCloudAvailable;

      return matchesSearch && matchesCap && matchesLocation;
    });
  }, [allModels, searchTerm, selectedCap, filterType]);

  // Load/Unload toggle
  const handleToggleLoad = (model: ModelSpec) => {
    if (loadedModelIds.has(model.id)) {
      lifecycle.unloadModel(model.id);
    } else {
      lifecycle.loadModel(model);
    }
  };

  // Explainability handler
  const handleExplain = (capability: ModelCapability) => {
    try {
      const result = ModelSelector.selectBestModel(capability, deviceContext, 'AUTO');
      setExplainBreakdown(result.breakdown);
      setExplainCandidates(result.allCandidates);
      setExplainModalOpen(true);
    } catch (err) {
      console.error('Failed to resolve explanation:', err);
    }
  };

  return (
    <div className="el-models-screen" role="main" aria-label="Model Registry and Catalog">
      {/* 1. Header */}
      <div className="el-models-header">
        <div>
          <h1 className="el-models-title">Models</h1>
          <p className="el-models-subtitle">
            Available inference models and their runtime characteristics.
          </p>
        </div>

        {/* Live Memory Budget Status */}
        <div className="el-models-budget-chip">
          <HardDrive size={13} aria-hidden="true" />
          <span className="el-models-budget-label">Active Weights RAM:</span>
          <span className="el-models-budget-val">
            {activeRamMb} MB / 2048 MB budget ({loadedModelIds.size} loaded)
          </span>
        </div>
      </div>

      {/* 2. Selection Rationale Callout */}
      <div className="el-models-info-banner">
        <Info size={14} className="el-models-info-banner__icon" aria-hidden="true" />
        <span className="el-models-info-banner__text">
          EL-06 automatically selects models based on capability, device resources, execution policy, and runtime conditions.
        </span>
      </div>

      {/* 3. Filters & Discovery Bar */}
      <div className="el-models-controls">
        <div className="el-models-search">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by model name, capability, delegate, or quantization..."
            leftIcon={<Search size={14} aria-hidden="true" />}
            aria-label="Search models"
          />
        </div>

        <div className="el-models-filter-group">
          {/* Capability Dropdown */}
          <div className="el-models-select-wrapper">
            <select
              className="el-models-select"
              value={selectedCap}
              onChange={(e) => setSelectedCap(e.target.value)}
              aria-label="Filter by capability"
            >
              {capabilities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter Tabs */}
          <div className="el-models-location-tabs" role="tablist" aria-label="Filter execution target">
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'ALL'}
              className={`el-models-tab-btn ${filterType === 'ALL' ? 'el-models-tab-btn--active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              <span>All</span>
              <span className="el-models-tab-count">{allModels.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'LOCAL'}
              className={`el-models-tab-btn ${filterType === 'LOCAL' ? 'el-models-tab-btn--active' : ''}`}
              onClick={() => setFilterType('LOCAL')}
            >
              <span>On-Device</span>
              <span className="el-models-tab-count">{onDeviceCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'CLOUD'}
              className={`el-models-tab-btn ${filterType === 'CLOUD' ? 'el-models-tab-btn--active' : ''}`}
              onClick={() => setFilterType('CLOUD')}
            >
              <span>Cloud</span>
              <span className="el-models-tab-count">{cloudCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="el-models-empty">
          <Layers size={32} className="el-models-empty__icon" aria-hidden="true" />
          <h3 className="el-models-empty__title">
            {allModels.length === 0 ? 'No models available' : 'No matching models'}
          </h3>
          <p className="el-models-empty__desc">
            {allModels.length === 0
              ? 'The runtime has no registered models for this device.'
              : 'Try another capability or execution target.'}
          </p>
        </div>
      ) : (
        <div className="el-models-grid" role="region" aria-label="Models Catalog">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isLoaded={loadedModelIds.has(model.id)}
              onInspect={(m) => setInspectModel(m)}
              onExplain={handleExplain}
              onToggleLoad={handleToggleLoad}
            />
          ))}
        </div>
      )}

      {/* 5. Deep Model Specification Sheet */}
      <ModelDetailSheet
        model={inspectModel}
        isOpen={Boolean(inspectModel)}
        onClose={() => setInspectModel(null)}
        isLoaded={inspectModel ? loadedModelIds.has(inspectModel.id) : false}
        onToggleLoad={handleToggleLoad}
      />

      {/* 6. Model Explainability Modal */}
      <ExplainabilityModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        breakdown={explainBreakdown || undefined}
        allCandidates={explainCandidates}
      />
    </div>
  );
};
