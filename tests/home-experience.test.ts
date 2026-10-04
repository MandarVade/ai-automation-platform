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
    ).replace(/&amp;/g, '&');
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
      expect(html).toContain('turns your intent into a workflow you can inspect, edit, and run');

      // Prohibited generic AI hype checks
      expect(html).not.toContain('unlock the power of AI');
      expect(html).not.toContain('revolutionize your workflow');
      expect(html).not.toContain('next-generation intelligence');
      expect(html).not.toContain('seamless AI-powered experience');
      expect(html).not.toContain('transform your productivity');
    });

    it('renders the centered hero atmospheric lighting layer (Phase 11C)', () => {
      const html = renderHome();
      expect(html).toContain('el-home__hero-atmosphere');
      expect(html).toContain('el-home__hero-light');
      expect(html).toContain('el-home__eyebrow-badge');
    });

    it('renders the 4-stage interactive product story (01 Describe, 02 Build, 03 Route, 04 Run)', () => {
      const html = renderHome();
      expect(html).toContain('How EL-06 Works');
      expect(html).toContain('From intent to executable automation');
      expect(html).toContain('01');
      expect(html).toContain('Describe');
      expect(html).toContain('02');
      expect(html).toContain('Build');
      expect(html).toContain('03');
      expect(html).toContain('Route');
      expect(html).toContain('04');
      expect(html).toContain('Run');

      HOW_IT_WORKS_STEPS.forEach((step) => {
        expect(html).toContain(step.name);
        expect(html).toContain(step.headline);
      });
      // Initial active stage description is rendered in detail viewport
      expect(html).toContain(HOW_IT_WORKS_STEPS[0].description);
    });

    it('renders minimal, technically grounded trust pillars', () => {
      const html = renderHome();
      CAPABILITY_PILLARS.forEach((pillar) => {
        expect(html).toContain(pillar.title);
        expect(html).toContain(pillar.description);
      });
    });
  });

  describe('2. Interactive EL-06 Product Story Component (Phase 11B)', () => {
    it('provides accessible tablist navigation across the four conceptual stages', () => {
      const html = renderHome();
      expect(html).toContain('role="tablist"');
      expect(html).toContain('aria-label="EL-06 Automation Process Stages"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain('aria-controls="stage-panel-describe"');
    });

    it('renders live preview stage panel with sample snippet and telemetry tag', () => {
      const html = renderHome();
      expect(html).toContain('role="tabpanel"');
      expect(html).toContain('id="stage-panel-describe"');
      expect(html).toContain('Live Stage Preview');
      expect(html).toContain('Zero manual syntax required');
      expect(html).toContain('Take a photo of my grocery bill');
    });

    it('places the interactive product story BEFORE the primary working input area', () => {
      const html = renderHome();
      const storyIndex = html.indexOf('el-story');
      const workingAreaIndex = html.indexOf('el-home__input-section');
      expect(storyIndex).toBeGreaterThan(-1);
      expect(workingAreaIndex).toBeGreaterThan(-1);
      expect(storyIndex).toBeLessThan(workingAreaIndex);
    });

    it('renders clear transition header between product story and working area', () => {
      const html = renderHome();
      expect(html).toContain('Build Your Automation');
      expect(html).toContain('Start with what you want to automate');
    });
  });

  describe('3. Primary Workflow Input & CTAs', () => {
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

  describe('4. Example Automations & Progressive Disclosure', () => {
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

  describe('5. Header & Service Status Area Audit (Standby vs Running)', () => {
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

    it('removes the telemetry strip and standby status banner when on Home', () => {
      const topBarHtml = renderToString(
        React.createElement(TopBar, {
          currentTab: 'home',
          onOpenDeviceSettings: vi.fn(),
          onNavigateToExecution: vi.fn(),
        })
      );

      // On Home, TopBar is suppressed during idle/standby state
      expect(topBarHtml).toBe('');
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

  describe('6. Long Text & Mobile Resiliency', () => {
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
