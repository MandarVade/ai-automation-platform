import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MOTION_DURATIONS, MOTION_EASINGS, MOTION_VARIANTS } from '../src/ui/motion/motion-tokens';
import { PageMotion } from '../src/ui/motion/PageMotion';
import { Dialog } from '../src/ui/components/ui/Dialog';
import { Sheet } from '../src/ui/components/ui/Sheet';
import { WorkflowNodeShell } from '../src/ui/components/studio/WorkflowNodeShell';
import { ExecutionTimeline } from '../src/ui/components/execution/ExecutionTimeline';
import { StudioPromptPanel } from '../src/ui/components/studio/StudioPromptPanel';
import { DEMO_WORKFLOWS } from '../src/data/templates';
import { ReactFlowProvider } from '@xyflow/react';
import { Workflow, WorkflowNode } from '../src/types/workflow';
import { WorkflowExecutionReport } from '../src/types/execution';

const cleanSsr = (html: string) => html.replace(/<!--.*?-->/g, '');
const renderWithFlow = (element: React.ReactElement) => {
  return renderToString(
    React.createElement(ReactFlowProvider, null, element)
  );
};

describe('Phase 9 — Motion, Micro-interactions & Polish', () => {
  const financeWf: Workflow = DEMO_WORKFLOWS.find((w) => w.id === 'wf_finance_bill')!;
  const ocrNode: WorkflowNode = financeWf.nodes[1];

  describe('1. Centralized Motion Tokens & Variants', () => {
    it('defines restrained, tiered timing conventions', () => {
      expect(MOTION_DURATIONS.micro).toBeLessThanOrEqual(0.16);
      expect(MOTION_DURATIONS.micro).toBeGreaterThanOrEqual(0.10);

      expect(MOTION_DURATIONS.standard).toBeLessThanOrEqual(0.26);
      expect(MOTION_DURATIONS.standard).toBeGreaterThanOrEqual(0.18);

      expect(MOTION_DURATIONS.emphasis).toBeLessThanOrEqual(0.42);
      expect(MOTION_DURATIONS.emphasis).toBeGreaterThanOrEqual(0.28);
    });

    it('defines controlled cubic-bezier easing without excessive bounce or overshoot', () => {
      expect(Array.isArray(MOTION_EASINGS.easeOut)).toBe(true);
      expect(Array.isArray(MOTION_EASINGS.easeInOut)).toBe(true);
      expect(MOTION_EASINGS.subtleSpring.damping).toBeGreaterThanOrEqual(20);
      expect(MOTION_EASINGS.subtleSpring.stiffness).toBeGreaterThanOrEqual(200);
    });

    it('provides standardized variants for pages, dialogs, sheets, and disclosures', () => {
      expect(MOTION_VARIANTS.page.initial).toHaveProperty('opacity', 0);
      expect(MOTION_VARIANTS.page.animate).toHaveProperty('opacity', 1);
      expect(MOTION_VARIANTS.pageReduced.initial).toHaveProperty('opacity', 0);
      expect(MOTION_VARIANTS.dialog.initial).toHaveProperty('scale', 0.98);
      expect(MOTION_VARIANTS.sheetRight.initial).toHaveProperty('x', 24);
      expect(MOTION_VARIANTS.sheetBottom.initial).toHaveProperty('y', 24);
      expect(MOTION_VARIANTS.disclosure.initial).toHaveProperty('height', 0);
    });
  });

  describe('2. Page Entrance Transitions (PageMotion)', () => {
    it('renders page content with standardized motion container', () => {
      const rawHtml = renderToString(
        React.createElement(
          PageMotion,
          { id: 'test-page' },
          React.createElement('div', { className: 'test-content' }, 'Page Content')
        )
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('id="test-page"');
      expect(html).toContain('Page Content');
      expect(html).toContain('width:100%');
    });
  });

  describe('3. Dialog & Sheet Transitions & Accessibility', () => {
    it('Dialog renders with accessible role, overlay, and title when open', () => {
      const rawHtml = renderToString(
        React.createElement(
          Dialog,
          {
            open: true,
            onClose: () => {},
            title: 'Confirm Operation',
            description: 'Operation details',
          },
          React.createElement('p', null, 'Dialog Body Content')
        )
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-dialog-overlay');
      expect(html).toContain('el-dialog');
      expect(html).toContain('Confirm Operation');
      expect(html).toContain('Operation details');
      expect(html).toContain('Dialog Body Content');
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
    });

    it('Dialog renders null when closed preserving layout stability', () => {
      const rawHtml = renderToString(
        React.createElement(
          Dialog,
          {
            open: false,
            onClose: () => {},
            title: 'Hidden Dialog',
          },
          React.createElement('p', null, 'Should not render')
        )
      );
      expect(rawHtml).toBe('');
    });

    it('Sheet renders side and size variants with accessible close button', () => {
      const rawHtml = renderToString(
        React.createElement(
          Sheet,
          {
            open: true,
            onClose: () => {},
            side: 'right',
            size: 'md',
            title: 'Node Configuration',
          },
          React.createElement('div', null, 'Sheet Content')
        )
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-sheet-overlay');
      expect(html).toContain('el-sheet--right');
      expect(html).toContain('el-sheet--md');
      expect(html).toContain('Node Configuration');
      expect(html).toContain('Sheet Content');
      expect(html).toContain('aria-label="Close sheet"');
    });

    it('Sheet renders null when closed', () => {
      const rawHtml = renderToString(
        React.createElement(Sheet, {
          open: false,
          onClose: () => {},
        }, 'Hidden')
      );
      expect(rawHtml).toBe('');
    });
  });

  describe('4. Node Selection & Execution States', () => {
    it('WorkflowNodeShell reflects selected state without altering node structure', () => {
      const rawHtml = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: ocrNode,
          selected: true,
          status: 'IDLE',
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-flow-node--selected');
      expect(html).toContain(ocrNode.label);
      expect(html).toContain('role="group"');
    });

    it('WorkflowNodeShell reflects RUNNING status with pulse indicator', () => {
      const rawHtml = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: ocrNode,
          selected: false,
          status: 'RUNNING',
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-flow-node--running');
      expect(html).toContain('el-status-indicator--running');
      expect(html).toContain('el-status-indicator__dot--pulse');
    });

    it('WorkflowNodeShell reflects SUCCESS status cleanly without persistent border animation', () => {
      const rawHtml = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: ocrNode,
          selected: false,
          status: 'SUCCESS',
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-status-indicator--success');
      expect(html).not.toContain('el-flow-node--running');
    });

    it('WorkflowNodeShell reflects FAILED status cleanly', () => {
      const rawHtml = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: ocrNode,
          selected: false,
          status: 'FAILED',
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-status-indicator--error');
    });
  });

  describe('5. Execution Timeline Step Transitions', () => {
    const report: WorkflowExecutionReport = {
      id: 'rep_test',
      workflowId: financeWf.id,
      workflowName: financeWf.name,
      status: 'RUNNING',
      startTime: 1000,
      totalDurationMs: 320,
      cacheHitsCount: 0,
      totalMemoryPeakMb: 65,
      deviceContextSnapshot: {
        deviceModel: 'Pixel 8 Pro',
        androidVersion: 14,
        totalRamMb: 8192,
        availableRamMb: 3500,
        batteryPercentage: 90,
        isCharging: false,
        thermalStatus: 'NOMINAL',
        networkState: 'WIFI_HIGH_SPEED',
        hasNpu: true,
        hasGpu: true,
        cpuCores: 8,
        storageAvailableMb: 40000,
        powerSaverEnabled: false,
        allowCloudInference: true,
      },
      nodeRecords: {
        [financeWf.nodes[0].id]: {
          nodeId: financeWf.nodes[0].id,
          label: financeWf.nodes[0].label,
          status: 'SUCCESS',
          startTime: 1000,
          endTime: 1200,
          latencyMs: 200,
          ramConsumedMb: 20,
          executionLocation: 'LOCAL_CPU',
          cacheHit: false,
          selectedModelId: 'camera_hw',
          selectedModelName: 'Camera API',
          logLines: [],
          outputData: {},
        },
        [financeWf.nodes[1].id]: {
          nodeId: financeWf.nodes[1].id,
          label: financeWf.nodes[1].label,
          status: 'RUNNING',
          startTime: 1200,
          ramConsumedMb: 65,
          executionLocation: 'LOCAL_CPU',
          cacheHit: false,
          selectedModelId: 'tesseract-mobile-lite',
          selectedModelName: 'Tesseract OCR',
          logLines: [],
        },
      },
      finalOutputs: {},
    };

    it('renders timeline with completed, running, and pending step transitions', () => {
      const rawHtml = renderToString(
        React.createElement(ExecutionTimeline, {
          workflow: financeWf,
          report,
          activeNodeId: financeWf.nodes[1].id,
          selectedNodeId: financeWf.nodes[0].id,
          onSelectStep: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('el-exec-timeline__step--completed');
      expect(html).toContain('el-exec-timeline__step--running');
      expect(html).toContain('el-exec-timeline__step--selected');
      expect(html).toContain('el-exec-timeline__connector');
      expect(html).toContain('el-exec-timeline__connector--completed');
    });
  });

  describe('6. Workflow Generation Causality', () => {
    it('StudioPromptPanel renders prompt form and template chips', () => {
      const rawHtml = renderToString(
        React.createElement(StudioPromptPanel, {
          initialPrompt: 'Scan my receipt',
          onWorkflowGenerated: () => {},
          onClose: () => {},
        })
      );
      const html = cleanSsr(rawHtml);

      expect(html).toContain('Natural Language Automation Planner');
      expect(html).toContain('Scan my receipt');
      expect(html).toContain('Generate DAG');
      expect(html).toContain('Bill OCR');
      expect(html).toContain('Study Quiz');
      expect(html).toContain('Plant Doctor');
    });
  });
});
