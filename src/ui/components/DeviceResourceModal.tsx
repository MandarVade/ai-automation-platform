import React, { useState } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { DeviceContext, ThermalStatus, NetworkState } from '../../types/device';

interface DeviceResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceResourceModal: React.FC<DeviceResourceModalProps> = ({ isOpen, onClose }) => {
  const manager = DeviceContextManager.getInstance();
  const [context, setContext] = useState<DeviceContext>(manager.getContext());

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<DeviceContext>) => {
    const updated = { ...context, ...partial };
    setContext(updated);
    manager.updateContext(partial);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Device Resource Simulator</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Test autonomous model selection, routing, and fallbacks under edge constraints.
            </p>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Presets for Judges */}
          <div>
            <label className="stat-label">Quick Scenarios for Demonstration</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '11px' }}
                onClick={() => {
                  manager.presetNominalHighEnd();
                  setContext(manager.getContext());
                }}
              >
                🚀 Flagship (Pixel 8 / NPU / 12GB)
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '11px' }}
                onClick={() => {
                  manager.presetBudgetConstrained();
                  setContext(manager.getContext());
                }}
              >
                📱 Budget Device (4GB RAM / Metered)
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '11px' }}
                onClick={() => {
                  manager.presetOfflineLowBattery();
                  setContext(manager.getContext());
                }}
              >
                ⚠️ Offline Critical (14% Bat / Severe)
              </button>
            </div>
          </div>

          {/* Available RAM Slider */}
          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Available RAM Headroom</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {context.availableRamMb} MB / {context.totalRamMb} MB
              </span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="128"
              value={context.availableRamMb}
              onChange={(e) => handleUpdate({ availableRamMb: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>512 MB (OOM Risk)</span>
              <span>2048 MB (Mid-range)</span>
              <span>8192 MB (Flagship)</span>
            </div>
          </div>

          {/* Battery & Charging */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Battery Reserve</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{context.batteryPercentage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={context.batteryPercentage}
                onChange={(e) => handleUpdate({ batteryPercentage: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={context.isCharging}
                  onChange={(e) => handleUpdate({ isCharging: e.target.checked })}
                />
                Device Connected to Charger
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={context.powerSaverEnabled}
                  onChange={(e) => handleUpdate({ powerSaverEnabled: e.target.checked })}
                />
                Android Battery Saver Active
              </label>
            </div>
          </div>

          {/* Connectivity & Cloud Inference */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="stat-label">Network State</label>
              <select
                value={context.networkState}
                onChange={(e) => handleUpdate({ networkState: e.target.value as NetworkState })}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  marginTop: '4px'
                }}
              >
                <option value="WIFI_HIGH_SPEED">Wi-Fi (High Speed Unmetered)</option>
                <option value="CELLULAR_4G_5G">Cellular 4G/5G</option>
                <option value="CELLULAR_METRED">Cellular Metered / Roaming</option>
                <option value="OFFLINE">Offline (Airplane Mode)</option>
              </select>
            </div>

            <div>
              <label className="stat-label">Thermal Throttling State</label>
              <select
                value={context.thermalStatus}
                onChange={(e) => handleUpdate({ thermalStatus: e.target.value as ThermalStatus })}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  marginTop: '4px'
                }}
              >
                <option value="NOMINAL">Nominal (Cool / No Throttling)</option>
                <option value="MODERATE">Moderate Warmup</option>
                <option value="SEVERE">Severe Heat (Throttling On)</option>
                <option value="CRITICAL">Critical Thermal Pressure</option>
              </select>
            </div>
          </div>

          {/* Privacy & Cloud Permission */}
          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={context.allowCloudInference}
                onChange={(e) => handleUpdate({ allowCloudInference: e.target.checked })}
              />
              <span style={{ fontWeight: 500 }}>Allow Cloud Inference</span>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
              When disabled, platform enforces 100% On-Device execution and rejects all external cloud endpoints.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Apply Context
          </button>
        </div>
      </div>
    </div>
  );
};
