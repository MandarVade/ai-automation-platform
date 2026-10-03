import React, { useState, useEffect } from 'react';
import { ExecutionHistoryStore } from '../../data/history-store';
import { WorkflowExecutionReport } from '../../types/execution';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatusPill } from '../components/StatusPill';
import { History, Trash2, CheckCircle2, Clock, Zap, Database, ArrowRight } from 'lucide-react';

export const ActivityScreen: React.FC = () => {
  const store = ExecutionHistoryStore.getInstance();
  const [reports, setReports] = useState<WorkflowExecutionReport[]>(store.getAll());
  const [selectedReport, setSelectedReport] = useState<WorkflowExecutionReport | null>(null);

  useEffect(() => {
    return store.subscribe(setReports);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header Specification */}
      <section className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-black">
                EXECUTION AUDIT & TELEMETRY LEDGER
              </span>
              <Badge variant="success" className="text-[10px]">
                {reports.length} AUDIT RECORDS
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase mt-1">
              EXECUTION ACTIVITY & PROVENANCE LEDGER
            </h1>
            <p className="text-xs font-mono text-zinc-600 mt-0.5">
              Persistent Android execution telemetry, node latencies, model assignments, and cache efficiency metrics.
            </p>
          </div>

          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.clear()}
              className="text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Ledger</span>
            </Button>
          )}
        </div>
      </section>

      {/* 2. Audit Trail Rows */}
      {reports.length === 0 ? (
        <section className="border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_#000]">
          <div className="w-12 h-12 border-2 border-black bg-amber-300 mx-auto flex items-center justify-center shadow-[2px_2px_0px_#000] mb-3">
            <History className="w-6 h-6 text-black" />
          </div>
          <div className="text-sm font-mono font-bold text-black uppercase">
            No Workflow Runs Recorded Yet
          </div>
          <p className="text-xs font-mono text-zinc-600 mt-1 max-w-md mx-auto">
            Execute any automation from the Dashboard or Visual Builder to generate cryptographic logs and runtime telemetry.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => {
            const dateStr = new Date(rep.startTime).toLocaleTimeString();
            const nodeCount = Object.keys(rep.nodeRecords).length;

            return (
              <div
                key={rep.id}
                className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-mono font-black uppercase border-2 border-black shadow-[1px_1px_0px_#000] ${
                        rep.status === 'COMPLETED'
                          ? 'bg-emerald-300 text-black'
                          : rep.status === 'FAILED'
                          ? 'bg-rose-300 text-black'
                          : 'bg-cyan-300 text-black'
                      }`}
                    >
                      {rep.status}
                    </span>
                    <span className="text-base font-black font-mono uppercase text-black">
                      {rep.workflowName}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-zinc-600 mt-1">
                    Ran at <strong>{dateStr}</strong> · {nodeCount} DAG nodes · Device:{' '}
                    <strong>{rep.deviceContextSnapshot.deviceModel}</strong> (API{' '}
                    {rep.deviceContextSnapshot.androidVersion})
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="border border-black p-2 bg-zinc-50 min-w-[70px] text-center">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">DURATION</div>
                    <div className="text-sm font-black font-mono text-black">{rep.totalDurationMs}ms</div>
                  </div>

                  <div className="border border-black p-2 bg-zinc-50 min-w-[70px] text-center">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">PEAK RAM</div>
                    <div className="text-sm font-black font-mono text-cyan-800">{rep.totalMemoryPeakMb} MB</div>
                  </div>

                  <div className="border border-black p-2 bg-zinc-50 min-w-[70px] text-center">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">CACHE HITS</div>
                    <div className="text-sm font-black font-mono text-emerald-700">{rep.cacheHitsCount}</div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedReport(rep)}
                  >
                    <span>View Trace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Run Inspection Modal */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="text-[10px] font-mono font-bold text-black uppercase">
                  EXECUTION TRACE & TELEMETRY
                </span>
                <h3 className="text-base font-black font-mono uppercase text-black">
                  {selectedReport.workflowName} ({selectedReport.status})
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                ✕
              </Button>
            </div>
            <div className="modal-body p-4 bg-zinc-50">
              <pre className="code-view max-h-[500px]">
                {JSON.stringify(selectedReport, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <Button variant="default" size="sm" onClick={() => setSelectedReport(null)}>
                Close Trace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
