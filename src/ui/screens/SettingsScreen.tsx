import React, { useState, useEffect } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { IntermediateResultCache } from '../../core/cache/result-cache';
import { ModelLifecycleManager } from '../../core/model/lifecycle';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsToggle } from '../components/settings/SettingsToggle';
import { Button, Dialog, StatusIndicator, Badge } from '../components/ui';
import {
  Shield,
  Cpu,
  Database,
  Sliders,
  Info,
  Trash2,
  RotateCcw,
  Wifi,
  Battery,
  Flame,
  HardDrive,
  AlertTriangle
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const deviceMgr = DeviceContextManager.getInstance();
  const cache = IntermediateResultCache.getInstance();
  const lifecycle = ModelLifecycleManager.getInstance();

  const [device, setDevice] = useState(deviceMgr.getContext());
  const [cacheStats, setCacheStats] = useState(cache.getStats());
  const [loadedModels, setLoadedModels] = useState(lifecycle.getLoadedModels());
  const [activeRamMb, setActiveRamMb] = useState(lifecycle.getTotalActiveRamMb());

  // Confirmation dialog states
  const [clearCacheDialogOpen, setClearCacheDialogOpen] = useState(false);
  const [unloadModelsDialogOpen, setUnloadModelsDialogOpen] = useState(false);

  // Subscriptions for live synchronization
  useEffect(() => {
    const unsubDevice = deviceMgr.subscribe((ctx) => {
      setDevice(ctx);
    });

    const unsubLifecycle = lifecycle.subscribe(() => {
      setLoadedModels(lifecycle.getLoadedModels());
      setActiveRamMb(lifecycle.getTotalActiveRamMb());
    });

    return () => {
      unsubDevice();
      unsubLifecycle();
    };
  }, []);

  // Handlers
  const handleToggleCloud = (allowed: boolean) => {
    deviceMgr.updateContext({ allowCloudInference: allowed });
  };

  const handleTogglePowerSaver = (enabled: boolean) => {
    deviceMgr.updateContext({ powerSaverEnabled: enabled });
  };

  const handleClearCacheConfirm = () => {
    cache.clear();
    setCacheStats(cache.getStats());
    setClearCacheDialogOpen(false);
  };

  const handleUnloadAllConfirm = () => {
    lifecycle.unloadAll();
    setUnloadModelsDialogOpen(false);
  };

  const handleUnloadSingleModel = (modelId: string) => {
    lifecycle.unloadModel(modelId);
  };

  // Preset handlers
  const handlePresetNominal = () => {
    deviceMgr.presetNominalHighEnd();
  };

  const handlePresetBudget = () => {
    deviceMgr.presetBudgetConstrained();
  };

  const handlePresetOffline = () => {
    deviceMgr.updateContext({
      networkState: 'OFFLINE',
      allowCloudInference: false
    });
  };

  const ramBudgetPercent = Math.min(100, Math.round((activeRamMb / 2048) * 100));

  return (
    <div className="el-settings-screen" role="main" aria-label="System Settings">
      {/* 1. Page Header */}
      <div className="el-settings-header">
        <h1 className="el-settings-title">Settings</h1>
        <p className="el-settings-subtitle">
          Runtime and device configuration for EL-06.
        </p>
      </div>

      <div className="el-settings-sections">
        {/* Section 1: Data Privacy & Cloud Boundary */}
        <SettingsSection
          title="Data Privacy & Cloud Boundary"
          description="Enforce local-first execution. Controls whether workflows may route inferences to external cloud APIs."
          icon={<Shield size={16} />}
        >
          <SettingsToggle
            id="setting-cloud-toggle"
            label="Enable Hybrid Cloud Offloading"
            description="When enabled, workflows may use cloud endpoints when on-device models are unsuitable or when network permits. When disabled, all camera, audio, and document data strictly remains in Android device memory."
            checked={device.allowCloudInference}
            onChange={handleToggleCloud}
            badge={
              <Badge variant={device.allowCloudInference ? 'accent' : 'neutral'}>
                {device.allowCloudInference ? 'Hybrid Cloud' : 'Local Only'}
              </Badge>
            }
          />

          <div className="el-settings-network-row">
            <span className="el-settings-network-label">
              <Wifi size={13} aria-hidden="true" />
              <span>Current Network State:</span>
            </span>
            <span className="el-settings-network-val">
              {device.networkState === 'WIFI_HIGH_SPEED'
                ? 'High-Speed Wi-Fi'
                : device.networkState === 'CELLULAR_4G_5G'
                ? 'Cellular 4G/5G'
                : device.networkState === 'OFFLINE'
                ? 'Offline (Disconnected)'
                : 'Slow Network'}
            </span>
          </div>
        </SettingsSection>

        {/* Section 2: Model Lifecycle & Active Memory */}
        <SettingsSection
          title="Model Lifecycle & Active Memory"
          description="Manage AI model weight buffers resident in Android application RAM."
          icon={<Cpu size={16} />}
          headerAction={
            loadedModels.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnloadModelsDialogOpen(true)}
              >
                Unload All
              </Button>
            )
          }
        >
          {/* Active RAM Progress Bar */}
          <div className="el-settings-ram-bar">
            <div className="el-settings-ram-header">
              <span className="el-settings-ram-label">Weight Memory Allocation:</span>
              <span className="el-settings-ram-value">
                {activeRamMb} MB / 2048 MB budget ({ramBudgetPercent}%)
              </span>
            </div>
            <div className="el-settings-progress-track">
              <div
                className="el-settings-progress-fill"
                style={{
                  width: `${ramBudgetPercent}%`,
                  backgroundColor:
                    ramBudgetPercent > 80
                      ? 'var(--color-error)'
                      : ramBudgetPercent > 50
                      ? 'var(--color-warning)'
                      : 'var(--color-accent)'
                }}
              />
            </div>
          </div>

          {/* Loaded Models List */}
          <div className="el-settings-loaded-list">
            <span className="el-settings-sublabel">Resident Models in Memory:</span>
            {loadedModels.length === 0 ? (
              <p className="el-settings-empty-notice">
                No AI models currently resident in RAM. Weights load on-demand during pipeline execution.
              </p>
            ) : (
              <div className="el-settings-model-chips">
                {loadedModels.map((rec) => (
                  <div key={rec.modelSpec.id} className="el-settings-model-chip">
                    <div className="el-settings-model-chip__left">
                      <span className="el-settings-model-chip__name">
                        {rec.modelSpec.name}
                      </span>
                      <span className="el-settings-model-chip__ram">
                        {rec.memoryAllocatedMb} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="el-settings-model-chip__unload"
                      onClick={() => handleUnloadSingleModel(rec.modelSpec.id)}
                      aria-label={`Unload ${rec.modelSpec.name} from memory`}
                      title="Unload from memory"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Section 3: Deterministic Intermediate Result Cache */}
        <SettingsSection
          title="Deterministic Intermediate Result Cache"
          description="In-memory cache for deterministic transforms, OCR text, and feature extractions."
          icon={<Database size={16} />}
          headerAction={
            cacheStats.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={13} aria-hidden="true" />}
                onClick={() => setClearCacheDialogOpen(true)}
              >
                Clear Cache
              </Button>
            )
          }
        >
          <div className="el-settings-cache-grid">
            <div className="el-settings-stat-card">
              <span className="el-settings-stat-label">Cached Entries</span>
              <span className="el-settings-stat-val">{cacheStats.size}</span>
            </div>

            <div className="el-settings-stat-card">
              <span className="el-settings-stat-label">Cache Hits</span>
              <span className="el-settings-stat-val" style={{ color: 'var(--color-success)' }}>
                {cacheStats.hits}
              </span>
            </div>

            <div className="el-settings-stat-card">
              <span className="el-settings-stat-label">Cache Misses</span>
              <span className="el-settings-stat-val">{cacheStats.misses}</span>
            </div>

            <div className="el-settings-stat-card">
              <span className="el-settings-stat-label">Hit Ratio</span>
              <span className="el-settings-stat-val">
                {cacheStats.hitRatioPercent}%
              </span>
            </div>
          </div>

          <div className="el-settings-cache-key-box">
            <span className="el-settings-cache-key-title">Cache Key Specification:</span>
            <code className="el-settings-cache-key-code">
              workflowId::nodeId::inputHash::modelVersion::parameters
            </code>
          </div>
        </SettingsSection>

        {/* Section 4: Runtime Hardware Simulation & Constraints */}
        <SettingsSection
          title="Runtime Hardware Simulation & Constraints"
          description="Configure simulated device telemetry to test autonomous model routing under varied battery and memory states."
          icon={<Sliders size={16} />}
        >
          <div className="el-settings-preset-row">
            <span className="el-settings-sublabel">Simulation Presets:</span>
            <div className="el-settings-preset-btns">
              <Button variant="secondary" size="sm" onClick={handlePresetNominal}>
                Pixel 8 Pro (NPU)
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePresetBudget}>
                Budget (4GB RAM)
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePresetOffline}>
                Offline Field Device
              </Button>
            </div>
          </div>

          <SettingsToggle
            id="setting-power-saver"
            label="Power Saver Mode"
            description="Restricts aggressive NPU thread utilization to conserve mobile battery."
            checked={device.powerSaverEnabled}
            onChange={handleTogglePowerSaver}
          />

          <div className="el-settings-hardware-status-row">
            <div className="el-settings-hw-item">
              <Battery size={13} aria-hidden="true" />
              <span>Battery:</span>
              <strong>{device.batteryPercentage}% {device.isCharging ? '(Charging)' : ''}</strong>
            </div>

            <div className="el-settings-hw-item">
              <Flame size={13} aria-hidden="true" />
              <span>Thermal Status:</span>
              <StatusIndicator
                status={device.thermalStatus === 'NOMINAL' ? 'success' : 'warning'}
                label={device.thermalStatus}
                size="sm"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Section 5: Platform & System Information */}
        <SettingsSection
          title="Platform & System Information"
          description="Hardware capabilities, architecture summary, and environment attribution."
          icon={<Info size={16} />}
        >
          <div className="el-settings-info-grid">
            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Operating System</span>
              <span className="el-settings-info-val">Android 14 (API 34)</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Device Model</span>
              <span className="el-settings-info-val">{device.deviceModel}</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Total RAM</span>
              <span className="el-settings-info-val">{device.totalRamMb} MB</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Available RAM</span>
              <span className="el-settings-info-val">{device.availableRamMb} MB</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Hardware Acceleration</span>
              <span className="el-settings-info-val">
                NPU: {device.hasNpu ? 'Available' : 'None'} · GPU: {device.hasGpu ? 'Available' : 'None'}
              </span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">CPU Concurrency</span>
              <span className="el-settings-info-val">{device.cpuCores} Cores</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Architecture</span>
              <span className="el-settings-info-val">Device-Aware Multi-Model Orchestration</span>
            </div>

            <div className="el-settings-info-item">
              <span className="el-settings-info-key">Runtime Version</span>
              <span className="el-settings-info-val">1.0.0-PROTOTYPE</span>
            </div>
          </div>

          <div className="el-settings-attribution">
            <p className="el-settings-attribution-title">EL-06 — General-Purpose No-Code AI Automation Platform</p>
            <p className="el-settings-attribution-team">Developed by Team SATYAGRAH 2.0</p>
          </div>
        </SettingsSection>
      </div>

      {/* Confirmation Dialog: Clear Cache */}
      <Dialog
        open={clearCacheDialogOpen}
        onClose={() => setClearCacheDialogOpen(false)}
        title="Purge Cached Results?"
        description="This action will remove all locally stored execution results from cache. Future workflows will re-execute OCR and inferences directly."
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setClearCacheDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleClearCacheConfirm}>
              Clear Cache
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Currently cached: <strong>{cacheStats.size}</strong> execution outputs. Model weights in RAM will not be affected.
        </p>
      </Dialog>

      {/* Confirmation Dialog: Unload Models */}
      <Dialog
        open={unloadModelsDialogOpen}
        onClose={() => setUnloadModelsDialogOpen(false)}
        title="Unload All Models from RAM?"
        description="This will release all allocated weight buffers from Android memory. Models will reload automatically on subsequent executions."
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setUnloadModelsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUnloadAllConfirm}>
              Unload All Models
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Releasing <strong>{activeRamMb} MB</strong> of weight memory across <strong>{loadedModels.length}</strong> loaded models.
        </p>
      </Dialog>
    </div>
  );
};
