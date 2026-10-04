import React, { useState, useRef } from 'react';
import { Workflow } from '../../types/workflow';
import { DeviceContext } from '../../types/device';
import { Button, Card, CardHeader, CardTitle, CardDescription, Textarea, Badge } from '../components/ui';
import {
  ArrowRight,
  Shield,
  Cpu,
  Eye,
  Workflow as WorkflowIcon,
  MessageSquareText,
  Layers,
  Play,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../motion/motion-tokens';
import { InteractiveWorkflowStory, STORY_STAGES, StoryStage } from '../components/home/InteractiveWorkflowStory';

export interface HomeScreenProps {
  device: DeviceContext;
  onSelectWorkflow: (wf: Workflow) => void;
  onRunWorkflow: (wf: Workflow) => void;
  onStartNLPlan: (prompt: string) => void;
  onOpenVisualBuilder: () => void;
}

export interface ExampleAutomation {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
}

export const EXAMPLE_AUTOMATIONS: ExampleAutomation[] = [
  {
    id: 'receipt',
    title: 'Bill & Expense Extraction',
    category: 'Finance',
    description: 'Take a photo of a bill, extract items and calculate the total.',
    prompt: 'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
  },
  {
    id: 'study',
    title: 'Lecture Transcription & Study Quiz',
    category: 'Education',
    description: 'Record a lecture, transcribe it, and generate 5 review questions.',
    prompt: 'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.',
  },
  {
    id: 'botany',
    title: 'Plant Disease Diagnosis & Care',
    category: 'Vision',
    description: 'Photograph a plant, identify symptoms, and create a botanical care plan.',
    prompt: 'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.',
  },
];

// Preserved for backwards compatibility with tests and domain specs
export const HOW_IT_WORKS_STEPS = STORY_STAGES;

export const CAPABILITY_PILLARS = [
  {
    icon: Cpu,
    title: 'Edge-Native Execution',
    description: 'Executes locally via Gemini Nano and NNAPI hardware delegates with zero network roundtrips.',
  },
  {
    icon: Shield,
    title: 'Resource-Aware Governance',
    description: 'Hardware telemetry monitors thermals and battery levels to safeguard device responsiveness.',
  },
  {
    icon: Eye,
    title: 'Inspectable Workflows',
    description: 'Every node transition, data dependency, and model routing decision is fully verifiable before execution.',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  device: _device,
  onSelectWorkflow: _onSelectWorkflow,
  onRunWorkflow: _onRunWorkflow,
  onStartNLPlan,
  onOpenVisualBuilder,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const itemVariants = {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : MOTION_DURATIONS.standard,
        ease: MOTION_EASINGS.easeOut,
      },
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please describe an automation task before submitting.');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }
    setError(null);
    setIsSubmitting(true);
    onStartNLPlan(prompt.trim());
  };

  const handleSelectExample = (ex: ExampleAutomation) => {
    setPrompt(ex.prompt);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <motion.div
      className="el-home"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* 1. Hero Section */}
      <motion.section className="el-home__hero" variants={itemVariants}>
        <div className="el-home__context-badge">
          <Badge variant="accent" size="sm">
            EL-06 • Autonomous Edge Orchestrator
          </Badge>
        </div>

        <h1 className="el-home__headline">
          Build an automation
          <br className="el-home__headline-br" />
          that actually runs.
        </h1>

        <p className="el-home__subheadline">
          Tell EL-06 what you want to automate. It turns your intent into a workflow you can inspect,
          edit, and run directly on your device.
        </p>
      </motion.section>

      {/* 2. Interactive EL-06 Product Story & Visualization */}
      <motion.section className="el-home__story-section" variants={itemVariants}>
        <InteractiveWorkflowStory />
      </motion.section>

      {/* 3. Primary Working Area (Transition heading + Prompt Input Card) */}
      <motion.section className="el-home__working-section el-home__input-section" variants={itemVariants}>
        <div className="el-home__section-label">
          <span className="el-home__section-eyebrow">Build Your Automation</span>
          <h2 className="el-home__working-title">Start with what you want to automate</h2>
        </div>

        <form onSubmit={handleSubmit} className="el-home__form">
          <div
            className={`el-home__input-box ${isFocused ? 'el-home__input-box--focused' : ''}`}
          >
            {/* Subtle burnt-orange focus accent line */}
            <div className="el-home__input-indicator" aria-hidden="true" />

            <Textarea
              id="nl-automation-prompt"
              ref={textareaRef}
              label="Describe what you want to automate"
              placeholder="e.g., Take a photo of my grocery bill, extract line items via OCR, calculate subtotal with tax, and store structured record..."
              value={prompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={3}
              error={error || undefined}
              disabled={isSubmitting}
            />

            <div className="el-home__input-actions">
              <div className="el-home__input-hint">
                <span>Press Enter to plan • Shift+Enter for new line</span>
              </div>

              <div className="el-home__btn-group">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenVisualBuilder}
                  title="Open blank visual DAG canvas in Studio"
                  className="el-home__btn-canvas"
                >
                  <WorkflowIcon size={14} />
                  <span>Open Blank Canvas</span>
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={15} />}
                  className="el-home__btn-submit"
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.section>

      {/* 4. Example Automations */}
      <motion.section className="el-home__examples-section" variants={itemVariants}>
        <div className="el-home__section-label">
          <span>Example Automations</span>
          <span className="el-home__section-sublabel">Select a template to populate the creation prompt</span>
        </div>

        <div className="el-home__examples-grid">
          {EXAMPLE_AUTOMATIONS.map((ex) => {
            const isSelected = prompt === ex.prompt;
            return (
              <Card
                key={ex.id}
                interactive
                className={`el-home__example-card ${isSelected ? 'el-card--selected' : ''}`}
                onClick={() => handleSelectExample(ex)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectExample(ex);
                  }
                }}
              >
                <CardHeader>
                  <div className="el-home__example-category">
                    <Badge variant="neutral" size="sm">
                      {ex.category}
                    </Badge>
                  </div>
                  <CardTitle className="el-home__example-title">{ex.title}</CardTitle>
                  <CardDescription className="el-home__example-desc">
                    {ex.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </motion.section>

      {/* 5. Minimal Supporting Proof / Trust Architecture */}
      <motion.section className="el-home__trust-section" variants={itemVariants}>
        <div className="el-home__trust-grid">
          {CAPABILITY_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="el-home__trust-item">
                <Icon size={16} className="el-home__trust-icon" />
                <div className="el-home__trust-body">
                  <div className="el-home__trust-title">{item.title}</div>
                  <div className="el-home__trust-desc">{item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
};
