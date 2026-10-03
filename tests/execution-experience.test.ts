import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExecutionResultCard } from '../src/ui/components/execution/ExecutionResultCard';
import { ExecutionSummaryBar } from '../src/ui/components/execution/ExecutionSummaryBar';
import { ExecutionTimeline } from '../src/ui/components/execution/ExecutionTimeline';
import { ExecutionStepDetails } from '../src/ui/components/execution/ExecutionStepDetails';
import { IntermediateResultViewer } from '../src/ui/components/execution/IntermediateResultViewer';
import { ExecutionDetailView } from '../src/ui/components/execution/ExecutionDetailView';
import { ActivityScreen } from '../src/ui/screens/ActivityScreen';
import { ExecutionHistoryStore } from '../src/data/history-store';
import { DEMO_WORKFLOWS } from '../src/data/templates';
import { WorkflowExecutionReport } from '../src/types/execution';
import { Workflow } from '../src/types/workflow';

describe('Phase 7 — Execution & Activity Experience', () => {
  const financeWf: Workflow = DEMO_WORKFLOWS.find((w) => w.id === 'wf_finance_bill')!;

  const completedReport: WorkflowExecutionReport = {
    id: 'rep_completed_1',
    workflowId: 'wf_finance_bill',
    workflowName: 'Smart Bill & Expense Processor',
    status: 'COMPLETED',
    startTime: 1700000000000,
    endTime: 1700000001450,
    totalDurationMs: 1450,
    cacheHitsCount: 2,
    totalMemoryPeakMb: 142,
    deviceContextSnapshot: {
      deviceModel: 'Pixel 8 Pro',
      androidVersion: 14,
      totalRamMb: 12288,
      availableRamMb: 6400,
      batteryPercentage: 88,
      isCharging: false,
      thermalStatus: 'NOMINAL',
      networkState: 'WIFI_HIGH_SPEED',
      hasNpu: true,
      hasGpu: true,
      cpuCores: 8,
      storageAvailableMb: 120000,
      powerSaverEnabled: false,
      allowCloudInference: true,
    },
    nodeRecords: {
      node_bill_cam: {
        nodeId: 'node_bill_cam',
        label: 'Camera Capture (Bill/Receipt)',
        status: 'SUCCESS',
        startTime: 1700000000000,
        endTime: 1700000000200,
        latencyMs: 200,
        ramConsumedMb: 24,
        executionLocation: 'LOCAL_CPU',
        cacheHit: false,
        selectedModelId: 'camera_hw',
        selectedModelName: 'Camera Hardware API',
        logLines: ['Capture initiated', 'Image captured: 1920x1080'],
        outputData: { imagePath: '/storage/receipt.jpg', width: 1920, height: 1080 }
      },
      node_bill_ocr: {
        nodeId: 'node_bill_ocr',
        label: 'PaddleOCR / Document Text',
        status: 'SUCCESS',
        startTime: 1700000000200,
        endTime: 1700000000850,
        latencyMs: 650,
        ramConsumedMb: 85,
        executionLocation: 'LOCAL_NPU',
        selectedModelId: 'paddleocr_mobile',
        selectedModelName: 'PaddleOCR-v4-Mobile',
        cacheHit: true,
        logLines: ['Running OCR inference', 'Text bounding boxes resolved'],
        outputData: 'BLUE BOTTLE COFFEE\nSingle Origin Espresso $4.50\nOat Milk Cortado $5.25\nTotal: $9.75'
      },
      node_bill_calc: {
        nodeId: 'node_bill_calc',
        label: 'Extract & Calculate Sums',
        status: 'SUCCESS',
        startTime: 1700000000850,
        endTime: 1700000001050,
        latencyMs: 200,
        ramConsumedMb: 18,
        executionLocation: 'LOCAL_CPU',
        cacheHit: false,
        selectedModelId: 'calc_runtime',
        selectedModelName: 'Deterministic Arithmetic Kernel',
        logLines: ['Computing item sums', 'Verified total matches receipt'],
        outputData: { merchant: 'Blue Bottle Coffee', itemsCount: 2, subtotal: 9.75, tax: 0.78, total: 10.53 }
      }
    },
    finalOutputs: {
      total: 10.53,
      merchant: 'Blue Bottle Coffee'
    }
  };

  const failedReport: WorkflowExecutionReport = {
    ...completedReport,
    id: 'rep_failed_1',
    status: 'FAILED',
    nodeRecords: {
      ...completedReport.nodeRecords,
      node_bill_ocr: {
        nodeId: 'node_bill_ocr',
        label: 'PaddleOCR / Document Text',
        status: 'FAILED',
        startTime: 1700000000200,
        endTime: 1700000000500,
        latencyMs: 300,
        ramConsumedMb: 40,
        executionLocation: 'LOCAL_NPU',
        cacheHit: false,
        error: 'Image too blurry for OCR text recognition',
        logLines: ['Failed to detect text lines: low contrast'],
      }
    },
    finalOutputs: {}
  };

  const runningReport: WorkflowExecutionReport = {
    ...completedReport,
    id: 'rep_running_1',
    status: 'RUNNING',
    endTime: undefined,
    totalDurationMs: 400,
    nodeRecords: {
      node_bill_cam: completedReport.nodeRecords.node_bill_cam
    },
    finalOutputs: {}
  };

  beforeEach(() => {
    ExecutionHistoryStore.getInstance().clear();
  });

  describe('1. ExecutionResultCard Component', () => {
    it('should render finished success outcome first with domain narrative', () => {
      const html = renderToString(
        React.createElement(ExecutionResultCard, {
          workflow: financeWf,
          report: completedReport,
          onBack: vi.fn(),
          onReExecute: vi.fn(),
          onViewFinalOutput: vi.fn(),
        })
      );

      expect(html).toContain('el-exec-result-card--completed');
      expect(html).toContain('Smart Bill &amp; Expense Processor Finished');
      expect(html).toContain('Receipt image analyzed, items extracted, sum verified');
      expect(html).toContain('Success');
      expect(html).toContain('Back');
      expect(html).toContain('Re-run');
      expect(html).toContain('View Result');
      expect(html).toContain('id="re-execute-btn"');
    });

    it('should render failed outcome with halting step description and error message', () => {
      const html = renderToString(
        React.createElement(ExecutionResultCard, {
          workflow: financeWf,
          report: failedReport,
          onBack: vi.fn(),
          onReExecute: vi.fn(),
        })
      );

      expect(html).toContain('el-exec-result-card--failed');
      expect(html).toContain('Workflow Execution Incomplete');
      expect(html).toContain('Halted at PaddleOCR / Document Text');
      expect(html).toContain('Image too blurry for OCR text recognition');
      expect(html).toContain('Failed');
    });

    it('should render active running outcome and disable re-run button', () => {
      const html = renderToString(
        React.createElement(ExecutionResultCard, {
          workflow: financeWf,
          report: runningReport,
          activeNodeId: 'node_bill_ocr',
          onBack: vi.fn(),
          onReExecute: vi.fn(),
        })
      );

      expect(html).toContain('el-exec-result-card--running');
      expect(html).toContain('Processing Workflow...');
      expect(html).toContain('Running...');
      expect(html).toContain('disabled=""');
    });
  });

  describe('2. ExecutionSummaryBar Component', () => {
    it('should display progress track, completed steps count, and formatted duration', () => {
      const html = renderToString(
        React.createElement(ExecutionSummaryBar, {
          totalSteps: 5,
          report: completedReport,
        })
      );

      expect(html).toContain('el-exec-summary');
      expect(html).toContain('3<!-- --> of <!-- -->5');
      expect(html).toContain('1.45s');
      expect(html).toContain('Pixel 8 Pro');
      expect(html).toContain('2<!-- --> Cache Hit');
    });
  });

  describe('3. ExecutionTimeline Component', () => {
    it('should render sequential steps with status markers, locations, and cache indicators', () => {
      const html = renderToString(
        React.createElement(ExecutionTimeline, {
          workflow: financeWf,
          report: completedReport,
          selectedNodeId: 'node_bill_ocr',
          onSelectStep: vi.fn(),
        })
      );

      expect(html).toContain('el-exec-timeline');
      expect(html).toContain('Execution Timeline');
      expect(html).toContain('Camera Capture (Bill/Receipt)');
      expect(html).toContain('PaddleOCR / Document Text');
      expect(html).toContain('Extract &amp; Calculate Sums');
      expect(html).toContain('el-exec-timeline__step--selected');
      expect(html).toContain('⚡ Cache Hit');
      expect(html).toContain('Image → Extracted Text');
    });
  });

  describe('4. IntermediateResultViewer Component', () => {
    it('should render plain text content cleanly without raw JSON formatting', () => {
      const textOutput = 'Blue Bottle Coffee\nEspresso $4.50\nTotal: $4.50';
      const html = renderToString(
        React.createElement(IntermediateResultViewer, {
          data: textOutput,
          title: 'OCR Text',
        })
      );

      expect(html).toContain('el-result-viewer');
      expect(html).toContain('Blue Bottle Coffee');
      expect(html).toContain('Espresso $4.50');
      expect(html).toContain('Copy');
    });

    it('should render structured key-value pairs as a clean readable grid with raw JSON toggle', () => {
      const structuredOutput = {
        merchant: 'Strand Bookstore',
        subtotal: 45.00,
        tax: 3.06,
        total: 48.06
      };

      const html = renderToString(
        React.createElement(IntermediateResultViewer, {
          data: structuredOutput,
          title: 'Parsed Bill',
        })
      );

      expect(html).toContain('el-result-viewer__kv-grid');
      expect(html).toContain('merchant');
      expect(html).toContain('Strand Bookstore');
      expect(html).toContain('total');
      expect(html).toContain('48.06');
      expect(html).toContain('Raw JSON');
    });
  });

  describe('5. ExecutionStepDetails Component', () => {
    it('should present step purpose, result viewer, model delegation, and technical toggle', () => {
      const ocrNode = financeWf.nodes.find((n) => n.id === 'node_bill_ocr')!;
      const ocrRecord = completedReport.nodeRecords.node_bill_ocr;

      const html = renderToString(
        React.createElement(ExecutionStepDetails, {
          node: ocrNode,
          record: ocrRecord,
          onExplainModel: vi.fn(),
        })
      );

      expect(html).toContain('el-step-details');
      expect(html).toContain('PaddleOCR / Document Text');
      expect(html).toContain('Vision Inference');
      expect(html).toContain('PaddleOCR-v4-Mobile');
      expect(html).toContain('Technical Diagnostics &amp; Logs');
      expect(html).toContain('650<!-- -->ms');
      expect(html).toContain('85<!-- --> MB');
    });
  });

  describe('6. ExecutionDetailView Unified Integration', () => {
    it('should render complete unified view in live mode with input controls', () => {
      const html = renderToString(
        React.createElement(ExecutionDetailView, {
          workflow: financeWf,
          report: completedReport,
          onBack: vi.fn(),
          onReExecute: vi.fn(),
          isLiveMode: true,
          selectedPreset: 'preset_coffee',
          onSelectPreset: vi.fn(),
          onFileUpload: vi.fn(),
        })
      );

      expect(html).toContain('el-exec-detail-view');
      expect(html).toContain('Input Source:');
      expect(html).toContain('Upload Custom Image');
      expect(html).toContain('id="real-image-input"');
      expect(html).toContain('Coffee ($10.53)');
      expect(html).toContain('Books ($48.06)');
      expect(html).toContain('Market ($11.61)');
      expect(html).toContain('el-exec-split-container');
    });

    it('should omit live input controls in historical view mode', () => {
      const html = renderToString(
        React.createElement(ExecutionDetailView, {
          workflow: financeWf,
          report: completedReport,
          onBack: vi.fn(),
          isLiveMode: false,
        })
      );

      expect(html).toContain('el-exec-detail-view');
      expect(html).not.toContain('Input Source:');
      expect(html).not.toContain('Upload Custom Image');
    });
  });

  describe('7. ActivityScreen & History Drill-down', () => {
    it('should render empty state when history store is empty', () => {
      const html = renderToString(
        React.createElement(ActivityScreen, {})
      );

      expect(html).toContain('el-activity-screen');
      expect(html).toContain('Execution Activity');
      expect(html).toContain('No Execution History Yet');
    });

    it('should render activity cards with duration, status, and view action when reports exist', () => {
      const store = ExecutionHistoryStore.getInstance();
      store.addReport(completedReport);

      const html = renderToString(
        React.createElement(ActivityScreen, {})
      );

      expect(html).toContain('el-activity-card');
      expect(html).toContain('Smart Bill &amp; Expense Processor');
      expect(html).toContain('COMPLETED');
      expect(html).toContain('1.4s');
      expect(html).toContain('142<!-- --> MB');
      expect(html).toContain('2<!-- --> cache hit');
      expect(html).toContain('View Result');
      expect(html).toContain('Clear History');
    });
  });
});
