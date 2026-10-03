import React, { useState, useEffect } from 'react';
import { ExecutionHistoryStore } from '../../data/history-store';
import { WorkflowExecutionReport } from '../../types/execution';

export const ActivityScreen: React.FC = () => {
  const store = ExecutionHistoryStore.getInstance();
  const [reports, setReports] = useState<WorkflowExecutionReport[]>(store.getAll());
  const [selectedReport, setSelectedReport] = useState<WorkflowExecutionReport | null>(null);

  useEffect(() => {
    return store.subscribe(setReports);
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Execution Activity & Audit Trail</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Persistent telemetry, latency logs, model assignments, and cache efficiency metrics.
          </p>
        </div>

        {reports.length > 0 && (
          <button className="btn-secondary" style={{ fontSize: '11px' }} onClick={() => store.clear()}>
            Clear History
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No workflow runs recorded yet. Execute any automation from the Home or Visual Builder screen.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((rep) => {
            const dateStr = new Date(rep.startTime).toLocaleTimeString();
            const nodeCount = Object.keys(rep.nodeRecords).length;

            return (
              <div
                key={rep.id}
                style={{
                  background: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className="status-pill"
                      style={{
                        color:
                          rep.status === 'COMPLETED'
                            ? 'var(--status-success)'
                            : rep.status === 'FAILED'
                            ? 'var(--status-error)'
                            : 'var(--accent-blue)',
                        fontWeight: 600
                      }}
                    >
                      {rep.status}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rep.workflowName}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Ran at {dateStr} | {nodeCount} DAG nodes | Device: {rep.deviceContextSnapshot.deviceModel}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="stat-item">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{rep.totalDurationMs}ms</span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Peak RAM</span>
                    <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                      {rep.totalMemoryPeakMb} MB
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Cache Hits</span>
                    <span className="stat-value" style={{ color: '#34d399' }}>
                      {rep.cacheHitsCount}
                    </span>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ fontSize: '12px' }}
                    onClick={() => setSelectedReport(rep)}
                  >
                    View Audit Log
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execution Audit Modal */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <span className="stat-label">AUDIT TELEMETRY REPORT</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{selectedReport.workflowName}</h3>
              </div>
              <button className="btn-secondary" onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className="modal-body">
              <pre className="code-view" style={{ maxHeight: '520px' }}>
                {JSON.stringify(selectedReport, null, 2)}
              </pre>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
