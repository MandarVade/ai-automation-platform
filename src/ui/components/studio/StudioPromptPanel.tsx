import React, { useState } from 'react';
import { NLWorkflowPlanner, NLIntentAnalysis } from '../../../core/workflow/nl-planner';
import { Workflow } from '../../../types/workflow';
import { Textarea, Button, StatusIndicator } from '../ui';
import { MessageSquare, ArrowRight, X, Layers } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../motion';

export interface StudioPromptPanelProps {
  initialPrompt?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onClose?: () => void;
}

export const StudioPromptPanel: React.FC<StudioPromptPanelProps> = ({
  initialPrompt = '',
  onWorkflowGenerated,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isPlanning, setIsPlanning] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<NLIntentAnalysis | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isPlanning) return;

    setIsPlanning(true);

    // Controlled micro-delay communicating generation state before settling
    setTimeout(() => {
      try {
        const analysis = NLWorkflowPlanner.planFromPrompt(prompt.trim());
        setLastAnalysis(analysis);
        onWorkflowGenerated(analysis.generatedWorkflow);
      } finally {
        setIsPlanning(false);
      }
    }, shouldReduceMotion ? 20 : 260);
  };

  return (
    <motion.div
      className="el-studio-prompt-panel"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.easeOut }}
    >
      <div className="el-studio-prompt-panel__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={14} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Natural Language Automation Planner
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            className="el-dialog__close-btn"
            onClick={onClose}
            aria-label="Close prompt panel"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <form onSubmit={handleGenerate} className="el-studio-prompt-panel__form">
        <Textarea
          placeholder="Describe your multi-step Android automation (e.g. Record lecture, transcribe via whisper, summarize concepts, generate quiz)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          disabled={isPlanning}
        />

        <div className="el-studio-prompt-panel__footer">
          <div className="el-studio-prompt-panel__templates">
            <button
              type="button"
              className="el-studio-prompt-panel__chip"
              onClick={() =>
                setPrompt(
                  'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.'
                )
              }
            >
              Bill OCR
            </button>
            <button
              type="button"
              className="el-studio-prompt-panel__chip"
              onClick={() =>
                setPrompt(
                  'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.'
                )
              }
            >
              Study Quiz
            </button>
            <button
              type="button"
              className="el-studio-prompt-panel__chip"
              onClick={() =>
                setPrompt(
                  'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.'
                )
              }
            >
              Plant Doctor
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isPlanning}
            rightIcon={<ArrowRight size={13} />}
          >
            {isPlanning ? 'Planning DAG...' : 'Generate DAG'}
          </Button>
        </div>
      </form>

      {lastAnalysis && (
        <div className="el-studio-prompt-panel__summary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-hover)' }}>
              DETECTED: {lastAnalysis.detectedDomain} DOMAIN
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Trigger: {lastAnalysis.extractedSlots.trigger}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Generated {lastAnalysis.generatedWorkflow.nodes.length} nodes and {lastAnalysis.generatedWorkflow.edges.length} edges
          </div>
        </div>
      )}
    </motion.div>
  );
};
