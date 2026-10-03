import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { WorkflowsScreen } from '../src/ui/screens/WorkflowsScreen';
import { WorkflowCard, formatRelativeTime, getWorkflowCapabilitySummary } from '../src/ui/components/workflows/WorkflowCard';
import { WorkflowPreview } from '../src/ui/components/workflows/WorkflowPreview';
import { DEMO_WORKFLOWS } from '../src/data/templates';
import { WorkflowExecutionReport } from '../src/types/execution';
import { Workflow } from '../src/types/workflow';

describe('Phase 6 — Workflow Library & WorkflowCard System', () => {
  const mockReport: WorkflowExecutionReport = {
    id: 'rep_01',
    workflowId: 'wf_finance_bill',
    workflowName: 'Smart Bill & Expense Processor',
    status: 'COMPLETED',
    startTime: Date.now() - 1000 * 60 * 15, // 15 mins ago
    endTime: Date.now() - 1000 * 60 * 15 + 1200,
    totalDurationMs: 1200,
    cacheHitsCount: 1,
    totalMemoryPeakMb: 120,
    deviceContextSnapshot: {
      deviceModel: 'Pixel 8',
      androidVersion: 14,
      totalRamMb: 8192,
      availableRamMb: 4000,
      batteryPercentage: 90,
      isCharging: false,
      thermalStatus: 'NOMINAL',
      networkState: 'WIFI_HIGH_SPEED',
      hasNpu: true,
      hasGpu: true,
      cpuCores: 8,
      storageAvailableMb: 50000,
      powerSaverEnabled: false,
      allowCloudInference: true,
    },
    nodeRecords: {},
    exportPayloadPreview: {},
  };

  describe('1. Formatting Utilities', () => {
    it('should format relative timestamps accurately without hallucination', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 1000 * 30)).toBe('Just now');
      expect(formatRelativeTime(now - 1000 * 60 * 12)).toBe('12m ago');
      expect(formatRelativeTime(now - 1000 * 60 * 60 * 3)).toBe('3h ago');
      expect(formatRelativeTime(now - 1000 * 60 * 60 * 24)).toBe('Yesterday');
      expect(formatRelativeTime(now - 1000 * 60 * 60 * 24 * 4)).toBe('4d ago');
    });

    it('should generate concise capability summaries with overflow handling', () => {
      const financeWf = DEMO_WORKFLOWS.find((w) => w.id === 'wf_finance_bill')!;
      const summary = getWorkflowCapabilitySummary(financeWf, 3);

      expect(summary).toContain('Camera');
      expect(summary).toContain('OCR');
      expect(summary).toContain('Calculation');
      expect(summary).toContain('+2 more');
    });
  });

  describe('2. WorkflowPreview Component', () => {
    it('should render ordered DAG node shells and connector arrows', () => {
      const financeWf = DEMO_WORKFLOWS.find((w) => w.id === 'wf_finance_bill')!;
      const html = renderToString(
        React.createElement(WorkflowPreview, {
          workflow: financeWf,
        })
      );

      expect(html).toContain('el-workflow-preview');
      expect(html).toContain('Camera Capture');
      expect(html).toContain('PaddleOCR / Document Text');
      expect(html).toContain('el-workflow-preview__connector');
    });

    it('should gracefully handle empty workflows', () => {
      const emptyWf: Workflow = {
        id: 'wf_empty',
        name: 'Empty Workflow',
        description: 'No nodes',
        domain: 'GENERAL',
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      };

      const html = renderToString(
        React.createElement(WorkflowPreview, {
          workflow: emptyWf,
        })
      );

      expect(html).toContain('Empty pipeline');
    });
  });

  describe('3. WorkflowCard Component', () => {
    it('should render card with name, description, domain, capability summary, and actions', () => {
      const financeWf = DEMO_WORKFLOWS.find((w) => w.id === 'wf_finance_bill')!;
      const html = renderToString(
        React.createElement(WorkflowCard, {
          workflow: financeWf,
          lastReport: mockReport,
          onOpen: vi.fn(),
          onRun: vi.fn(),
        })
      );

      expect(html).toContain('Smart Bill &amp; Expense Processor');
      expect(html).toContain('FINANCE');
      expect(html).toContain('Completed');
      expect(html).toContain('Open');
      expect(html).toContain('Run');
    });

    it('should indicate "Not run yet" when no execution history exists', () => {
      const lectureWf = DEMO_WORKFLOWS.find((w) => w.id === 'wf_education_lecture')!;
      const html = renderToString(
        React.createElement(WorkflowCard, {
          workflow: lectureWf,
          lastReport: undefined,
          onOpen: vi.fn(),
          onRun: vi.fn(),
        })
      );

      expect(html).toContain('Not run yet');
    });
  });

  describe('4. WorkflowsScreen Library Component', () => {
    it('should render library header, search input, domain filters, and demo cards', () => {
      const html = renderToString(
        React.createElement(WorkflowsScreen, {
          workflows: DEMO_WORKFLOWS,
          onOpenWorkflow: vi.fn(),
          onRunWorkflow: vi.fn(),
          onCreateWorkflow: vi.fn(),
        })
      );

      expect(html).toContain('Workflow Library');
      expect(html).toContain('Reusable automations you can open, edit, and run.');
      expect(html).toContain('New Workflow');
      expect(html).toContain('All Automations');
      expect(html).toContain('Finance');
      expect(html).toContain('Education');
      expect(html).toContain('Healthcare');
      expect(html).toContain('Productivity');
      // All 4 workflows present
      expect(html).toContain('Smart Bill &amp; Expense Processor');
      expect(html).toContain('Lecture Note &amp; Quiz Synthesizer');
      expect(html).toContain('Plant Disease &amp; Botanical Care Plan');
      expect(html).toContain('Meeting Digest &amp; Action Tracker');
    });

    it('should render empty library state when no workflows exist', () => {
      const html = renderToString(
        React.createElement(WorkflowsScreen, {
          workflows: [],
          onOpenWorkflow: vi.fn(),
          onRunWorkflow: vi.fn(),
          onCreateWorkflow: vi.fn(),
        })
      );

      expect(html).toContain('No workflows yet');
      expect(html).toContain('Create an automation in Studio');
    });
  });
});
