import React, { useState } from 'react';
import { Workflow } from '../../types/workflow';
import { DeviceContext } from '../../types/device';
import { DEMO_WORKFLOWS } from '../../data/templates';

interface HomeScreenProps {
  device: DeviceContext;
  onSelectWorkflow: (wf: Workflow) => void;
  onRunWorkflow: (wf: Workflow) => void;
  onStartNLPlan: (prompt: string) => void;
  onOpenVisualBuilder: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  device,
  onSelectWorkflow,
  onRunWorkflow,
  onStartNLPlan,
  onOpenVisualBuilder
}) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStartNLPlan(prompt.trim());
    }
  };

  const samplePrompts = [
    'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
    'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.',
    'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.'
  ];

  return (
    <div>
      {/* Hero Intent Creation Box */}
      <section className="hero-box">
        <h2>What do you want to automate?</h2>
        <p>Describe your multi-step AI automation in plain English. The platform determines models, routing, and device orchestration.</p>

        <form onSubmit={handleGenerate}>
          <div className="nl-input-wrapper">
            <input
              type="text"
              className="nl-input"
              placeholder="e.g., Take a photo of my bill, extract total and add to expense tracker..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" className="btn-generate">
              <span>✦</span> Plan Workflow
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PS EXAMPLES:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}
              onClick={() => onStartNLPlan(p)}
            >
              {idx === 0 ? '🧾 Bill & Expense' : idx === 1 ? '🎓 Lecture Notes & Quiz' : '🌿 Plant Care'}
            </button>
          ))}
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--accent-cyan)' }}
            onClick={onOpenVisualBuilder}
          >
            + Open Blank Visual Canvas
          </button>
        </div>
      </section>

      {/* Device AI Readiness Card */}
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              DEVICE AI EXECUTION RUNTIME
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {device.deviceModel}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Android {device.androidVersion} | {device.cpuCores} Cores | {device.hasNpu ? 'NNAPI NPU Delegate Active' : 'CPU Delegate'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="stat-item">
              <span className="stat-label">RAM Headroom</span>
              <span className="stat-value" style={{ color: device.availableRamMb < 1500 ? 'var(--status-warning)' : 'var(--accent-cyan)' }}>
                {device.availableRamMb} MB
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Battery Level</span>
              <span className="stat-value">{device.batteryPercentage}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cloud Routing</span>
              <span className="stat-value" style={{ color: device.allowCloudInference ? 'var(--status-success)' : 'var(--text-muted)' }}>
                {device.allowCloudInference ? 'PERMITTED' : 'OFFLINE ONLY'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Problem Statement Workflows */}
      <section>
        <div className="section-header">
          <div className="section-title">
            <span>Verified AI Automation Pipelines</span>
            <span className="badge-count">{DEMO_WORKFLOWS.length} Built-in</span>
          </div>
        </div>

        <div className="card-grid">
          {DEMO_WORKFLOWS.map((wf) => (
            <div key={wf.id} className="workflow-card">
              <div>
                <div className="card-top">
                  <span className={`card-domain-badge ${wf.domain}`}>{wf.domain}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    v{wf.version}
                  </span>
                </div>

                <div className="card-name">{wf.name}</div>
                <div className="card-desc">{wf.description}</div>
              </div>

              <div>
                <div className="card-pipeline-preview">
                  {wf.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="node-chip">{node.label}</span>
                      {i < wf.nodes.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>

                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => onSelectWorkflow(wf)}>
                    Inspect DAG
                  </button>
                  <button className="btn-primary" onClick={() => onRunWorkflow(wf)}>
                    ▶ Execute Pipeline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
