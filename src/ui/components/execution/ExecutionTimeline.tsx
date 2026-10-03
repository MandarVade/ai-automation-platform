import React from 'react';
import { Workflow, WorkflowNode } from '../../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../../types/execution';
import { getNodePresentation } from '../studio/node-presentation-registry';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, Zap, ArrowDown } from 'lucide-react';

export interface ExecutionTimelineProps {
  workflow: Workflow;
  report: WorkflowExecutionReport | null;
  activeNodeId?: string;
  selectedNodeId?: string;
  onSelectStep: (nodeId: string) => void;
  className?: string;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  workflow,
  report,
  activeNodeId,
  selectedNodeId,
  onSelectStep,
  className = '',
}) => {
  return (
    <div
      className={`el-exec-timeline ${className}`.trim()}
      role="list"
      aria-label="Workflow execution sequence"
    >
      <div className="el-exec-timeline__header">
        <h3 className="el-exec-timeline__title">Execution Timeline</h3>
        <span className="el-exec-timeline__count">{workflow.nodes.length} steps</span>
      </div>

      <div className="el-exec-timeline__list">
        {workflow.nodes.map((node, index) => {
          const rec: NodeExecutionRecord | undefined = report?.nodeRecords[node.id];
          const isSelected = selectedNodeId === node.id;
          const isActive = activeNodeId === node.id;

          // Derive step state
          let stepState: 'completed' | 'running' | 'failed' | 'fallback' | 'pending' = 'pending';
          if (rec) {
            if (rec.status === 'SUCCESS') stepState = 'completed';
            else if (rec.status === 'RUNNING') stepState = 'running';
            else if (rec.status === 'FAILED') stepState = 'failed';
            else if (rec.status === 'FALLBACK') stepState = 'fallback';
          } else if (isActive) {
            stepState = 'running';
          }

          const presentation = getNodePresentation(node.type, node.capability);
          const isLast = index === workflow.nodes.length - 1;

          // Latency string if available
          const latencyStr = rec?.latencyMs !== undefined ? `${rec.latencyMs}ms` : null;

          return (
            <div key={node.id} className="el-exec-timeline__step-wrapper">
              <div
                role="listitem"
                tabIndex={0}
                aria-selected={isSelected}
                aria-label={`Step ${index + 1}: ${node.label} (${stepState})`}
                onClick={() => onSelectStep(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStep(node.id);
                  }
                }}
                className={`el-exec-timeline__step el-exec-timeline__step--${stepState} ${
                  isSelected ? 'el-exec-timeline__step--selected' : ''
                }`}
              >
                {/* Status Indicator Icon */}
                <div className="el-exec-timeline__marker" aria-hidden="true">
                  {stepState === 'completed' ? (
                    <CheckCircle2 size={16} className="el-exec-timeline__icon--success" />
                  ) : stepState === 'running' ? (
                    <Zap size={16} className="el-exec-timeline__icon--running" />
                  ) : stepState === 'failed' ? (
                    <AlertCircle size={16} className="el-exec-timeline__icon--error" />
                  ) : stepState === 'fallback' ? (
                    <AlertTriangle size={16} className="el-exec-timeline__icon--warning" />
                  ) : (
                    <span className="el-exec-timeline__index">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="el-exec-timeline__info">
                  <div className="el-exec-timeline__row-top">
                    <span className="el-exec-timeline__step-title">{node.label}</span>
                    {latencyStr && (
                      <span className="el-exec-timeline__latency">{latencyStr}</span>
                    )}
                  </div>

                  <div className="el-exec-timeline__row-sub">
                    <span className="el-exec-timeline__dataflow">
                      {presentation.dataFlowDescription}
                    </span>
                    {rec?.cacheHit && (
                      <span className="el-exec-timeline__cache-badge">⚡ Cache Hit</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Connecting Line to next step */}
              {!isLast && (
                <div
                  className={`el-exec-timeline__connector ${
                    stepState === 'completed' ? 'el-exec-timeline__connector--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
