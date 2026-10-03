import React from 'react';
import { Workflow } from '../../types/workflow';
import { DAGVisualizer } from '../components/DAGVisualizer';

interface WorkflowDetailScreenProps {
  workflow: Workflow;
  onEdit: (wf: Workflow) => void;
  onRun: (wf: Workflow) => void;
  onBack: () => void;
}

export const WorkflowDetailScreen: React.FC<WorkflowDetailScreenProps> = ({
  workflow,
  onEdit,
  onRun,
  onBack
}) => {
  return (
    <div>
      <div className="section-header">
        <div>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '3px 8px', marginBottom: '6px' }}
            onClick={onBack}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`card-domain-badge ${workflow.domain}`}>{workflow.domain}</span>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{workflow.name}</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {workflow.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => onEdit(workflow)}>
            Edit in Canvas
          </button>
          <button className="btn-primary" onClick={() => onRun(workflow)}>
            ▶ Execute Automation
          </button>
        </div>
      </div>

      {/* DAG Graph */}
      <div style={{ marginBottom: '20px' }}>
        <DAGVisualizer workflow={workflow} />
      </div>

      {/* Detailed Node Pipeline List */}
      <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '14px' }}>
          STRUCTURED EXECUTION PIPELINE ({workflow.nodes.length} NODES)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workflow.nodes.map((node, i) => (
            <div
              key={node.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {i + 1}.
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Type: {node.type} | Capability: {node.capability}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="status-pill" style={{ fontSize: '11px' }}>
                  Policy: {node.executionPolicy}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {node.outputType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
