import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Workflow, WorkflowNode, WorkflowEdge } from '../../../types/workflow';
import { WorkflowCanvasNode } from './WorkflowCanvasNode';

export interface WorkflowCanvasProps {
  workflow: Workflow;
  selectedNodeId?: string;
  onSelectNode: (nodeId: string | null) => void;
  onWorkflowChange: (workflow: Workflow) => void;
  hasErrors?: boolean;
}

const nodeTypes = {
  workflowNode: WorkflowCanvasNode,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  selectedNodeId,
  onSelectNode,
  onWorkflowChange,
  hasErrors = false,
}) => {
  // 1. Map existing WorkflowNode to React Flow Node
  const nodes: Node[] = useMemo(() => {
    return workflow.nodes.map((n, idx) => ({
      id: n.id,
      type: 'workflowNode',
      position: n.position || { x: 80 + (idx % 3) * 260, y: 80 + Math.floor(idx / 3) * 180 },
      data: {
        node: n,
        hasErrors: hasErrors,
      },
      selected: n.id === selectedNodeId,
    }));
  }, [workflow.nodes, selectedNodeId, hasErrors]);

  // 2. Map existing WorkflowEdge to React Flow Edge
  const edges: Edge[] = useMemo(() => {
    return workflow.edges.map((e) => ({
      id: e.id || `e_${e.sourceNodeId}_${e.targetNodeId}`,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: 'var(--color-border-strong)',
        strokeWidth: 2,
      },
    }));
  }, [workflow.edges]);

  // 3. Handle node position dragging & selection
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Find drag changes
      let updatedNodes = [...workflow.nodes];
      let hasPositionUpdates = false;

      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          hasPositionUpdates = true;
          updatedNodes = updatedNodes.map((n) =>
            n.id === change.id ? { ...n, position: change.position } : n
          );
        } else if (change.type === 'select') {
          if (change.selected) {
            onSelectNode(change.id);
          }
        }
      });

      if (hasPositionUpdates) {
        onWorkflowChange({
          ...workflow,
          nodes: updatedNodes,
          updatedAt: Date.now(),
        });
      }
    },
    [workflow, onWorkflowChange, onSelectNode]
  );

  // 4. Handle edge deletions
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removedEdgeIds = new Set(
        changes.filter((c) => c.type === 'remove').map((c) => c.id)
      );

      if (removedEdgeIds.size > 0) {
        const updatedEdges = workflow.edges.filter((e) => !removedEdgeIds.has(e.id));
        onWorkflowChange({
          ...workflow,
          edges: updatedEdges,
          updatedAt: Date.now(),
        });
      }
    },
    [workflow, onWorkflowChange]
  );

  // 5. Handle node connection via handles
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) return;

      const sourceId = connection.source;
      const targetId = connection.target;

      // Prevent duplicate edge
      const exists = workflow.edges.some(
        (e) => e.sourceNodeId === sourceId && e.targetNodeId === targetId
      );
      if (exists) return;

      const sourceNode = workflow.nodes.find((n) => n.id === sourceId);
      const newEdge: WorkflowEdge = {
        id: `e_${sourceId}_${targetId}_${Date.now()}`,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        dataType: sourceNode?.outputType || 'ANY',
      };

      const updatedNodes = workflow.nodes.map((n) => {
        if (n.id === targetId && !n.dependencies.includes(sourceId)) {
          return { ...n, dependencies: [...n.dependencies, sourceId] };
        }
        return n;
      });

      onWorkflowChange({
        ...workflow,
        nodes: updatedNodes,
        edges: [...workflow.edges, newEdge],
        updatedAt: Date.now(),
      });
    },
    [workflow, onWorkflowChange]
  );

  return (
    <div className="el-flow-canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onPaneClick={() => onSelectNode(null)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E1C17" gap={16} size={1} />
        <Controls showInteractive={false} className="el-flow-controls" />
      </ReactFlow>
    </div>
  );
};
