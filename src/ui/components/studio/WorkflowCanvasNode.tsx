import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { WorkflowNode, NodeStatus } from '../../../types/workflow';
import { WorkflowNodeShell } from './WorkflowNodeShell';

export interface WorkflowNodeData {
  node: WorkflowNode;
  isSource?: boolean;
  hasErrors?: boolean;
}

/**
 * Standard React Flow node wrapper that delegates entirely to the
 * unified, reusable WorkflowNodeShell component.
 */
export const WorkflowCanvasNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const node = nodeData.node;

  return (
    <WorkflowNodeShell
      node={node}
      selected={selected}
      hasErrors={nodeData.hasErrors}
      status={(node.config?.status as NodeStatus) || 'IDLE'}
      isSource={nodeData.isSource}
    />
  );
});

WorkflowCanvasNode.displayName = 'WorkflowCanvasNode';

