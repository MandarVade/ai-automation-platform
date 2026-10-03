import React from 'react';
import { WorkflowExecutionReport } from '../../../types/execution';
import { Clock, CheckSquare, Layers, Cpu, Zap } from 'lucide-react';

export interface ExecutionSummaryBarProps {
  totalSteps: number;
  report: WorkflowExecutionReport | null;
  className?: string;
}

export const ExecutionSummaryBar: React.FC<ExecutionSummaryBarProps> = ({
  totalSteps,
  report,
  className = '',
}) => {
  const completedSteps = report
    ? Object.values(report.nodeRecords).filter(
        (r) => r.status === 'SUCCESS' || r.status === 'FALLBACK'
      ).length
    : 0;

  const durationStr = report?.totalDurationMs
    ? report.totalDurationMs >= 1000
      ? `${(report.totalDurationMs / 1000).toFixed(2)}s`
      : `${report.totalDurationMs}ms`
    : 'In progress...';

  const startTimeStr = report?.startTime
    ? new Date(report.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const endTimeStr = report?.endTime
    ? new Date(report.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isRunning = report?.status === 'RUNNING';

  return (
    <div className={`el-exec-summary ${className}`.trim()} role="region" aria-label="Execution Summary">
      {/* Metric chips */}
      <div className="el-exec-summary__row">
        <div className="el-exec-summary__item">
          <CheckSquare size={13} className="el-exec-summary__icon" aria-hidden="true" />
          <span className="el-exec-summary__label">Steps:</span>
          <span className="el-exec-summary__val">
            {completedSteps} of {totalSteps}
          </span>
        </div>

        <div className="el-exec-summary__item">
          <Clock size={13} className="el-exec-summary__icon" aria-hidden="true" />
          <span className="el-exec-summary__label">Duration:</span>
          <span className="el-exec-summary__val">{durationStr}</span>
        </div>

        {startTimeStr && (
          <div className="el-exec-summary__item">
            <span className="el-exec-summary__label">Timeline:</span>
            <span className="el-exec-summary__val">
              {startTimeStr} {endTimeStr ? `→ ${endTimeStr}` : ''}
            </span>
          </div>
        )}

        {report?.deviceContextSnapshot?.deviceModel && (
          <div className="el-exec-summary__item el-exec-summary__item--device">
            <Cpu size={13} className="el-exec-summary__icon" aria-hidden="true" />
            <span className="el-exec-summary__label">Device:</span>
            <span className="el-exec-summary__val">
              {report.deviceContextSnapshot.deviceModel.split('(')[0].trim()}
            </span>
          </div>
        )}

        {(report?.cacheHitsCount ?? 0) > 0 && (
          <div className="el-exec-summary__item el-exec-summary__item--cache">
            <Zap size={13} style={{ color: 'var(--color-success)' }} aria-hidden="true" />
            <span className="el-exec-summary__val" style={{ color: 'var(--color-success)' }}>
              {report?.cacheHitsCount} Cache Hit{report?.cacheHitsCount === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      {/* Progress track if actively executing */}
      {isRunning && (
        <div className="el-exec-summary__progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="el-exec-summary__progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
