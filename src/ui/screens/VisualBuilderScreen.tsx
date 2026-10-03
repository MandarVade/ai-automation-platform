import React, { useState } from 'react';
import {
  Workflow,
  WorkflowNode,
  NodeType,
  NodeCapability,
  DataType,
  ExecutionPolicy
} from '../../types/workflow';
import { DAGValidator } from '../../core/workflow/dag-validator';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { GitFork, Play, Plus, Trash2, CheckCircle2, AlertTriangle, Layers, Sliders } from 'lucide-react';

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
  const handleAddNode = (
    type: NodeType,
    capability: NodeCapability,
    label: string,
    inTypes: DataType[],
    outType: DataType
  ) => {
    const newId = `node_${Date.now().toString(36)}`;
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    const newX = lastNode ? (lastNode.position?.x || 100) + 260 : 100;
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

  // Connect nodes interactively via Output Port -> Input Port
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const exists = workflow.edges.some(
      (e) => e.sourceNodeId === sourceId && e.targetNodeId === targetId
    );
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
    <div className="space-y-6">
      {/* 1. Top Specification & Control Panel */}
      <section className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-black">
                WORKFLOW SPECIFICATION & DAG CANVAS
              </span>
              <Badge variant="cyber" className="text-[10px]">
                INTERACTIVE BUILDER
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase mt-1">
              {workflow.name}
            </h1>
            <p className="text-xs font-mono text-zinc-600 mt-0.5">
              Connect camera/sensor triggers, AI inference stages, arithmetic transforms, and Android SQLite actions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWorkflow(DEMO_WORKFLOWS[0]);
                setSelectedNode(DEMO_WORKFLOWS[0].nodes[0]);
              }}
              title="Load Bill OCR Template"
            >
              Bill Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWorkflow(DEMO_WORKFLOWS[1]);
                setSelectedNode(DEMO_WORKFLOWS[1].nodes[0]);
              }}
              title="Load Lecture STT Template"
            >
              Lecture Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWorkflow(DEMO_WORKFLOWS[2]);
                setSelectedNode(DEMO_WORKFLOWS[2].nodes[0]);
              }}
              title="Load Plant Vision Template"
            >
              Plant Template
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onRunWorkflow(workflow)}
              disabled={!validation.isValid}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Workflow</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. DAG Validation Status Banner */}
      {!validation.isValid ? (
        <div className="border-2 border-black bg-rose-200 p-3 shadow-[3px_3px_0px_#000] text-xs font-mono text-black font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
          <div>
            <span>INVALID DAG TOPOLOGY DETECTED:</span>
            <ul className="list-disc list-inside mt-1 font-normal">
              {validation.diagnostics.map((d, i) => (
                <li key={i}>{d.message}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="border-2 border-black bg-emerald-200 p-2.5 shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-black flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>VALID DIRECTED ACYCLIC GRAPH (Topological Order: {validation.topologicalOrder.join(' → ')})</span>
          </div>
          <span className="text-zinc-800 font-mono">
            {workflow.nodes.length} Nodes · {workflow.edges.length} Edges
          </span>
        </div>
      )}

      {/* 3. Three-Panel Flex Architecture: Node Palette (240px) | DAG Canvas (Flex) | Node Inspector (300px) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch min-w-0 min-h-[620px]">
        {/* Left: Component Palette (w-full lg:w-[240px] shrink-0) */}
        <div className="w-full lg:w-[240px] shrink-0 border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 flex flex-col min-w-0 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-black shrink-0">
            <span className="text-xs font-mono font-black uppercase text-black">
              ADD NODE TO DAG
            </span>
            <Badge variant="cyber" className="text-[10px]">
              PALETTE
            </Badge>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            {/* Triggers */}
            <div className="border border-black p-2.5 bg-zinc-50">
              <div className="text-[10px] font-mono font-bold text-zinc-600 uppercase mb-1.5">
                Triggers & Sensors:
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('TRIGGER', 'CAMERA_CAPTURE', 'Camera Capture', [], 'IMAGE')}
                >
                  + Camera Capture
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('TRIGGER', 'AUDIO_RECORD', 'Audio Record', [], 'AUDIO_STREAM')}
                >
                  + Audio Record
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('TRIGGER', 'MANUAL', 'Manual Trigger', [], 'TEXT')}
                >
                  + Manual Launch
                </Button>
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="border border-black p-2.5 bg-cyan-50">
              <div className="text-[10px] font-mono font-bold text-cyan-900 uppercase mb-1.5">
                AI Inference Capabilities:
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'OCR', 'OCR Scanner', ['IMAGE'], 'TEXT')}
                >
                  + OCR Scanner
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'SPEECH_TO_TEXT', 'Speech Recognition', ['AUDIO_STREAM'], 'TEXT')}
                >
                  + Speech-to-Text
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'SUMMARIZATION', 'Summarizer', ['TEXT'], 'TEXT')}
                >
                  + Summarization
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'CONCEPT_EXTRACTION', 'Concept Parser', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Concept Parser
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'QUESTION_GENERATION', 'Quiz Generator', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Quiz Generator
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('AI', 'EXPENSE_CATEGORIZATION', 'Expense Categorizer', ['STRUCTURED_JSON'], 'STRUCTURED_JSON')}
                >
                  + Categorizer
                </Button>
              </div>
            </div>

            {/* Transforms & Math */}
            <div className="border border-black p-2.5 bg-amber-50">
              <div className="text-[10px] font-mono font-bold text-amber-900 uppercase mb-1.5">
                Deterministic Transforms:
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('TRANSFORM', 'CALCULATE_TOTAL', 'Calculate Sums & Tax', ['TEXT'], 'STRUCTURED_JSON')}
                >
                  + Calculate Sums
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('TRANSFORM', 'STRUCTURED_JSON_MAP', 'JSON Mapper', ['STRUCTURED_JSON'], 'STRUCTURED_JSON')}
                >
                  + JSON Transform
                </Button>
              </div>
            </div>

            {/* Android Actions */}
            <div className="border border-black p-2.5 bg-emerald-50">
              <div className="text-[10px] font-mono font-bold text-emerald-900 uppercase mb-1.5">
                Android System Actions:
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('ANDROID_ACTION', 'EXPENSE_TRACKER_STORE', 'Expense Ledger DB', ['STRUCTURED_JSON'], 'ANY')}
                >
                  + Save Expense DB
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('ANDROID_ACTION', 'STUDY_NOTES_STORE', 'Study Notes DB', ['STRUCTURED_JSON'], 'ANY')}
                >
                  + Save Study Notes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs py-1"
                  onClick={() => handleAddNode('ANDROID_ACTION', 'CARE_PLAN_STORE', 'Care Plan Storage', ['STRUCTURED_JSON'], 'ANY')}
                >
                  + Save Care Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive DAG Canvas (flex-1 min-w-0 min-h-0) */}
        <div className="flex-1 min-w-0 min-h-0 border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-black mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-black">
                DAG EXECUTION CANVAS
              </span>
              <Badge variant="purple" className="text-[10px]">
                INTERACTIVE
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 font-bold hidden sm:inline">
              Click node to inspect · Drag to reposition
            </span>
          </div>

          <div className="flex-1 min-w-0 min-h-0 overflow-auto">
            <DAGVisualizer
              workflow={workflow}
              selectedNodeId={selectedNode?.id}
              onSelectNode={setSelectedNode}
              onConnectNodes={handleConnectNodes}
            />
          </div>
        </div>

        {/* Right: Selected Node Inspector (w-full lg:w-[300px] shrink-0) */}
        <div className="w-full lg:w-[300px] shrink-0 border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 flex flex-col min-w-0 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-black shrink-0">
            <span className="text-xs font-mono font-black uppercase text-black">
              NODE INSPECTOR & PROPERTIES
            </span>
            {selectedNode && (
              <Badge variant="default" className="text-[10px]">
                {selectedNode.type}
              </Badge>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[560px] pr-1">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                  Node Identifier
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedNode.id}
                  className="w-full p-2 bg-zinc-100 border border-black font-mono text-xs font-bold text-zinc-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                  Node Label
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => {
                    const updated = workflow.nodes.map((n) =>
                      n.id === selectedNode.id ? { ...n, label: e.target.value } : n
                    );
                    setWorkflow({ ...workflow, nodes: updated });
                    setSelectedNode({ ...selectedNode, label: e.target.value });
                  }}
                  className="w-full p-2 bg-white border-2 border-black font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                    Category
                  </label>
                  <div className="p-2 border border-black bg-zinc-50 font-bold truncate">
                    {selectedNode.type}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                    Capability
                  </label>
                  <div className="p-2 border border-black bg-zinc-50 font-bold truncate">
                    {selectedNode.capability}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                    Input Types
                  </label>
                  <div className="p-2 border border-black bg-zinc-50 text-[11px] truncate">
                    {selectedNode.inputTypes.length ? selectedNode.inputTypes.join(', ') : 'None (Root)'}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                    Output Type
                  </label>
                  <div className="p-2 border border-black bg-zinc-50 text-[11px] font-bold text-cyan-800 truncate">
                    {selectedNode.outputType}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                  Execution Routing Policy
                </label>
                <select
                  value={selectedNode.executionPolicy || 'AUTO'}
                  onChange={(e) => handleUpdateNodePolicy(e.target.value as ExecutionPolicy)}
                  className="w-full p-2 bg-white border-2 border-black font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <option value="AUTO">AUTO (Resource-Aware Dynamic Routing)</option>
                  <option value="LOCAL_ONLY">LOCAL_ONLY (Strict On-Device NPU/CPU)</option>
                  <option value="PREFER_LOCAL">PREFER_LOCAL (Try Local, Fallback Cloud)</option>
                  <option value="CLOUD_ONLY">CLOUD_ONLY (Always Cloud Offload)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full py-2 text-xs"
                  onClick={() => handleRemoveNode(selectedNode.id)}
                  disabled={workflow.nodes.length <= 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Node from DAG</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-zinc-500 text-center py-10">
              Click any node on the DAG canvas to inspect or edit its properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
