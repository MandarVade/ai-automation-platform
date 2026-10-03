import React, { useMemo } from 'react';
import { Workflow, WorkflowNode } from '../../../types/workflow';
import { getNodePresentation } from '../studio/node-presentation-registry';
import { ArrowRight } from 'lucide-react';

export interface WorkflowPreviewProps {
  workflow: Workflow;
  className?: string;
  maxNodes?: number;
}

/**
 * Lightweight, non-editable workflow preview visualizer.
 * Derives the execution pipeline from workflow DAG nodes and edges,
 * reusing the exact Phase 5 visual tokens and icons.
 */
export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  workflow,
  className = '',
  maxNodes = 5,
}) => {
  // Sort or sequence nodes according to DAG dependencies if possible
  const orderedNodes = useMemo<WorkflowNode[]>(() => {
    if (!workflow.nodes || workflow.nodes.length === 0) return [];

    // Topological order or sequential fallback
    const visited = new Set<string>();
    const result: WorkflowNode[] = [];

    // Start with root nodes (dependencies.length === 0)
    const roots = workflow.nodes.filter((n) => !n.dependencies || n.dependencies.length === 0);
    const queue = roots.length > 0 ? [...roots] : [workflow.nodes[0]];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current.id)) {
        visited.add(current.id);
        result.push(current);

        // Find targets connected from this node
        const outgoingEdges = workflow.edges.filter((e) => e.sourceNodeId === current.id);
        for (const edge of outgoingEdges) {
          const nextNode = workflow.nodes.find((n) => n.id === edge.targetNodeId);
          if (nextNode && !visited.has(nextNode.id) && !queue.some((q) => q.id === nextNode.id)) {
            queue.push(nextNode);
          }
        }
      }
    }

    // Append any isolated or unvisited nodes to ensure complete representation
    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        result.push(node);
      }
    }

    return result;
  }, [workflow.nodes, workflow.edges]);

  if (orderedNodes.length === 0) {
    return (
      <div className={`el-workflow-preview el-workflow-preview--empty ${className}`.trim()}>
        <span>Empty pipeline</span>
      </div>
    );
  }

  const visibleNodes = orderedNodes.slice(0, maxNodes);
  const remainingCount = orderedNodes.length - maxNodes;

  const pipelineSummary = orderedNodes.map((n) => n.label).join(' to ');

  return (
    <div
      className={`el-workflow-preview ${className}`.trim()}
      role="region"
      aria-label={`Automation pipeline preview: ${pipelineSummary}`}
    >
      <div className="el-workflow-preview__track">
        {visibleNodes.map((node, index) => {
          const presentation = getNodePresentation(node.type, node.capability);
          const isLastVisible = index === visibleNodes.length - 1;

          return (
            <React.Fragment key={node.id}>
              {/* Mini Node Shell */}
              <div
                className="el-workflow-preview__node"
                title={`${node.label} (${node.capability}): ${presentation.dataFlowDescription}`}
              >
                <span className="el-workflow-preview__node-icon" aria-hidden="true">
                  {presentation.icon}
                </span>
                <span className="el-workflow-preview__node-label">{node.label}</span>
              </div>

              {/* Connector Arrow */}
              {(!isLastVisible || remainingCount > 0) && (
                <div className="el-workflow-preview__connector" aria-hidden="true">
                  <ArrowRight size={11} />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Overflow badge if workflow has many nodes */}
        {remainingCount > 0 && (
          <div className="el-workflow-preview__overflow-badge" title={`${remainingCount} more steps in DAG`}>
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};
