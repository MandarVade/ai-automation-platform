import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ModelRegistry } from '../src/core/model/registry';
import { ModelLifecycleManager } from '../src/core/model/lifecycle';
import { IntermediateResultCache } from '../src/core/cache/result-cache';
import { DeviceContextManager } from '../src/core/resources/device-context';
import { ModelSelector } from '../src/core/model/selector';
import { ModelCard } from '../src/ui/components/models/ModelCard';
import { ModelDetailSheet } from '../src/ui/components/models/ModelDetailSheet';
import { ModelRegistryScreen } from '../src/ui/screens/ModelRegistryScreen';
import { SettingsScreen } from '../src/ui/screens/SettingsScreen';
import { SettingsSection } from '../src/ui/components/settings/SettingsSection';
import { SettingsToggle } from '../src/ui/components/settings/SettingsToggle';

// Helper to strip React SSR interpolation comments
const cleanSsr = (html: string) => html.replace(/<!--.*?-->/g, '');

describe('Phase 8 — Models & Settings Presentation Surfaces', () => {
  const tesseract = ModelRegistry.getById('tesseract-mobile-lite')!;
  const cloudVision = ModelRegistry.getById('cloud-vision-ocr')!;
  const paddleOcr = ModelRegistry.getById('paddleocr-mobile-v4')!;

  beforeEach(() => {
    ModelLifecycleManager.getInstance().unloadAll();
    IntermediateResultCache.getInstance().clear();
    DeviceContextManager.getInstance().presetNominalHighEnd();
  });

  describe('1. ModelCard Grammar & Rendering', () => {
    it('renders on-device model with exact name, capability, and location badge', () => {
      const rawHtml = renderToString(
        React.createElement(ModelCard, {
          model: tesseract,
          isLoaded: false,
          isCurrentSelection: false,
          onSelect: () => {},
          onInspect: () => {},
          onExplain: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Tesseract OCR Mobile Lite');
      expect(html).toContain('Vision Inference');
      expect(html).toContain('On-device');
      expect(html).toContain('INT8');
      expect(html).toContain('12 MB');
    });

    it('renders cloud model with Cloud location tag and NONE quantization appropriately', () => {
      const rawHtml = renderToString(
        React.createElement(ModelCard, {
          model: cloudVision,
          isLoaded: false,
          isCurrentSelection: false,
          onSelect: () => {},
          onInspect: () => {},
          onExplain: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Google Cloud Vision OCR');
      expect(html).toContain('Cloud API');
      expect(html).toContain('CLOUD_API');
      expect(html).not.toContain('INT8');
    });

    it('renders real technical metrics (latency, RAM, quality percentage) without fabrication', () => {
      const rawHtml = renderToString(
        React.createElement(ModelCard, {
          model: tesseract,
          isLoaded: false,
          isCurrentSelection: false,
          onSelect: () => {},
          onInspect: () => {},
          onExplain: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      // 320 ms latency
      expect(html).toContain('~320ms');
      // 65 MB RAM requirement
      expect(html).toContain('65 MB');
      // 0.81 quality score displayed as 81%
      expect(html).toContain('81%');
      // Hardware delegate
      expect(html).toContain('CPU');
    });

    it('reflects active RAM loaded state when model is resident in memory', () => {
      const rawHtml = renderToString(
        React.createElement(ModelCard, {
          model: tesseract,
          isLoaded: true,
          isCurrentSelection: true,
          onSelect: () => {},
          onInspect: () => {},
          onExplain: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Active in RAM');
      expect(html).toContain('Selected');
    });

    it('shows input and output type contract correctly', () => {
      const rawHtml = renderToString(
        React.createElement(ModelCard, {
          model: paddleOcr,
          isLoaded: false,
          isCurrentSelection: false,
          onSelect: () => {},
          onInspect: () => {},
          onExplain: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('IMAGE');
      expect(html).toContain('TEXT');
      expect(html).toContain('NNAPI');
      expect(html).toContain('GPU_VULKAN');
    });
  });

  describe('2. ModelDetailSheet Progressive Disclosure', () => {
    it('renders full technical specifications in sheet container', () => {
      const rawHtml = renderToString(
        React.createElement(ModelDetailSheet, {
          model: tesseract,
          isOpen: true,
          onClose: () => {},
          isLoaded: false,
          onToggleLoad: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Tesseract OCR Mobile Lite');
      expect(html).toContain('v5.3.0-int8');
      expect(html).toContain('Ultra-lightweight on-device OCR engine');
      expect(html).toContain('RAM Requirement');
      expect(html).toContain('65 MB');
      expect(html).toContain('Show Raw Specification (JSON)');
    });

    it('returns empty string when closed', () => {
      const rawHtml = renderToString(
        React.createElement(ModelDetailSheet, {
          model: tesseract,
          isOpen: false,
          onClose: () => {},
          isLoaded: false,
          onToggleLoad: () => {},
        })
      );

      expect(rawHtml).toBe('');
    });
  });

  describe('3. ModelRegistryScreen Catalog & Filtering', () => {
    it('renders compact header and active memory budget strip', () => {
      const rawHtml = renderToString(React.createElement(ModelRegistryScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Models');
      expect(html).toContain('Available inference models and their runtime characteristics.');
      expect(html).toContain('/ 2048 MB budget');
      expect(html).toContain('Search by model name, capability, delegate, or quantization...');
    });

    it('renders all registered models from ModelRegistry by default', () => {
      const allModels = ModelRegistry.getAll();
      const rawHtml = renderToString(React.createElement(ModelRegistryScreen));
      const html = cleanSsr(rawHtml);

      expect(allModels.length).toBeGreaterThanOrEqual(10);
      expect(html).toContain('Tesseract OCR Mobile Lite');
      expect(html).toContain('PaddleOCR Mobile v4');
      expect(html).toContain('Google Cloud Vision OCR');
      expect(html).toContain('Whisper Base Mobile INT8');
    });

    it('includes automatic selection policy rationale banner', () => {
      const rawHtml = renderToString(React.createElement(ModelRegistryScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('EL-06 automatically selects models based on capability, device resources, execution policy, and runtime conditions.');
    });
  });

  describe('4. Settings UI Primitives & Sections', () => {
    it('SettingsSection renders title, description, and headerAction', () => {
      const rawHtml = renderToString(
        React.createElement(
          SettingsSection,
          {
            title: 'Test Section',
            description: 'Section explanation text',
            headerAction: React.createElement('span', null, 'Active'),
          },
          React.createElement('div', null, 'Content inside')
        )
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Test Section');
      expect(html).toContain('Section explanation text');
      expect(html).toContain('Active');
      expect(html).toContain('Content inside');
    });

    it('SettingsToggle renders accessible switch button with pressed state', () => {
      const rawHtml = renderToString(
        React.createElement(SettingsToggle, {
          id: 'setting-cloud-toggle-test',
          label: 'Enable Cloud',
          description: 'Permit remote API inference',
          checked: true,
          onChange: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Enable Cloud');
      expect(html).toContain('Permit remote API inference');
      expect(html).toContain('role="switch"');
      expect(html).toContain('aria-checked="true"');
    });
  });

  describe('5. SettingsScreen Technical Control Surfaces', () => {
    it('renders 5 primary sections with concise header', () => {
      const rawHtml = renderToString(React.createElement(SettingsScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Settings');
      expect(html).toContain('Runtime and device configuration for EL-06.');
      // Section 1: Cloud boundary
      expect(html).toContain('Data Privacy &amp; Cloud Boundary');
      // Section 2: Model lifecycle
      expect(html).toContain('Model Lifecycle &amp; Active Memory');
      // Section 3: Result cache
      expect(html).toContain('Deterministic Intermediate Result Cache');
      // Section 4: Hardware simulation
      expect(html).toContain('Runtime Hardware Simulation &amp; Constraints');
      // Section 5: Platform info
      expect(html).toContain('Platform &amp; System Information');
    });

    it('displays explicit cloud boundary safety and data boundary implications', () => {
      const rawHtml = renderToString(React.createElement(SettingsScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Enable Hybrid Cloud Offloading');
      expect(html).toContain('When disabled, all camera, audio, and document data strictly remains in Android device memory');
      expect(html).toContain('Current Network State:');
    });

    it('renders cache metrics and purge action trigger when populated', () => {
      IntermediateResultCache.getInstance().set(
        'test_key',
        'wf_test',
        'node_test',
        'hash_test',
        'v1',
        { text: 'OCR' },
        'LOCAL_CPU'
      );
      const rawHtml = renderToString(React.createElement(SettingsScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Cached Entries');
      expect(html).toContain('Hit Ratio');
      expect(html).toContain('Clear Cache');
      expect(html).toContain('workflowId::nodeId::inputHash');
    });

    it('renders hardware device context and presets', () => {
      const rawHtml = renderToString(React.createElement(SettingsScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Pixel 8 Pro (NPU)');
      expect(html).toContain('Budget (4GB RAM)');
      expect(html).toContain('Thermal Status:');
      expect(html).toContain('Battery:');
      expect(html).toContain('Power Saver Mode');
    });

    it('renders platform information table with actual values from DeviceContext', () => {
      const rawHtml = renderToString(React.createElement(SettingsScreen));
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Operating System');
      expect(html).toContain('Android 14 (API 34)');
      expect(html).toContain('Device Model');
      expect(html).toContain('Total RAM');
      expect(html).toContain('Hardware Acceleration');
      expect(html).toContain('Runtime Version');
      expect(html).toContain('SATYAGRAH 2.0');
    });
  });

  describe('6. Core State Synchronization & Safe Operations', () => {
    it('synchronizes model loading through ModelLifecycleManager', async () => {
      const lifecycle = ModelLifecycleManager.getInstance();
      expect(lifecycle.getLoadedModels().length).toBe(0);

      await lifecycle.loadModel(tesseract);
      expect(lifecycle.isLoaded('tesseract-mobile-lite')).toBe(true);
      expect(lifecycle.getTotalActiveRamMb()).toBe(65);

      lifecycle.unloadModel('tesseract-mobile-lite');
      expect(lifecycle.isLoaded('tesseract-mobile-lite')).toBe(false);
      expect(lifecycle.getTotalActiveRamMb()).toBe(0);
    });

    it('IntermediateResultCache correctly stores and purges entries', () => {
      const cache = IntermediateResultCache.getInstance();
      cache.set('test_key_1', 'wf_test', 'node_test', 'hash_test', 'v1', { data: 'value1' }, 'LOCAL_CPU');
      expect(cache.getStats().size).toBe(1);

      cache.clear();
      expect(cache.getStats().size).toBe(0);
    });

    it('DeviceContextManager updates cloud policy and presets synchronously', () => {
      const devCtx = DeviceContextManager.getInstance();
      devCtx.presetBudgetConstrained();
      const snapshot1 = devCtx.getContext();
      expect(snapshot1.deviceModel).toBe('Android Budget Device (4GB RAM)');
      expect(snapshot1.hasNpu).toBe(false);

      devCtx.presetNominalHighEnd();
      const snapshot2 = devCtx.getContext();
      expect(snapshot2.deviceModel).toBe('Pixel 8 Pro (Google Tensor G3 + NPU)');
      expect(snapshot2.hasNpu).toBe(true);
    });

    it('ModelSelector explains selection rationale with actual compatibility data', () => {
      const devCtx = DeviceContextManager.getInstance();
      const decision = ModelSelector.selectBestModel('OCR', devCtx.getContext());

      expect(decision.selectedModel).toBeDefined();
      expect(decision.breakdown).toBeDefined();
      expect(decision.allCandidates.length).toBeGreaterThan(0);
      expect(decision.allCandidates[0]).toHaveProperty('modelId');
      expect(decision.allCandidates[0]).toHaveProperty('location');
      expect(decision.allCandidates[0]).toHaveProperty('totalScore');
      expect(decision.allCandidates[0].totalScore).toBeGreaterThan(0);
      expect(decision.allCandidates[0]).toHaveProperty('reasons');
    });
  });
});
