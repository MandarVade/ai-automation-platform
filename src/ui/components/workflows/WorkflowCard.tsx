import React from 'react';
import { Workflow } from '../../../types/workflow';
import { WorkflowExecutionReport } from '../../../types/execution';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, StatusIndicator } from '../ui';
import { WorkflowPreview } from './WorkflowPreview';
import { Play, FolderOpen, Layers, Clock } from 'lucide-react';

export interface WorkflowCardProps {
  workflow: Workflow;
  lastReport?: WorkflowExecutionReport;
  onOpen: (workflow: Workflow) => void;
  onRun: (workflow: Workflow) => void;
}

/**
 * Format relative time elapsed since timestamp.
 */
export const formatRelativeTime = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

/**
 * Formats a clean, readable capability summary list.
 */
export const getWorkflowCapabilitySummary = (workflow: Workflow, maxItems: number = 3): string => {
  const capabilities = workflow.nodes.map((n) => {
    switch (n.capability) {
      case 'CAMERA_CAPTURE':
        return 'Camera';
      case 'AUDIO_RECORD':
        return 'Audio';
      case 'MANUAL':
        return 'Manual';
      case 'OCR':
        return 'OCR';
      case 'SPEECH_TO_TEXT':
        return 'Transcription';
      case 'SUMMARIZATION':
        return 'Summarization';
      case 'CONCEPT_EXTRACTION':
        return 'Concepts';
      case 'QUESTION_GENERATION':
        return 'Quiz Generator';
      case 'PLANT_DISEASE_DIAGNOSIS':
        return 'Plant Pathology';
      case 'CALCULATE_TOTAL':
        return 'Calculation';
      case 'STRUCTURED_JSON_MAP':
        return 'Data Transform';
      case 'EXPENSE_CATEGORIZATION':
        return 'Categorization';
      case 'TASK_EXTRACTION':
        return 'Task Extraction';
      case 'EXPENSE_TRACKER_STORE':
        return 'Expense Ledger';
      case 'CARE_PLAN_STORE':
        return 'Care Plan';
      case 'STUDY_NOTES_STORE':
        return 'Study Notes';
      case 'NOTIFICATION_EMIT':
        return 'Notification';
      case 'SAVE_FILE':
        return 'Save File';
      default:
        return n.capability.replace(/_/g, ' ');
    }
  });

  const distinct = Array.from(new Set(capabilities));
  const visible = distinct.slice(0, maxItems);
  const remaining = distinct.length - maxItems;

  if (remaining > 0) {
    return `${visible.join(' · ')} · +${remaining} more`;
  }
  return visible.join(' · ');
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  lastReport,
  onOpen,
  onRun,
}) => {
  const capabilitySummary = getWorkflowCapabilitySummary(workflow);

  // Derive execution status
  const getExecutionStatus = () => {
    if (!lastReport) {
      return {
        status: 'neutral' as const,
        label: 'Not run yet',
      };
    }
    const relTime = formatRelativeTime(lastReport.startTime);
    switch (lastReport.status) {
      case 'COMPLETED':
        return {
          status: 'success' as const,
          label: `Last run · ${relTime} · Completed`,
        };
      case 'FAILED':
        return {
          status: 'error' as const,
          label: `Last run · ${relTime} · Failed`,
        };
      case 'RUNNING':
        return {
          status: 'running' as const,
          label: `Running now...`,
        };
      case 'CANCELLED':
        return {
          status: 'warning' as const,
          label: `Last run · ${relTime} · Cancelled`,
        };
      default:
        return {
          status: 'neutral' as const,
          label: `Last run · ${relTime}`,
        };
    }
  };

  const execStatus = getExecutionStatus();

  return (
    <Card className="el-workflow-card" variant="default">
      {/* Header: Domain, Version & Title */}
      <CardHeader className="el-workflow-card__header">
        <div className="el-workflow-card__meta-bar">
          <Badge variant="neutral" size="sm" className="el-workflow-card__domain">
            {workflow.domain}
          </Badge>
          <span className="el-workflow-card__version" title={`Workflow Version ${workflow.version}`}>
            {workflow.nodes.length} steps · v{workflow.version}
          </span>
        </div>

        <CardTitle className="el-workflow-card__title">
          {workflow.name}
        </CardTitle>

        <CardDescription className="el-workflow-card__desc">
          {workflow.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="el-workflow-card__body">
        {/* Visual Pipeline Preview */}
        <div className="el-workflow-card__preview-section">
          <WorkflowPreview workflow={workflow} />
        </div>

        {/* Capability Tags / Summary */}
        <div className="el-workflow-card__capabilities" title="Node capabilities used in DAG">
          <span className="el-workflow-card__cap-label">
            <Layers size={11} aria-hidden="true" />
            <span>Capabilities:</span>
          </span>
          <span className="el-workflow-card__cap-list">{capabilitySummary}</span>
        </div>

        {/* Last Run & Semantic Status */}
        <div className="el-workflow-card__status-row">
          <StatusIndicator
            status={execStatus.status}
            label={execStatus.label}
            size="sm"
            pulse={execStatus.status === 'running'}
          />
        </div>
      </CardContent>

      {/* Card Actions: Open in Studio and Run */}
      <CardFooter className="el-workflow-card__footer">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FolderOpen size={13} aria-hidden="true" />}
          onClick={() => onOpen(workflow)}
          aria-label={`Open ${workflow.name} in Studio`}
        >
          Open
        </Button>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Play size={13} aria-hidden="true" />}
          onClick={() => onRun(workflow)}
          aria-label={`Run ${workflow.name}`}
        >
          Run
        </Button>
      </CardFooter>
    </Card>
  );
};
