import React, { useState } from 'react';
import { Workflow, WorkflowNode, NodeType, NodeCapability, DataType, ExecutionPolicy } from '../../types/workflow';
import { DAGValidator } from '../../core/workflow/dag-validator';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { DEMO_WORKFLOWS } from '../../data/templates';

interface VisualBuilderScreenProps {
  initialWorkflow?: Workflow;
  onRunWorkflow: (wf: Workflow) => void;
  onSaveWorkflow?: (wf: Workflow) => void;
}

export const VisualBuilderScreen: React.FC<VisualBuilderScreenProps> = ({
  initialWorkflow,
  onRunWorkflow,
  onSaveWorkflow
}) => {
  const [workflow, setWorkflow] = useState<Workflow>(
    initialWorkflow || DEMO_WORKFLOWS[0]
  );
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(
    workflow.nodes[0] || null
  );

  // Validate current DAG
  const validation = DAGValidator.validate(workflow);

  // Add node helper
  const handleAddNode = (type: NodeType, capability: NodeCapability, label: string, inTypes: DataType[], outType: DataType) => {
    const newId = `node_${Date.now().toString(36)}`;
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    const newX = lastNode ? (lastNode.position?.x || 100) + 240 : 100;
    const newY = 180;

    const newNode: WorkflowNode = {
      id: newId,
      label,
      type,
      capability,
      inputTypes: inTypes,
      outputType: outType,
      dependencies: lastNode ? [lastNode.id] : [],
      config: {},
      executionPolicy: 'AUTO',
      position: { x: newX, y: newY }
    };

    const newEdges = [...workflow.edges];
    if (lastNode) {
      newEdges.push({
        id: `e_${lastNode.id}_${newId}`,
        sourceNodeId: lastNode.id,
        targetNodeId: newId,
        dataType: lastNode.outputType
      });
    }

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      edges: newEdges,
      updatedAt: Date.now()
    };

    setWorkflow(updatedWorkflow);
    setSelectedNode(newNode);
  };

  // Remove node helper
  const handleRemoveNode = (nodeId: string) => {
    if (workflow.nodes.length <= 1) return;

    const filteredNodes = workflow.nodes.filter((n) => n.id !== nodeId);
    const filteredEdges = workflow.edges.filter(
      (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
    );

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: filteredNodes,
      edges: filteredEdges,
      updatedAt: Date.now()
    };

    setWorkflow(updatedWorkflow);
    setSelectedNode(filteredNodes[0] || null);
  };

  // Update selected node property
  const handleUpdateNodePolicy = (policy: ExecutionPolicy) => {
    if (!selectedNode) return;
    const updatedNodes = workflow.nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, executionPolicy: policy } : n
    );
    const updatedWf = { ...workflow, nodes: updatedNodes };
    setWorkflow(updatedWf);
    setSelectedNode({ ...selectedNode, executionPolicy: policy });
  };

  // Connect nodes interactively via Output Port -> Input Port drag or click (Phase 13)
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const exists = workflow.edges.some((e) => e.sourceNodeId === sourceId && e.targetNodeId === targetId);
    if (exists) return;

    const srcNode = workflow.nodes.find((n) => n.id === sourceId);
    const tgtNode = workflow.nodes.find((n) => n.id === targetId);
    if (!srcNode || !tgtNode) return;

    const newEdge = {
      id: `e_${sourceId}_${targetId}_${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      dataType: srcNode.outputType || ('ANY' as DataType)
    };

    const updatedNodes = workflow.nodes.map((n) => {
      if (n.id === targetId && !n.dependencies.includes(sourceId)) {
        return { ...n, dependencies: [...n.dependencies, sourceId] };
      }
      return n;
    });

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: updatedNodes,
      edges: [...workflow.edges, newEdge],
      updatedAt: Date.now()
    };

    setWorkflow(updatedWorkflow);
  };

  return (
    <div>
      {/* Header & Controls */}
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Visual No-Code Workflow Builder</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Interactive DAG builder inspired by n8n and Apple Shortcuts. Connect triggers, AI nodes, data transforms, and Android device actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => setWorkflow(DEMO_WORKFLOWS[0])}
            title="Load Bill OCR Template"
          >
            Load Bill Template
          </button>
          <button
            className="btn-secondary"
            onClick={() => setWorkflow(DEMO_WORKFLOWS[1])}
            title="Load Lecture STT Template"
          >
            Load Lecture Template
          </button>
          <button
            className="btn-secondary"
            onClick={() => setWorkflow(DEMO_WORKFLOWS[2])}
            title="Load Plant Vision Template"
          >
            Load Plant Template
          </button>
          <button
            className="btn-primary"
            onClick={() => onRunWorkflow(workflow)}
            disabled={!validation.isValid}
          >
            ▶ Run Workflow
          </button>
        </div>
      </div>

      {/* DAG Validation Status Banner */}
      {!validation.isValid ? (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--status-error)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '13px',
            color: '#fca5a5'
          }}
        >
          <strong>⚠️ Invalid DAG Schema:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
            {validation.diagnostics.map((d, i) => (
              <li key={i}>{d.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--status-success)',
            borderRadius: '6px',
            padding: '8px 14px',
            marginBottom: '14px',
            fontSize: '12px',
            color: '#6ee7b7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>✓ Valid Directed Acyclic Graph (Topological Order: {validation.topologicalOrder.join(' → ')})</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{workflow.nodes.length} Nodes | {workflow.edges.length} Edges</span>
        </div>
      )}

      {/* Interactive Visual Canvas */}
      <DAGVisualizer
        workflow={workflow}
        selectedNodeId={selectedNode?.id}
        onSelectNode={setSelectedNode}
        onConnectNodes={handleConnectNodes}
      />

      {/* Palette & Node Inspector Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Component Palette */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px' }}>
            ADD NODE TO DAG PALETTE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span className="stat-label">Triggers</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('TRIGGER', 'CAMERA_CAPTURE', 'Camera Capture', [], 'IMAGE')}
                >
                  + Camera
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('TRIGGER', 'AUDIO_RECORD', 'Audio Record', [], 'AUDIO_STREAM')}
                >
                  + Audio Record
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('TRIGGER', 'MANUAL', 'Manual Launch', [], 'TEXT')}
                >
                  + Manual Trigger
                </button>
              </div>
            </div>

            <div>
              <span className="stat-label">AI Capabilities</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'OCR', 'OCR Scanner', ['IMAGE'], 'TEXT')}
                >
                  + OCR
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'SPEECH_TO_TEXT', 'Speech Recognition', ['AUDIO_STREAM'], 'TEXT')}
                >
                  + Speech-to-Text
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'SUMMARIZATION', 'Summarizer', ['TEXT'], 'TEXT')}
                >
                  + Summarization
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'CONCEPT_EXTRACTION', 'Concept Parser', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Concepts
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'QUESTION_GENERATION', '5-Question Quiz', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Quiz Generator
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('AI', 'PLANT_DISEASE_DIAGNOSIS', 'AgroVision Disease', ['IMAGE'], 'STRUCTURED_JSON')}
                >
                  + Plant Doctor
                </button>
              </div>
            </div>

            <div>
              <span className="stat-label">Transforms & Android Actions</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('TRANSFORM', 'CALCULATE_TOTAL', 'Sum Item Prices', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Calculate Total
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('ANDROID_ACTION', 'EXPENSE_TRACKER_STORE', 'Expense Ledger', ['STRUCTURED_JSON'], 'STRUCTURED_JSON')}
                >
                  + Save Expense DB
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('ANDROID_ACTION', 'NOTIFICATION_EMIT', 'Notification', ['ANY'], 'TEXT')}
                >
                  + Android Notification
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleAddNode('ANDROID_ACTION', 'SAVE_FILE', 'Save Document', ['TEXT'], 'TEXT')}
                >
                  + Save File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span className="node-type-indicator">{selectedNode.type} NODE</span>
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{selectedNode.label}</h3>
                </div>
                <button
                  className="btn-danger"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => handleRemoveNode(selectedNode.id)}
                >
                  Delete Node
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span className="stat-label">Capability</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                    {selectedNode.capability}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span className="stat-label">Input Types</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {selectedNode.inputTypes.length ? selectedNode.inputTypes.join(', ') : 'None (Source)'}
                    </div>
                  </div>
                  <div>
                    <span className="stat-label">Output Type</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {selectedNode.outputType}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="stat-label">Execution Policy</span>
                  <select
                    value={selectedNode.executionPolicy}
                    onChange={(e) => handleUpdateNodePolicy(e.target.value as ExecutionPolicy)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      marginTop: '4px'
                    }}
                  >
                    <option value="AUTO">AUTO (Resource & Device Aware)</option>
                    <option value="FORCE_LOCAL">FORCE_LOCAL (Strict Privacy)</option>
                    <option value="FORCE_CLOUD">FORCE_CLOUD (Maximum Accuracy)</option>
                    <option value="BATTERY_CONSERVE">BATTERY_CONSERVE (Low Power)</option>
                  </select>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-app)', padding: '8px', borderRadius: '4px' }}>
                  Dependencies: {selectedNode.dependencies.length ? selectedNode.dependencies.join(', ') : 'None'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              Select a node in the graph above to inspect properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
