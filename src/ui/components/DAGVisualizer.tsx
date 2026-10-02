import React from 'react';
import { Workflow, WorkflowNode, NodeStatus } from '../../types/workflow';

interface DAGVisualizerProps {
  workflow: Workflow;
  nodeStatusMap?: Record<string, { status: NodeStatus; latencyMs?: number; modelName?: string }>;
  activeNodeId?: string;
  selectedNodeId?: string;
  onSelectNode?: (node: WorkflowNode) => void;
  onConnectNodes?: (sourceNodeId: string, targetNodeId: string) => void;
}

export const DAGVisualizer: React.FC<DAGVisualizerProps> = ({
  workflow,
  nodeStatusMap = {},
  activeNodeId,
  selectedNodeId,
  onSelectNode,
  onConnectNodes
}) => {
  const [connectingSourceId, setConnectingSourceId] = React.useState<string | null>(null);
  const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

  // Auto-layout coordinates if positions missing
  const computedNodes = workflow.nodes.map((node, index) => {
    const x = node.position?.x ?? 60 + index * 240;
    const y = node.position?.y ?? 180;
    return { ...node, x, y };
  });

  const nodePosMap = new Map(computedNodes.map((n) => [n.id, { x: n.x, y: n.y }]));

  // Calculate bounding box
  const maxX = Math.max(...computedNodes.map((n) => n.x), 900) + 240;
  const maxY = Math.max(...computedNodes.map((n) => n.y), 340) + 120;

  return (
    <div className="dag-canvas-container">
      <svg
        className="dag-svg-overlay"
        viewBox={`0 0 ${maxX} ${maxY}`}
        style={{ width: `${maxX}px`, height: `${maxY}px` }}
      >
        <defs>
          <marker
            id="dag-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
          </marker>
          <marker
            id="dag-arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {workflow.edges.map((edge) => {
          const srcPos = nodePosMap.get(edge.sourceNodeId);
          const tgtPos = nodePosMap.get(edge.targetNodeId);

          if (!srcPos || !tgtPos) return null;

          const startX = srcPos.x + 190;
          const startY = srcPos.y + 40;
          const endX = tgtPos.x;
          const endY = tgtPos.y + 40;

          const dx = endX - startX;
          const midX1 = startX + dx * 0.5;
          const midX2 = startX + dx * 0.5;

          const pathD = `M ${startX} ${startY} C ${midX1} ${startY}, ${midX2} ${endY}, ${endX} ${endY}`;
          const isEdgeActive = activeNodeId === edge.targetNodeId;

          return (
            <g key={edge.id}>
              <path
                d={pathD}
                fill="none"
                stroke={isEdgeActive ? '#3b82f6' : '#334155'}
                strokeWidth={isEdgeActive ? '2.5' : '1.5'}
                strokeDasharray={isEdgeActive ? '5 5' : 'none'}
                markerEnd={isEdgeActive ? 'url(#dag-arrow-active)' : 'url(#dag-arrow)'}
              />
              {/* Edge Data Type Label */}
              <text
                x={(startX + endX) / 2}
                y={(startY + endY) / 2 - 6}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
                style={{ background: '#0b0e14' }}
              >
                {edge.dataType}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Render Node Elements */}
      <div style={{ position: 'relative', width: `${maxX}px`, height: `${maxY}px` }}>
        {computedNodes.map((node) => {
          const statusInfo = nodeStatusMap[node.id];
          const status = statusInfo?.status || 'IDLE';
          const isSelected = selectedNodeId === node.id;
          const isActive = activeNodeId === node.id;

          const typeColor =
            node.type === 'TRIGGER'
              ? '#38bdf8'
              : node.type === 'AI'
              ? '#2dd4bf'
              : node.type === 'TRANSFORM'
              ? '#fbbf24'
              : '#a78bfa';

          return (
            <div
              key={node.id}
              className={`dag-node-element status-${status} ${isSelected ? 'selected' : ''} ${
                isActive ? 'status-RUNNING' : ''
              }`}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onClick={() => onSelectNode && onSelectNode(node)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="node-type-indicator" style={{ color: typeColor }}>
                  {node.type}
                </span>
                {status !== 'IDLE' && (
                  <span
                    className="status-pill"
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      color:
                        status === 'SUCCESS'
                          ? 'var(--status-success)'
                          : status === 'RUNNING'
                          ? 'var(--accent-blue)'
                          : status === 'FALLBACK'
                          ? 'var(--status-fallback)'
                          : status === 'FAILED'
                          ? 'var(--status-error)'
                          : 'var(--text-muted)'
                    }}
                  >
                    {status}
                  </span>
                )}
              </div>

              <div className="node-label-text" title={node.label}>
                {node.label}
              </div>

              <div className="node-sub-text">
                {statusInfo?.modelName ? (
                  <span style={{ color: 'var(--accent-cyan)' }}>{statusInfo.modelName}</span>
                ) : (
                  <span>{node.capability}</span>
                )}
                {statusInfo?.latencyMs !== undefined && (
                  <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>
                    ({statusInfo.latencyMs}ms)
                  </span>
                )}
              </div>

              {/* Input Port (Left) */}
              {node.type !== 'TRIGGER' && (
                <div
                  className="dag-port-input"
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '32px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #0f172a',
                    cursor: 'pointer',
                    zIndex: 25
                  }}
                  title="Connect Here (Input Port) — Drop or click to connect"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'link';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const srcId = e.dataTransfer.getData('sourceNodeId') || connectingSourceId;
                    if (srcId && srcId !== node.id) {
                      onConnectNodes?.(srcId, node.id);
                      setConnectingSourceId(null);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingSourceId && connectingSourceId !== node.id) {
                      onConnectNodes?.(connectingSourceId, node.id);
                      setConnectingSourceId(null);
                    }
                  }}
                />
              )}

              {/* Output Port (Right) */}
              <div
                className="dag-port-output"
                style={{
                  position: 'absolute',
                  right: '-7px',
                  top: '32px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: connectingSourceId === node.id ? '#f59e0b' : '#3b82f6',
                  border: '2px solid #0f172a',
                  cursor: 'crosshair',
                  zIndex: 25
                }}
                draggable={true}
                title="Output Port — Drag or click to connect to an Input Port"
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('sourceNodeId', node.id);
                  setConnectingSourceId(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(connectingSourceId === node.id ? null : node.id);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
