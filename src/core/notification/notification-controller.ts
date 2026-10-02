import { Workflow } from '../../types/workflow';
import { WorkflowExecutionReport } from '../../types/execution';
import { WorkflowEngine } from '../workflow/engine';

export interface PersistentNotificationState {
  isActive: boolean;
  title: string;
  subtitle: string;
  progressPercent: number;
  currentStepLabel?: string;
  statusText: string;
  canCancel: boolean;
  canRun: boolean;
  activeWorkflowId?: string;
}

export class NotificationActionController {
  private static instance: NotificationActionController;
  private state: PersistentNotificationState = {
    isActive: true,
    title: 'EL-06 Automation Service',
    subtitle: 'Ready. Single-tap to run automation.',
    progressPercent: 0,
    statusText: 'STANDBY',
    canCancel: false,
    canRun: true
  };

  private listeners: Set<(state: PersistentNotificationState) => void> = new Set();

  private constructor() {
    // Listen to Workflow Engine events to update the notification in real-time
    const engine = WorkflowEngine.getInstance();
    engine.subscribe((report: WorkflowExecutionReport, activeNodeId?: string, logMessage?: string) => {
      this.syncWithExecution(report, activeNodeId, logMessage);
    });
  }

  public static getInstance(): NotificationActionController {
    if (!NotificationActionController.instance) {
      NotificationActionController.instance = new NotificationActionController();
    }
    return NotificationActionController.instance;
  }

  public subscribe(cb: (state: PersistentNotificationState) => void): () => void {
    this.listeners.add(cb);
    cb({ ...this.state });
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    const copy = { ...this.state };
    for (const cb of this.listeners) {
      cb(copy);
    }
  }

  public setActiveWorkflow(workflow: Workflow): void {
    this.state = {
      ...this.state,
      title: `Ready: ${workflow.name}`,
      subtitle: `Controllable via Notification Action [${workflow.nodes.length} steps]`,
      activeWorkflowId: workflow.id,
      canRun: true,
      canCancel: false,
      progressPercent: 0,
      statusText: 'ARMED'
    };
    this.notify();
  }

  private syncWithExecution(report: WorkflowExecutionReport, activeNodeId?: string, logMsg?: string): void {
    const totalNodes = Object.keys(report.nodeRecords).length;
    const completedNodes = Object.values(report.nodeRecords).filter(
      (n) => n.status === 'SUCCESS' || n.status === 'FALLBACK'
    ).length;

    const percent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    let activeLabel = 'Preparing graph...';
    if (activeNodeId && report.nodeRecords[activeNodeId]) {
      activeLabel = report.nodeRecords[activeNodeId].label;
    }

    if (report.status === 'RUNNING') {
      this.state = {
        isActive: true,
        title: `Executing: ${report.workflowName}`,
        subtitle: `${activeLabel} (${completedNodes}/${totalNodes} steps)`,
        progressPercent: percent,
        currentStepLabel: activeLabel,
        statusText: 'RUNNING',
        canCancel: true,
        canRun: false,
        activeWorkflowId: report.workflowId
      };
    } else if (report.status === 'COMPLETED') {
      this.state = {
        isActive: true,
        title: `Completed: ${report.workflowName}`,
        subtitle: `All ${totalNodes} steps finished successfully in ${report.totalDurationMs}ms`,
        progressPercent: 100,
        currentStepLabel: 'Done',
        statusText: 'SUCCESS',
        canCancel: false,
        canRun: true,
        activeWorkflowId: report.workflowId
      };
    } else if (report.status === 'FAILED') {
      this.state = {
        isActive: true,
        title: `Failed: ${report.workflowName}`,
        subtitle: report.error || 'Execution interrupted',
        progressPercent: percent,
        currentStepLabel: 'Error',
        statusText: 'FAILED',
        canCancel: false,
        canRun: true,
        activeWorkflowId: report.workflowId
      };
    }

    this.notify();
  }

  public getState(): PersistentNotificationState {
    return { ...this.state };
  }
}
