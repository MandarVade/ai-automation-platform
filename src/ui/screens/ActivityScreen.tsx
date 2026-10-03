import React, { useState, useEffect, useMemo } from 'react';
import { ExecutionHistoryStore } from '../../data/history-store';
import { WorkflowExecutionReport } from '../../types/execution';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { Workflow, WorkflowNode } from '../../types/workflow';
import { ExecutionDetailView } from '../components/execution/ExecutionDetailView';
import { StatusIndicator, Button, Input } from '../components/ui';
import { Search, Trash2, Clock, Cpu, Zap, Activity, ArrowRight } from 'lucide-react';

interface ActivityScreenProps {
  onRunWorkflow?: (workflow: Workflow) => void;
}

function resolveWorkflowForReport(report: WorkflowExecutionReport): Workflow {
  const found = DEMO_WORKFLOWS.find((w) => w.id === report.workflowId);
  if (found) return found;

  const nodeEntries = Object.entries(report.nodeRecords);
  const nodes: WorkflowNode[] = nodeEntries.map(([nodeId, rec], idx) => ({
    id: nodeId,
    label: rec.label || `Step ${idx + 1}`,
    type: 'AI',
    capability: 'SUMMARIZATION',
    inputTypes: [],
    outputType: 'TEXT',
    dependencies: idx > 0 ? [nodeEntries[idx - 1][0]] : [],
    config: {},
    executionPolicy: 'AUTO',
    position: { x: 150 * idx, y: 150 }
  }));

  return {
    id: report.workflowId,
    name: report.workflowName,
    description: `Recorded execution from ${new Date(report.startTime).toLocaleString()}`,
    domain: 'PRODUCTIVITY',
    createdAt: report.startTime,
    updatedAt: report.endTime || report.startTime,
    version: '1.0.0',
    nodes: nodes.length > 0 ? nodes : [{
      id: 'step_1',
      label: 'Executed Step',
      type: 'AI',
      capability: 'SUMMARIZATION',
      inputTypes: [],
      outputType: 'TEXT',
      dependencies: [],
      config: {},
      executionPolicy: 'AUTO',
      position: { x: 0, y: 0 }
    }],
    edges: []
  };
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(ms?: number): string {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ onRunWorkflow }) => {
  const store = ExecutionHistoryStore.getInstance();
  const [reports, setReports] = useState<WorkflowExecutionReport[]>(store.getAll());
  const [selectedReport, setSelectedReport] = useState<WorkflowExecutionReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL');

  useEffect(() => {
    return store.subscribe(setReports);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch =
        searchQuery === '' ||
        rep.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || rep.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  // If a report is selected, show the unified ExecutionDetailView
  if (selectedReport) {
    const wf = resolveWorkflowForReport(selectedReport);
    return (
      <ExecutionDetailView
        workflow={wf}
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        isLiveMode={false}
        onReExecute={onRunWorkflow ? () => onRunWorkflow(wf) : undefined}
      />
    );
  }

  return (
    <div className="el-activity-screen">
      {/* Header */}
      <div className="el-activity-header">
        <div>
          <h1 className="el-activity-title">Execution Activity</h1>
          <p className="el-activity-subtitle">
            Auditable history of all automation runs with execution telemetry, model delegates, and timing.
          </p>
        </div>

        {reports.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={13} aria-hidden="true" />}
            onClick={() => store.clear()}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="el-activity-controls">
        <div className="el-activity-search">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by workflow name or status..."
            leftIcon={<Search size={14} aria-hidden="true" />}
            aria-label="Search execution logs"
          />
        </div>

        <div className="el-activity-filters" role="tablist" aria-label="Filter execution status">
          {(['ALL', 'COMPLETED', 'FAILED'] as const).map((filter) => {
            const count =
              filter === 'ALL'
                ? reports.length
                : reports.filter((r) => r.status === filter).length;
            const isActive = statusFilter === filter;

            return (
              <button
                key={filter}
                role="tab"
                aria-selected={isActive}
                className={`el-activity-filter-btn ${isActive ? 'el-activity-filter-btn--active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                <span>{filter === 'ALL' ? 'All Runs' : filter === 'COMPLETED' ? 'Successful' : 'Failed'}</span>
                <span className="el-activity-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="el-activity-empty">
          <Activity size={32} className="el-activity-empty__icon" aria-hidden="true" />
          <h3 className="el-activity-empty__title">
            {reports.length === 0 ? 'No Execution History Yet' : 'No Matching Runs Found'}
          </h3>
          <p className="el-activity-empty__desc">
            {reports.length === 0
              ? 'Run an automation from the Library or Studio to view result summaries and execution telemetry.'
              : 'Try adjusting your search query or status filter.'}
          </p>
        </div>
      ) : (
        <div className="el-activity-list" role="feed" aria-label="Execution history">
          {filteredReports.map((rep) => {
            const nodeCount = Object.keys(rep.nodeRecords).length;
            const badgeStatus =
              rep.status === 'COMPLETED'
                ? 'success'
                : rep.status === 'FAILED'
                ? 'error'
                : 'running';

            return (
              <div
                key={rep.id}
                className="el-activity-card"
                onClick={() => setSelectedReport(rep)}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedReport(rep);
                  }
                }}
                aria-label={`Execution of ${rep.workflowName}, status ${rep.status}`}
              >
                {/* Left: Status & Identity */}
                <div className="el-activity-card__left">
                  <div className="el-activity-card__status-row">
                    <StatusIndicator
                      status={badgeStatus}
                      label={rep.status}
                      size="sm"
                    />
                    <span className="el-activity-card__time">
                      {formatRelativeTime(rep.startTime)}
                    </span>
                  </div>

                  <h3 className="el-activity-card__name">{rep.workflowName}</h3>

                  <div className="el-activity-card__meta">
                    <span>{nodeCount} steps</span>
                    <span>•</span>
                    <span>{rep.deviceContextSnapshot?.deviceModel || 'Android Runtime'}</span>
                  </div>
                </div>

                {/* Right: Telemetry & Drilldown */}
                <div className="el-activity-card__right">
                  <div className="el-activity-card__stats">
                    <div className="el-activity-card__stat">
                      <Clock size={11} aria-hidden="true" />
                      <span className="el-activity-card__stat-val">
                        {formatDuration(rep.totalDurationMs)}
                      </span>
                    </div>

                    <div className="el-activity-card__stat">
                      <Cpu size={11} aria-hidden="true" />
                      <span className="el-activity-card__stat-val">
                        {rep.totalMemoryPeakMb || 0} MB
                      </span>
                    </div>

                    {rep.cacheHitsCount !== undefined && rep.cacheHitsCount > 0 && (
                      <div className="el-activity-card__stat el-activity-card__stat--cache">
                        <Zap size={11} aria-hidden="true" />
                        <span className="el-activity-card__stat-val">
                          {rep.cacheHitsCount} cache hit{rep.cacheHitsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="el-activity-card__action">
                    <span className="el-activity-card__view-text">View Result</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
