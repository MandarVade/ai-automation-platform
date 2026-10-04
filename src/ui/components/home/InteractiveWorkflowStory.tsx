import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  MessageSquareText,
  Layers,
  Cpu,
  Play,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Workflow as WorkflowIcon,
  LucideIcon,
} from 'lucide-react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../motion/motion-tokens';

export type StageId = 'describe' | 'build' | 'route' | 'run';

export interface StoryStage {
  id: StageId;
  step: string;
  name: string;
  headline: string;
  description: string;
  icon: LucideIcon;
  sampleTitle: string;
  sampleContent: string;
  telemetryTag: string;
}

export const STORY_STAGES: StoryStage[] = [
  {
    id: 'describe',
    step: '01',
    name: 'Describe',
    headline: 'Natural-language intent',
    description: 'Describe what you want to automate in plain words.',
    icon: MessageSquareText,
    sampleTitle: 'User Prompt',
    sampleContent: '"Take a photo of my grocery bill, extract line items via OCR, and calculate total with tax..."',
    telemetryTag: 'Zero manual syntax required',
  },
  {
    id: 'build',
    step: '02',
    name: 'Build',
    headline: 'Verified dependency graph',
    description: 'Intent becomes a validated DAG with strict input and output type contracts.',
    icon: Layers,
    sampleTitle: 'Generated DAG Sequence',
    sampleContent: 'Camera Capture → PaddleOCR Document Text → Calculate Total → Expense Categorizer',
    telemetryTag: 'Topological sort • Zero cycles',
  },
  {
    id: 'route',
    step: '03',
    name: 'Route',
    headline: 'Model & resource selection',
    description: 'Multi-factor governor selects optimal local NPU/GPU delegates or fallback routes.',
    icon: Cpu,
    sampleTitle: 'Hardware Allocation',
    sampleContent: 'Gemini Nano (NPU Delegate) • 185 MB RAM allocated • Battery 82% • Thermals Nominal',
    telemetryTag: 'Hardware-governed • Local-first',
  },
  {
    id: 'run',
    step: '04',
    name: 'Run',
    headline: 'Android execution',
    description: 'Inspect the DAG, customize parameters, and execute deterministically on Android.',
    icon: Play,
    sampleTitle: 'Runtime Execution Report',
    sampleContent: 'All 4 nodes completed in 420ms • 0 bytes sent to external cloud • Recorded to SQLite ledger',
    telemetryTag: 'Edge native • Verifiable ledger',
  },
];

export interface InteractiveWorkflowStoryProps {
  className?: string;
  onSelectStage?: (stageId: StageId) => void;
}

export const InteractiveWorkflowStory: React.FC<InteractiveWorkflowStoryProps> = ({
  className = '',
  onSelectStage,
}) => {
  const [activeStageId, setActiveStageId] = useState<StageId>('describe');
  const shouldReduceMotion = useReducedMotion();

  const activeStage = STORY_STAGES.find((s) => s.id === activeStageId) || STORY_STAGES[0];

  const handleStageSelect = (stageId: StageId) => {
    setActiveStageId(stageId);
    if (onSelectStage) {
      onSelectStage(stageId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % STORY_STAGES.length;
      handleStageSelect(STORY_STAGES[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + STORY_STAGES.length) % STORY_STAGES.length;
      handleStageSelect(STORY_STAGES[prevIndex].id);
    }
  };

  return (
    <div className={`el-story ${className}`.trim()} aria-label="Interactive EL-06 Workflow Story">
      {/* Story Header */}
      <div className="el-story__header">
        <div className="el-story__eyebrow">
          <WorkflowIcon size={13} className="el-story__eyebrow-icon" />
          <span>How EL-06 Works</span>
        </div>
        <h2 className="el-story__title">From intent to executable automation</h2>
        <p className="el-story__subtitle">
          See how a single natural-language task is compiled, resource-routed, and executed on Android.
        </p>
      </div>

      {/* Interactive Stages Pipeline */}
      <div
        className="el-story__pipeline"
        role="tablist"
        aria-label="EL-06 Automation Process Stages"
      >
        {STORY_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = stage.id === activeStageId;

          return (
            <React.Fragment key={stage.id}>
              <div
                role="tab"
                tabIndex={0}
                aria-selected={isSelected}
                aria-controls={`stage-panel-${stage.id}`}
                id={`stage-tab-${stage.id}`}
                className={`el-story__stage-card ${
                  isSelected ? 'el-story__stage-card--active' : ''
                }`}
                onClick={() => handleStageSelect(stage.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStageSelect(stage.id);
                  } else {
                    handleKeyDown(e, idx);
                  }
                }}
              >
                {/* Active indicator bar */}
                <div className="el-story__stage-indicator" aria-hidden="true" />

                <div className="el-story__stage-top">
                  <span className="el-story__stage-step">{stage.step}</span>
                  <Icon size={15} className="el-story__stage-icon" />
                </div>

                <div className="el-story__stage-meta">
                  <span className="el-story__stage-name">{stage.name}</span>
                  <span className="el-story__stage-headline">{stage.headline}</span>
                </div>
              </div>

              {/* Connecting arrow for desktop & tablet */}
              {idx < STORY_STAGES.length - 1 && (
                <div className="el-story__connector el-story__connector--desktop" aria-hidden="true">
                  <ArrowRight size={13} className="el-story__connector-arrow" />
                </div>
              )}

              {/* Connecting arrow for mobile vertical flow */}
              {idx < STORY_STAGES.length - 1 && (
                <div className="el-story__connector el-story__connector--mobile" aria-hidden="true">
                  <ArrowDown size={13} className="el-story__connector-arrow" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Stage Detail & Transformation Viewport */}
      <motion.div
        id={`stage-panel-${activeStage.id}`}
        role="tabpanel"
        aria-labelledby={`stage-tab-${activeStage.id}`}
        key={activeStage.id}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.05 : MOTION_DURATIONS.standard,
          ease: MOTION_EASINGS.easeOut,
        }}
        className="el-story__detail-card"
      >
        <div className="el-story__detail-header">
          <div className="el-story__detail-badge">
            <span className="el-story__detail-step">{activeStage.step}</span>
            <span className="el-story__detail-name">{activeStage.name}</span>
          </div>
          <span className="el-story__detail-tag">{activeStage.telemetryTag}</span>
        </div>

        <p className="el-story__detail-desc">{activeStage.description}</p>

        {/* Live System Preview Output */}
        <div className="el-story__preview-box">
          <div className="el-story__preview-label">
            <WorkflowIcon size={12} className="el-story__preview-icon" />
            <span>Live Stage Preview: {activeStage.sampleTitle}</span>
          </div>
          <div className="el-story__preview-content">
            <code>{activeStage.sampleContent}</code>
          </div>
        </div>

        <div className="el-story__detail-footer">
          <div className="el-story__status-pill">
            <CheckCircle2 size={12} className="el-story__status-icon" />
            <span>Platform State: Verified & Deterministic</span>
          </div>
          <span className="el-story__hint">Tap any stage above to inspect its execution contract</span>
        </div>
      </motion.div>
    </div>
  );
};
