import React, { useState } from 'react';
import { ModelRegistry } from '../../core/model/registry';
import { ModelSpec, ModelCapability } from '../../types/model';

export const ModelRegistryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'LOCAL' | 'CLOUD'>('ALL');
  const [inspectModel, setInspectModel] = useState<ModelSpec | null>(null);

  const allModels = ModelRegistry.getAll();

  const filtered = allModels.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCap = selectedCap === 'ALL' || m.capability === selectedCap;
    const matchesType =
      filterType === 'ALL'
        ? true
        : filterType === 'LOCAL'
        ? m.isLocalAvailable
        : m.isCloudAvailable;
    return matchesSearch && matchesCap && matchesType;
  });

  const capabilities = [
    'ALL',
    'OCR',
    'SPEECH_TO_TEXT',
    'SUMMARIZATION',
    'CONCEPT_EXTRACTION',
    'QUESTION_GENERATION',
    'EXPENSE_CATEGORIZATION',
    'PLANT_DISEASE_DIAGNOSIS',
    'TASK_EXTRACTION'
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Model Registry & Discovery Abstraction</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Curated on-device and cloud AI model specifications, quantization tiers, and hardware delegates.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          className="nl-input"
          style={{ maxWidth: '280px', padding: '8px 12px', fontSize: '13px' }}
          placeholder="Search models by name or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCap}
          onChange={(e) => setSelectedCap(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-default)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        >
          {capabilities.map((c) => (
            <option key={c} value={c}>
              Capability: {c}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn-secondary ${filterType === 'ALL' ? 'active' : ''}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('ALL')}
          >
            All Models ({allModels.length})
          </button>
          <button
            className={`btn-secondary ${filterType === 'LOCAL' ? 'active' : ''}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('LOCAL')}
          >
            On-Device Only
          </button>
          <button
            className={`btn-secondary ${filterType === 'CLOUD' ? 'active' : ''}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('CLOUD')}
          >
            Cloud Only
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="card-grid">
        {filtered.map((model) => (
          <div key={model.id} className="workflow-card">
            <div>
              <div className="card-top">
                <span
                  className="status-pill"
                  style={{
                    fontSize: '10px',
                    color: model.isLocalAvailable ? 'var(--accent-cyan)' : '#c084fc',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  {model.isLocalAvailable ? 'ON-DEVICE' : 'CLOUD ENDPOINT'}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {model.quantization}
                </span>
              </div>

              <div className="card-name" style={{ fontSize: '14px' }}>
                {model.name}
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                {model.capability}
              </div>
              <div className="card-desc">{model.description}</div>
            </div>

            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  background: 'var(--bg-app)',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  marginBottom: '10px'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>RAM: </span>
                  <span style={{ fontWeight: 600 }}>{model.ramRequirementMb}MB</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>LATENCY: </span>
                  <span style={{ fontWeight: 600 }}>~{model.expectedLatencyMs}ms</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>QUALITY: </span>
                  <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                    {Math.round(model.qualityScore * 100)}%
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  HW: {model.supportedDelegates.join(', ')}
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => setInspectModel(model)}
                >
                  Inspect Spec
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Spec Inspection Dialog */}
      {inspectModel && (
        <div className="modal-backdrop" onClick={() => setInspectModel(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="stat-label">MODEL ARCHITECTURE & SPECIFICATION</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{inspectModel.name}</h3>
              </div>
              <button className="btn-secondary" onClick={() => setInspectModel(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <pre className="code-view">
                {JSON.stringify(inspectModel, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setInspectModel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
