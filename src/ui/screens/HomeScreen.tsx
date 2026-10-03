import React, { useState } from 'react';
import { Workflow } from '../../types/workflow';
import { DeviceContext } from '../../types/device';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { Button, Card, CardHeader, CardTitle, CardDescription, Textarea, Badge } from '../components/ui';
import { ArrowRight, Sparkles, Shield, Cpu, Eye, Workflow as WorkflowIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeScreenProps {
  device: DeviceContext;
  onSelectWorkflow: (wf: Workflow) => void;
  onRunWorkflow: (wf: Workflow) => void;
  onStartNLPlan: (prompt: string) => void;
  onOpenVisualBuilder: () => void;
}

interface ExamplePrompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
  nodeCount: number;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'receipt',
    title: 'Bill & Expense Extraction',
    category: 'Finance',
    prompt: 'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
    nodeCount: 3,
  },
  {
    id: 'study',
    title: 'Lecture Transcription & Study Quiz',
    category: 'Education',
    prompt: 'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.',
    nodeCount: 4,
  },
  {
    id: 'botany',
    title: 'Plant Disease Diagnosis & Care',
    category: 'Vision',
    prompt: 'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.',
    nodeCount: 3,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  device,
  onSelectWorkflow,
  onRunWorkflow,
  onStartNLPlan,
  onOpenVisualBuilder,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please describe an automation task before submitting.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    onStartNLPlan(prompt.trim());
  };

  const handleSelectExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setError(null);
  };

  return (
    <div className="el-home">
      {/* 1. Hero Section */}
      <motion.section
        className="el-home__hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="el-home__context-badge">
          <Badge variant="accent" size="sm">
            EL-06 • Autonomous Edge Orchestrator
          </Badge>
        </div>

        <h1 className="el-home__headline">
          Build an automation
          <br />
          that actually runs.
        </h1>

        <p className="el-home__subheadline">
          Describe your task in plain language. The platform resolves the directed acyclic graph,
          selects optimal on-device or cloud models, and executes deterministically.
        </p>
      </motion.section>

      {/* 2. Natural-Language Creation Input Card */}
      <motion.section
        className="el-home__input-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
      >
        <form onSubmit={handleSubmit} className="el-home__form">
          <div className="el-home__input-box">
            <Textarea
              id="nl-automation-prompt"
              label="Describe what you want to automate"
              placeholder="e.g., Take a photo of my grocery bill, extract line items via OCR, calculate subtotal with tax, and store structured record..."
              value={prompt}
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
                <span>Press Enter to plan or tap Create Workflow</span>
              </div>

              <div className="el-home__btn-group">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenVisualBuilder}
                  title="Open blank visual DAG canvas in Studio"
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
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.section>

      {/* 3. Actionable Examples */}
      <motion.section
        className="el-home__examples-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
      >
        <div className="el-home__section-label">
          <span>Example Automations</span>
          <span className="el-home__section-sublabel">Select a template to populate the creation prompt</span>
        </div>

        <div className="el-home__examples-grid">
          {EXAMPLE_PROMPTS.map((ex) => (
            <Card
              key={ex.id}
              interactive
              className={`el-home__example-card ${prompt === ex.prompt ? 'el-card--selected' : ''}`}
              onClick={() => handleSelectExample(ex.prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectExample(ex.prompt);
                }
              }}
            >
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant="neutral" size="sm">
                    {ex.category}
                  </Badge>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {ex.nodeCount} nodes
                  </span>
                </div>
                <CardTitle style={{ marginTop: '6px' }}>{ex.title}</CardTitle>
                <CardDescription style={{ fontSize: '12px', marginTop: '4px' }}>
                  {ex.prompt}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 4. Pre-built Verified Pipelines (Existing Workflows) */}
      <motion.section
        className="el-home__verified-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: 'easeOut' }}
      >
        <div className="el-home__section-label">
          <span>Built-in Production Pipelines</span>
          <span className="el-home__section-sublabel">Pre-validated DAGs ready for immediate execution</span>
        </div>

        <div className="el-home__verified-grid">
          {DEMO_WORKFLOWS.map((wf) => (
            <Card key={wf.id} className="el-home__verified-card">
              <div className="el-home__verified-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge variant="accent" size="sm">{wf.domain}</Badge>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    v{wf.version}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  {wf.nodes.length} steps
                </span>
              </div>

              <div style={{ margin: '8px 0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {wf.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  {wf.description}
                </p>
              </div>

              <div className="el-home__pipeline-chain">
                {wf.nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <span className="el-home__chain-chip">{node.label}</span>
                    {i < wf.nodes.length - 1 && (
                      <span className="el-home__chain-arrow">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="el-home__verified-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectWorkflow(wf)}
                >
                  Inspect DAG
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRunWorkflow(wf)}
                >
                  Execute
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 5. Supporting Capability / Trust Architecture */}
      <motion.section
        className="el-home__trust-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.28, ease: 'easeOut' }}
      >
        <div className="el-home__trust-grid">
          <div className="el-home__trust-item">
            <Cpu size={16} className="el-home__trust-icon" />
            <div>
              <div className="el-home__trust-title">Edge-Native Inference</div>
              <div className="el-home__trust-desc">
                Executes locally via Gemini Nano and NNAPI NPU delegates with zero network roundtrip.
              </div>
            </div>
          </div>

          <div className="el-home__trust-item">
            <Shield size={16} className="el-home__trust-icon" />
            <div>
              <div className="el-home__trust-title">Thermal & Battery Safeguards</div>
              <div className="el-home__trust-desc">
                Continuous hardware governor downgrades complex operations before thermal throttling occurs.
              </div>
            </div>
          </div>

          <div className="el-home__trust-item">
            <Eye size={16} className="el-home__trust-icon" />
            <div>
              <div className="el-home__trust-title">Transparent Explainability</div>
              <div className="el-home__trust-desc">
                Every node transition is inspectable with multi-factor model selection score matrices.
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
