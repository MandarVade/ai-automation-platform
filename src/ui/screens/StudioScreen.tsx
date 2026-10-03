import React, { useState, useCallback, useEffect } from 'react';
import { Workflow, WorkflowNode, ExecutionPolicy } from '../../types/workflow';
import { DAGValidator } from '../../core/workflow/dag-validator';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { WorkflowCanvas } from '../components/studio/WorkflowCanvas';
import { StudioToolbar } from '../components/studio/StudioToolbar';
import { NodeInspector } from '../components/studio/NodeInspector';
import { AddNodeDialog, NodeTemplate } from '../components/studio/AddNodeDialog';
import { StudioPromptPanel } from '../components/studio/StudioPromptPanel';
import { Sheet, Button } from '../components/ui';
import { AlertTriangle } from 'lucide-react';

export interface StudioScreenProps {
  initialPrompt?: string;
  initialWorkflow?: Workflow;
  onRunWorkflow: (wf: Workflow) => void;
  activeSubView?: 'create' | 'builder';
}

export const StudioScreen: React.FC<StudioScreenProps> = ({
  initialPrompt,
  initialWorkflow,
  onRunWorkflow,
  activeSubView = 'builder',
}) => {
  // 1. Authoritative Workflow state
  const [workflow, setWorkflow] = useState<Workflow>(
    initialWorkflow || DEMO_WORKFLOWS[0]
  );

  useEffect(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow);
      setSelectedNodeId(initialWorkflow.nodes[0]?.id || null);
    }
  }, [initialWorkflow]);

  // 2. Editor UI State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    workflow.nodes[0]?.id || null
  );
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [showPromptPanel, setShowPromptPanel] = useState<boolean>(
    Boolean(initialPrompt) || activeSubView === 'create'
  );
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  // 3. Lightweight Editor Undo/Redo History
  const [history, setHistory] = useState<Workflow[]>([workflow]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (newWf: Workflow) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, newWf];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevWf = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setWorkflow(prevWf);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextWf = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setWorkflow(nextWf);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && workflow.nodes.length > 1) {
          handleDeleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNodeId, workflow]);

  // 4. Authoritative DAG Validation
  const validation = DAGValidator.validate(workflow);

  // 5. Selected Node
  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) || null;

  // 6. Workflow Mutations (Propagating to history & state)
  const handleWorkflowChange = (newWorkflow: Workflow) => {
    setWorkflow(newWorkflow);
    pushHistory(newWorkflow);
  };

  const handleUpdatePolicy = (policy: ExecutionPolicy) => {
    if (!selectedNodeId) return;
    const updatedNodes = workflow.nodes.map((n) =>
      n.id === selectedNodeId ? { ...n, executionPolicy: policy } : n
    );
    const updatedWorkflow = { ...workflow, nodes: updatedNodes, updatedAt: Date.now() };
    handleWorkflowChange(updatedWorkflow);
  };

  const handleUpdateModel = (modelId: string | undefined) => {
    if (!selectedNodeId) return;
    const updatedNodes = workflow.nodes.map((n) =>
      n.id === selectedNodeId ? { ...n, assignedModelId: modelId } : n
    );
    const updatedWorkflow = { ...workflow, nodes: updatedNodes, updatedAt: Date.now() };
    handleWorkflowChange(updatedWorkflow);
  };

  const handleUpdateLabel = (label: string) => {
    if (!selectedNodeId) return;
    const updatedNodes = workflow.nodes.map((n) =>
      n.id === selectedNodeId ? { ...n, label } : n
    );
    const updatedWorkflow = { ...workflow, nodes: updatedNodes, updatedAt: Date.now() };
    handleWorkflowChange(updatedWorkflow);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (workflow.nodes.length <= 1) return;

    const filteredNodes = workflow.nodes.filter((n) => n.id !== nodeId);
    const filteredEdges = workflow.edges.filter(
      (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
    );

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: filteredNodes,
      edges: filteredEdges,
      updatedAt: Date.now(),
    };

    handleWorkflowChange(updatedWorkflow);
    setSelectedNodeId(filteredNodes[0]?.id || null);
    setMobileInspectorOpen(false);
  };

  const handleDuplicateNode = (node: WorkflowNode) => {
    const newId = `node_${Date.now().toString(36)}`;
    const duplicateNode: WorkflowNode = {
      ...node,
      id: newId,
      label: `${node.label} (Copy)`,
      position: {
        x: (node.position?.x || 100) + 40,
        y: (node.position?.y || 100) + 40,
      },
    };

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: [...workflow.nodes, duplicateNode],
      updatedAt: Date.now(),
    };

    handleWorkflowChange(updatedWorkflow);
    setSelectedNodeId(newId);
  };

  const handleAddNodeFromTemplate = (template: NodeTemplate) => {
    const newId = `node_${Date.now().toString(36)}`;
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    const newX = lastNode ? (lastNode.position?.x || 100) + 240 : 100;
    const newY = lastNode ? lastNode.position?.y || 120 : 120;

    const newNode: WorkflowNode = {
      id: newId,
      label: template.label,
      type: template.type,
      capability: template.capability,
      inputTypes: template.inputTypes,
      outputType: template.outputType,
      dependencies: lastNode ? [lastNode.id] : [],
      config: {},
      executionPolicy: 'AUTO',
      position: { x: newX, y: newY },
    };

    const newEdges = [...workflow.edges];
    if (lastNode && template.inputTypes.length > 0) {
      newEdges.push({
        id: `e_${lastNode.id}_${newId}`,
        sourceNodeId: lastNode.id,
        targetNodeId: newId,
        dataType: lastNode.outputType,
      });
    }

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      edges: newEdges,
      updatedAt: Date.now(),
    };

    handleWorkflowChange(updatedWorkflow);
    setSelectedNodeId(newId);
  };

  const handleWorkflowGenerated = (generatedWorkflow: Workflow) => {
    handleWorkflowChange(generatedWorkflow);
    setSelectedNodeId(generatedWorkflow.nodes[0]?.id || null);
    setShowPromptPanel(false);
  };

  return (
    <div className="el-studio-layout">
      {/* Studio Toolbar */}
      <StudioToolbar
        workflowName={workflow.name}
        validation={validation}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenAddNode={() => setIsAddNodeOpen(true)}
        onTogglePrompt={() => setShowPromptPanel((prev) => !prev)}
        onToggleMobileInspector={() => setMobileInspectorOpen(true)}
        onRunWorkflow={() => onRunWorkflow(workflow)}
        selectedNodeCount={selectedNode ? 1 : 0}
      />

      {/* Validation Issue Banner if Invalid */}
      {!validation.isValid && (
        <div className="el-studio-validation-banner">
          <AlertTriangle size={15} style={{ color: 'var(--color-error)' }} />
          <span>Invalid DAG: {validation.diagnostics[0]?.message}</span>
        </div>
      )}

      {/* Natural Language Prompt Panel Overlay */}
      {showPromptPanel && (
        <div className="el-studio-prompt-overlay">
          <StudioPromptPanel
            initialPrompt={initialPrompt}
            onWorkflowGenerated={handleWorkflowGenerated}
            onClose={() => setShowPromptPanel(false)}
          />
        </div>
      )}

      {/* Main Workspace Area: Canvas + Inspector */}
      <div className="el-studio-workspace">
        <div className="el-studio-canvas-container">
          <WorkflowCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId || undefined}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              if (id) {
                // On mobile we don't automatically open the sheet unless requested
              }
            }}
            onWorkflowChange={handleWorkflowChange}
            hasErrors={!validation.isValid}
          />
        </div>

        {/* Desktop Node Inspector Panel */}
        <aside className="el-studio-desktop-inspector">
          <NodeInspector
            node={selectedNode}
            onUpdatePolicy={handleUpdatePolicy}
            onUpdateLabel={handleUpdateLabel}
            onUpdateModel={handleUpdateModel}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
          />
        </aside>
      </div>

      {/* Mobile Node Inspector Drawer Sheet */}
      <Sheet
        open={mobileInspectorOpen}
        onClose={() => setMobileInspectorOpen(false)}
        title="Node Configuration"
        side="bottom"
      >
        <NodeInspector
          node={selectedNode}
          onUpdatePolicy={handleUpdatePolicy}
          onUpdateLabel={handleUpdateLabel}
          onUpdateModel={handleUpdateModel}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onClose={() => setMobileInspectorOpen(false)}
        />
      </Sheet>

      {/* Add Node Dialog */}
      <AddNodeDialog
        open={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddNodeFromTemplate}
      />
    </div>
  );
};
