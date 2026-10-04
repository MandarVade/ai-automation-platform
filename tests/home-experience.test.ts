import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HomeScreen, EXAMPLE_AUTOMATIONS, HOW_IT_WORKS_STEPS, CAPABILITY_PILLARS } from '../src/ui/screens/HomeScreen';
import { TopBar } from '../src/ui/components/TopBar';
import { DeviceContextManager } from '../src/core/resources/device-context';
import { NotificationActionController } from '../src/core/notification/notification-controller';
import { DEMO_WORKFLOWS } from '../src/data/templates';

describe('Phase 11 — Home Page Refinement & Mobile Hardening', () => {
  const mockDevice = DeviceContextManager.getInstance().getContext();

  const renderHome = (props = {}) => {
    return renderToString(
      React.createElement(HomeScreen, {
        device: mockDevice,
        onSelectWorkflow: vi.fn(),
        onRunWorkflow: vi.fn(),
        onStartNLPlan: vi.fn(),
        onOpenVisualBuilder: vi.fn(),
        ...props,
      })
    );
  };

  describe('1. Information Architecture & Copywriting', () => {
    it('renders the strong, concise hero headline and context badge', () => {
      const html = renderHome();
      expect(html).toContain('Build an automation');
      expect(html).toContain('that actually runs.');
      expect(html).toContain('EL-06 • Autonomous Edge Orchestrator');
    });

    it('answers product purpose with credible, non-marketing explanation', () => {
      const html = renderHome();
      expect(html).toContain('Tell EL-06 what you want to automate');
      expect(html).toContain('executable on-device workflow you can inspect, edit, and run');

      // Prohibited generic AI hype checks
      expect(html).not.toContain('unlock the power of AI');
      expect(html).not.toContain('revolutionize your workflow');
      expect(html).not.toContain('next-generation intelligence');
      expect(html).not.toContain('seamless AI-powered experience');
      expect(html).not.toContain('transform your productivity');
    });

    it('renders the 3-step "How It Works" section (01 Describe, 02 Build, 03 Run)', () => {
      const html = renderHome();
      expect(html).toContain('How It Works');
      expect(html).toContain('01');
      expect(html).toContain('Describe');
      expect(html).toContain('02');
      expect(html).toContain('Build');
      expect(html).toContain('03');
      expect(html).toContain('Run');

      HOW_IT_WORKS_STEPS.forEach((step) => {
        expect(html).toContain(step.title);
        expect(html).toContain(step.subtitle);
      });
    });

    it('renders minimal, technically grounded trust pillars', () => {
      const html = renderHome();
      CAPABILITY_PILLARS.forEach((pillar) => {
        expect(html).toContain(pillar.title);
        expect(html).toContain(pillar.description);
      });
    });
  });

  describe('2. Primary Workflow Input & CTAs', () => {
    it('renders accessible textarea with proper id and label', () => {
      const html = renderHome();
      expect(html).toContain('id="nl-automation-prompt"');
      expect(html).toContain('Describe what you want to automate');
    });

    it('renders primary Create Workflow CTA and secondary Blank Canvas trigger', () => {
      const html = renderHome();
      expect(html).toContain('Create Workflow');
      expect(html).toContain('Open Blank Canvas');
      expect(html).toContain('el-home__btn-submit');
      expect(html).toContain('el-home__btn-canvas');
    });

    it('includes tactile focus accent indicator element in the input card', () => {
      const html = renderHome();
      expect(html).toContain('el-home__input-indicator');
    });
  });

  describe('3. Example Automations & Progressive Disclosure', () => {
    it('renders the 3 simplified example cards with categories', () => {
      const html = renderHome().replace(/&amp;/g, '&');
      expect(EXAMPLE_AUTOMATIONS).toHaveLength(3);

      EXAMPLE_AUTOMATIONS.forEach((ex) => {
        expect(html).toContain(ex.category);
        expect(html).toContain(ex.title);
        expect(html).toContain(ex.description);
      });
    });

    it('ensures example cards are keyboard-accessible with role="button" and tabIndex', () => {
      const html = renderHome();
      expect(html).toContain('role="button"');
      expect(html).toContain('tabindex="0"');
    });

    it('does NOT overwhelm the user with raw RAM/node counts in example headers', () => {
      const html = renderHome();
      expect(html).not.toContain('3 nodes');
      expect(html).not.toContain('4 nodes');
    });
  });

  describe('4. Header & Service Status Area Audit (Standby vs Running)', () => {
    it('subordinates standby notification banner and omits redundant action button when idle', () => {
      const topBarHtml = renderToString(
        React.createElement(TopBar, {
          onOpenDeviceSettings: vi.fn(),
          onNavigateToExecution: vi.fn(),
        })
      );

      // Verify standby class is applied
      expect(topBarHtml).toContain('notification-banner standby');
      expect(topBarHtml).toContain('STANDBY');

      // Standby should NOT render the loud 'View Live Graph' button
      expect(topBarHtml).not.toContain('View Live Graph');
    });

    it('renders View Live Graph and running progress bar when an automation is active', () => {
      // Mock active notification state
      const controller = NotificationActionController.getInstance();
      controller.setActiveWorkflow(DEMO_WORKFLOWS[0]);

      const topBarHtml = renderToString(
        React.createElement(TopBar, {
          onOpenDeviceSettings: vi.fn(),
          onNavigateToExecution: vi.fn(),
        })
      );

      expect(topBarHtml).toContain('notification-banner');
      expect(topBarHtml).toContain('View Live Graph');

      // Reset controller back to standby
      (controller as any).state = {
        isActive: true,
        title: 'EL-06 Automation Service',
        subtitle: 'Ready. Single-tap to run automation.',
        progressPercent: 0,
        statusText: 'STANDBY',
        canCancel: false,
        canRun: true,
      };
      (controller as any).notify();
    });
  });

  describe('5. Long Text & Mobile Resiliency', () => {
    it('handles long user prompts cleanly within the textarea structure', () => {
      const longPrompt = 'A'.repeat(500) + ' ' + 'B'.repeat(500);
      const html = renderHome();
      // The textarea has box-sizing and wrapping structure
      expect(html).toContain('el-textarea');
      expect(html).toContain('el-input-wrapper');
      expect(html).toContain('el-input-container');
    });

    it('maintains clear responsive CTA hierarchy for mobile devices', () => {
      const html = renderHome();
      expect(html).toContain('el-home__btn-submit');
      expect(html).toContain('el-home__btn-canvas');
      expect(html).toContain('el-home__input-actions');
    });
  });
});
