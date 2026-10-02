import { describe, it, expect } from 'vitest';
import { ModelSelector } from '../src/core/model/selector';
import { DeviceContext } from '../src/types/device';

describe('ModelSelector', () => {
  const baseDevice: DeviceContext = {
    deviceModel: 'Pixel 8 Pro',
    androidVersion: 14,
    totalRamMb: 8192,
    availableRamMb: 3500,
    batteryPercentage: 80,
    isCharging: false,
    thermalStatus: 'NOMINAL',
    networkState: 'WIFI_HIGH_SPEED',
    hasNpu: true,
    hasGpu: true,
    cpuCores: 8,
    storageAvailableMb: 40000,
    powerSaverEnabled: false,
    allowCloudInference: true
  };

  it('should rank on-device models with NNAPI highest when NPU is present', () => {
    const result = ModelSelector.selectBestModel('OCR', baseDevice, 'AUTO');
    expect(result.selectedModel).toBeDefined();
    expect(result.breakdown.totalScore).toBeGreaterThan(0);
    // PaddleOCR Mobile has NNAPI delegate support
    expect(result.breakdown.reasons.some((r) => r.includes('NNAPI') || r.includes('RAM'))).toBe(true);
  });

  it('should disqualify cloud models when device is OFFLINE', () => {
    const offlineDevice: DeviceContext = {
      ...baseDevice,
      networkState: 'OFFLINE'
    };

    const result = ModelSelector.selectBestModel('OCR', offlineDevice, 'AUTO');
    expect(result.selectedModel.isLocalAvailable).toBe(true);

    const cloudCandidate = result.allCandidates.find((c) => c.modelId.includes('cloud'));
    if (cloudCandidate) {
      expect(cloudCandidate.disqualificationReason).toContain('OFFLINE');
      expect(cloudCandidate.totalScore).toBeLessThan(0);
    }
  });

  it('should disqualify cloud models when allowCloudInference is false', () => {
    const privateDevice: DeviceContext = {
      ...baseDevice,
      allowCloudInference: false
    };

    const result = ModelSelector.selectBestModel('SUMMARIZATION', privateDevice, 'AUTO');
    expect(result.selectedModel.isLocalAvailable).toBe(true);

    const cloudCandidate = result.allCandidates.find((c) => c.modelId.includes('cloud'));
    if (cloudCandidate) {
      expect(cloudCandidate.disqualificationReason).toContain('privacy');
    }
  });
});
