import React, { useState, useEffect } from 'react';
import { NLWorkflowPlanner, NLIntentAnalysis } from '../../core/workflow/nl-planner';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { Workflow } from '../../types/workflow';

interface CreateScreenProps {
  initialPrompt?: string;
  onRunWorkflow: (wf: Workflow) => void;
  onEditInVisualBuilder: (wf: Workflow) => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  initialPrompt = 'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
  onRunWorkflow,
  onEditInVisualBuilder
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [analysis, setAnalysis] = useState<NLIntentAnalysis | null>(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const plan = NLWorkflowPlanner.planFromPrompt(initialPrompt);
      setAnalysis(plan);
    }
  }, [initialPrompt]);

  const handlePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const plan = NLWorkflowPlanner.planFromPrompt(prompt.trim());
      setAnalysis(plan);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Natural Language Workflow Planner</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            User defines WHAT in natural language. Platform autonomously decides HOW (capabilities, models, routing).
          </p>
        </div>
      </div>

      {/* Input box */}
      <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <form onSubmit={handlePlan}>
          <div className="nl-input-wrapper">
            <input
              type="text"
              className="nl-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Record lecture, transcribe, extract concepts, summarize and create 5 quiz questions..."
            />
            <button type="submit" className="btn-generate">
              <span>✦</span> Analyze & Plan
            </button>
          </div>
        </form>
      </div>

      {/* Analysis & Generated Plan */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Analysis Breakdown Box */}
          <div
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                INTENT RECOGNITION & SLOT EXTRACTION
              </span>
              <span className={`card-domain-badge ${analysis.detectedDomain}`}>
                {analysis.detectedDomain} DOMAIN
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--bg-surface-1)', padding: '8px 12px', borderRadius: '4px' }}>
                <span className="stat-label">Detected Trigger</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {analysis.extractedSlots.trigger}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-1)', padding: '8px 12px', borderRadius: '4px' }}>
                <span className="stat-label">AI Capabilities Required</span>
                <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                  {analysis.extractedSlots.aiCapabilities.join(', ')}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-1)', padding: '8px 12px', borderRadius: '4px' }}>
                <span className="stat-label">Transforms & Math</span>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {analysis.extractedSlots.transforms.length ? analysis.extractedSlots.transforms.join(', ') : 'None'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-1)', padding: '8px 12px', borderRadius: '4px' }}>
                <span className="stat-label">Android Actions</span>
                <div style={{ fontSize: '12px', color: 'var(--status-success)' }}>
                  {analysis.extractedSlots.actions.join(', ')}
                </div>
              </div>
            </div>

            {/* Step-by-Step Reasoner Output */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {analysis.analysisSteps.map((step, idx) => (
                <div key={idx} style={{ color: step.startsWith('✓') ? '#6ee7b7' : '#cbd5e1' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Generated DAG Canvas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
                Synthesized Workflow: {analysis.generatedWorkflow.name}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setShowJson(!showJson)}>
                  {showJson ? 'Hide Schema' : '{ } View JSON Schema'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => onEditInVisualBuilder(analysis.generatedWorkflow)}
                >
                  Edit in Visual Builder
                </button>
                <button
                  className="btn-primary"
                  onClick={() => onRunWorkflow(analysis.generatedWorkflow)}
                >
                  ▶ Run Workflow Now
                </button>
              </div>
            </div>

            <DAGVisualizer workflow={analysis.generatedWorkflow} />

            {/* JSON Schema Viewer */}
            {showJson && (
              <div style={{ marginTop: '14px' }}>
                <div className="stat-label" style={{ marginBottom: '4px' }}>STRUCTURED WORKFLOW JSON SPECIFICATION</div>
                <pre className="code-view">
                  {JSON.stringify(analysis.generatedWorkflow, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
