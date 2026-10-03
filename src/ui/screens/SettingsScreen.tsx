import React, { useState } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { IntermediateResultCache } from '../../core/cache/result-cache';
import { ModelLifecycleManager } from '../../core/model/lifecycle';

export const SettingsScreen: React.FC = () => {
  const deviceMgr = DeviceContextManager.getInstance();
  const cache = IntermediateResultCache.getInstance();
  const lifecycle = ModelLifecycleManager.getInstance();

  const [device, setDevice] = useState(deviceMgr.getContext());
  const [cacheStats, setCacheStats] = useState(cache.getStats());

  const handleToggleCloud = (allowed: boolean) => {
    deviceMgr.updateContext({ allowCloudInference: allowed });
    setDevice(deviceMgr.getContext());
  };

  const handleClearCache = () => {
    cache.clear();
    setCacheStats(cache.getStats());
  };

  const handleUnloadAllModels = () => {
    lifecycle.unloadAll();
    alert('All AI models unloaded from Android RAM.');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>System Platform Settings</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Execution routing policies, device privacy boundaries, and model memory lifecycle.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Privacy & Cloud Routing Policy */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            Data Privacy & Cloud Boundary
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Enforce local-first execution. When cloud is disabled, all microphone, camera, and document data remains strictly in Android app memory.
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={device.allowCloudInference}
              onChange={(e) => handleToggleCloud(e.target.checked)}
            />
            <span style={{ fontWeight: 600 }}>Enable Hybrid Cloud Offloading</span>
          </label>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '24px', marginTop: '4px' }}>
            Allows offloading compute-intensive LLM summarization and high-parameter models when device is plugged into Wi-Fi.
          </div>
        </div>

        {/* Model Lifecycle & Memory */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            Model Lifecycle & Active Memory
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Active AI models in RAM: <strong>{lifecycle.getLoadedModels().length}</strong> models ({lifecycle.getTotalActiveRamMb()} MB allocated).
          </p>

          <button className="btn-secondary" onClick={handleUnloadAllModels}>
            Unload All Models from RAM
          </button>
        </div>

        {/* Deterministic Result Cache */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            Deterministic Intermediate Result Cache
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Key format: <code>workflowId::nodeId::inputHash::modelVersion::parameters</code>
          </p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
            <div className="stat-item">
              <span className="stat-label">Cached Entries</span>
              <span className="stat-value">{cacheStats.size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cache Hits</span>
              <span className="stat-value" style={{ color: '#34d399' }}>{cacheStats.hits}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Hit Ratio</span>
              <span className="stat-value">{cacheStats.hitRatioPercent}%</span>
            </div>
          </div>

          <button className="btn-secondary" onClick={handleClearCache}>
            Purge Cache Entries
          </button>
        </div>

        {/* Project & Team Attribution */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            About EL-06 Platform
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div><strong>Project:</strong> EL-06 — General-Purpose No-Code AI Automation Platform for Android</div>
            <div><strong>Team:</strong> SATYAGRAH 2.0</div>
            <div><strong>Architecture:</strong> Device-Aware Multi-Model Orchestration & Clean Architecture Runtime</div>
            <div><strong>Version:</strong> 1.0.0-PROTOTYPE (Industry Engineering Standard)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
