import React from 'react';
import { Workflow } from '../../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../../types/execution';
import { StatusIndicator, Button } from '../ui';
import { CheckCircle2, AlertCircle, Play, RotateCcw, ArrowLeft, Clock, Zap } from 'lucide-react';

export interface ExecutionResultCardProps {
  workflow: Workflow;
  report: WorkflowExecutionReport | null;
  activeNodeId?: string;
  onBack: () => void;
  onReExecute: () => void;
  onViewFinalOutput?: () => void;
}

/**
 * Result-First execution outcome card answering:
 * 1. What happened?
 * 2. Did it succeed?
 * 3. What did the workflow produce?
 */
export const ExecutionResultCard: React.FC<ExecutionResultCardProps> = ({
  workflow,
  report,
  activeNodeId,
  onBack,
  onReExecute,
  onViewFinalOutput,
}) => {
  const status = report?.status || 'RUNNING';
  const totalSteps = workflow.nodes.length;

  const completedSteps = report
    ? Object.values(report.nodeRecords).filter(
        (r) => r.status === 'SUCCESS' || r.status === 'FALLBACK'
      ).length
    : 0;

  // Active or failed node record
  const activeNode = workflow.nodes.find((n) => n.id === activeNodeId);
  const failedRecord = report
    ? Object.values(report.nodeRecords).find((r) => r.status === 'FAILED')
    : null;
  const failedNode = failedRecord
    ? workflow.nodes.find((n) => n.id === failedRecord.nodeId)
    : null;

  // Determine concise, human-readable outcome headline & summary
  const getOutcomeDetails = () => {
    switch (status) {
      case 'COMPLETED': {
        let narrative = `All ${totalSteps} pipeline steps finished successfully.`;
        if (workflow.domain === 'FINANCE') {
          narrative = 'Receipt image analyzed, items extracted, sum verified, and recorded into expense ledger.';
        } else if (workflow.domain === 'EDUCATION') {
          narrative = 'Lecture recording transcribed, core concepts highlighted, and assessment quiz generated.';
        } else if (workflow.domain === 'HEALTHCARE') {
          narrative = 'Plant pathology analyzed, symptoms diagnosed, and botanical care plan saved.';
        } else if (workflow.domain === 'PRODUCTIVITY') {
          narrative = 'Meeting audio transcribed, key action items extracted, and notification emitted.';
        }

        return {
          headline: `${workflow.name} Finished`,
          narrative,
          badgeStatus: 'success' as const,
          badgeLabel: 'Success',
          icon: <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />,
        };
      }
      case 'FAILED': {
        const stepName = failedNode ? failedNode.label : 'a pipeline step';
        const errMessage = failedRecord?.error || 'Step execution encountered an error.';
        return {
          headline: 'Workflow Execution Incomplete',
          narrative: `Halted at ${stepName}: ${errMessage}`,
          badgeStatus: 'error' as const,
          badgeLabel: 'Failed',
          icon: <AlertCircle size={24} style={{ color: 'var(--color-error)' }} />,
        };
      }
      case 'CANCELLED': {
        return {
          headline: 'Execution Cancelled',
          narrative: `Stopped by user after completing ${completedSteps} of ${totalSteps} steps.`,
          badgeStatus: 'warning' as const,
          badgeLabel: 'Cancelled',
          icon: <Clock size={24} style={{ color: 'var(--color-warning)' }} />,
        };
      }
      case 'RUNNING':
      default: {
        const currentLabel = activeNode ? activeNode.label : `Step ${completedSteps + 1}`;
        return {
          headline: 'Processing Workflow...',
          narrative: `Step ${completedSteps} of ${totalSteps} complete. Currently running ${currentLabel}.`,
          badgeStatus: 'running' as const,
          badgeLabel: 'Running',
          icon: <Zap size={24} style={{ color: 'var(--color-accent)' }} />,
        };
      }
    }
  };

  const outcome = getOutcomeDetails();
  const hasOutputs = report && report.finalOutputs && Object.keys(report.finalOutputs).length > 0;

  return (
    <div
      className={`el-exec-result-card el-exec-result-card--${status.toLowerCase()}`}
      role="region"
      aria-label="Execution Result"
    >
      <div className="el-exec-result-card__main">
        <div className="el-exec-result-card__icon-box" aria-hidden="true">
          {outcome.icon}
        </div>

        <div className="el-exec-result-card__content">
          <div className="el-exec-result-card__status-row">
            <StatusIndicator
              status={outcome.badgeStatus}
              label={outcome.badgeLabel}
              pulse={outcome.badgeStatus === 'running'}
              size="sm"
            />
            <span className="el-exec-result-card__workflow-name">{workflow.name}</span>
          </div>

          <h2 className="el-exec-result-card__headline">{outcome.headline}</h2>
          <p className="el-exec-result-card__narrative">{outcome.narrative}</p>
        </div>
      </div>

      <div className="el-exec-result-card__actions">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={13} aria-hidden="true" />}
          onClick={onBack}
          aria-label="Back to Studio or library"
        >
          Back
        </Button>

        {hasOutputs && onViewFinalOutput && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewFinalOutput}
            aria-label="View final workflow output"
          >
            View Result
          </Button>
        )}

        <Button
          id="re-execute-btn"
          variant="primary"
          size="sm"
          leftIcon={<RotateCcw size={13} aria-hidden="true" />}
          onClick={onReExecute}
          disabled={status === 'RUNNING'}
          aria-label="Re-execute this workflow"
        >
          {status === 'RUNNING' ? 'Running...' : 'Re-run'}
        </Button>
      </div>
    </div>
  );
};
