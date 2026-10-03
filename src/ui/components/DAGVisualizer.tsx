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

  // Auto-layout coordinates if positions missing
  const computedNodes = workflow.nodes.map((node, index) => {
    const x = node.position?.x ?? 50 + index * 260;
    const y = node.position?.y ?? 180;
    return { ...node, x, y };
  });

  const nodePosMap = new Map(computedNodes.map((n) => [n.id, { x: n.x, y: n.y }]));

  // Calculate bounding box
  const maxX = Math.max(...computedNodes.map((n) => n.x), 960) + 260;
  const maxY = Math.max(...computedNodes.map((n) => n.y), 360) + 140;

  return (
    <div className="dag-canvas-container relative">
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#00F0FF" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {workflow.edges.map((edge) => {
          const srcPos = nodePosMap.get(edge.sourceNodeId);
          const tgtPos = nodePosMap.get(edge.targetNodeId);

          if (!srcPos || !tgtPos) return null;

          const startX = srcPos.x + 210;
          const startY = srcPos.y + 45;
          const endX = tgtPos.x;
          const endY = tgtPos.y + 45;

          const dx = endX - startX;
          const midX1 = startX + dx * 0.5;
          const midX2 = startX + dx * 0.5;

          const pathD = `M ${startX} ${startY} C ${midX1} ${startY}, ${midX2} ${endY}, ${endX} ${endY}`;
          const isEdgeActive = activeNodeId === edge.targetNodeId;

          return (
            <g key={edge.id}>
              {/* Drop Shadow Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#000000"
                strokeWidth={isEdgeActive ? '3.5' : '2'}
                strokeDasharray={isEdgeActive ? '6 4' : 'none'}
                markerEnd={isEdgeActive ? 'url(#dag-arrow-active)' : 'url(#dag-arrow)'}
              />
              {/* Edge Data Type Tag */}
              <g transform={`translate(${(startX + endX) / 2}, ${(startY + endY) / 2 - 12})`}>
                <rect
                  x="-32"
                  y="-10"
                  width="64"
                  height="16"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="2"
                  fill="#000000"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {edge.dataType}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Render Node Elements */}
      <div style={{ position: 'relative', width: `${maxX}px`, height: `${maxY}px` }}>
        {computedNodes.map((node, index) => {
          const statusInfo = nodeStatusMap[node.id];
          const status = statusInfo?.status || 'IDLE';
          const isSelected = selectedNodeId === node.id;
          const isActive = activeNodeId === node.id;

          const categoryColor =
            node.type === 'TRIGGER'
              ? 'bg-amber-300 text-black'
              : node.type === 'AI'
              ? 'bg-cyan-300 text-black'
              : node.type === 'TRANSFORM'
              ? 'bg-purple-300 text-black'
              : 'bg-emerald-300 text-black';

          return (
            <div
              key={node.id}
              className={`dag-node-element status-${status} ${isSelected ? 'selected' : ''} ${
                isActive ? 'status-RUNNING' : ''
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '210px',
                border: '2px solid #000000',
                boxShadow: isSelected
                  ? '5px 5px 0px #FACC15'
                  : '4px 4px 0px #000000',
                backgroundColor: '#FFFFFF',
                borderRadius: '0px'
              }}
              onClick={() => onSelectNode && onSelectNode(node)}
            >
              {/* Stage & Category Banner */}
              <div className="flex items-center justify-between pb-1.5 border-b border-black mb-1.5">
                <span className={`px-1.5 py-0.2 text-[9px] font-mono font-black uppercase border border-black ${categoryColor}`}>
                  STAGE 0{index + 1} // {node.type}
                </span>

                {status !== 'IDLE' && (
                  <span className="px-1 py-0.2 text-[8px] font-mono font-black uppercase border border-black bg-zinc-100">
                    {status}
                  </span>
                )}
              </div>

              {/* Node Label */}
              <div className="font-mono font-black text-xs uppercase truncate text-black" title={node.label}>
                {node.label}
              </div>

              {/* Model / Runtime Metadata */}
              <div className="text-[10px] font-mono text-zinc-600 truncate mt-1">
                {statusInfo?.modelName ? (
                  <span className="text-cyan-800 font-bold">{statusInfo.modelName}</span>
                ) : (
                  <span>{node.capability}</span>
                )}
                {statusInfo?.latencyMs !== undefined && (
                  <span className="ml-1 font-bold text-zinc-800">({statusInfo.latencyMs}ms)</span>
                )}
              </div>

              {/* Input Port (Left) */}
              {node.type !== 'TRIGGER' && (
                <div
                  className="dag-port-input"
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '38px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '0px',
                    background: '#10b981',
                    border: '2px solid #000000',
                    boxShadow: '1px 1px 0px #000000',
                    cursor: 'pointer',
                    zIndex: 25
                  }}
                  title="Connect Here (Input Port) — Click or drop to connect"
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
                  right: '-8px',
                  top: '38px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '0px',
                  background: connectingSourceId === node.id ? '#facc15' : '#00f0ff',
                  border: '2px solid #000000',
                  boxShadow: '1px 1px 0px #000000',
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
