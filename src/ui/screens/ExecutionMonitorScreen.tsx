import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../types/execution';
import { WorkflowEngine } from '../../core/workflow/engine';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { ExplainabilityModal } from '../components/ExplainabilityModal';
import { ExecutionHistoryStore } from '../../data/history-store';
import { NotificationActionController } from '../../core/notification/notification-controller';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatusPill } from '../components/StatusPill';
import { Play, ArrowLeft, RefreshCw, Upload, Terminal, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface ExecutionMonitorScreenProps {
  workflow: Workflow;
  onBackToBuilder: () => void;
}

export const ExecutionMonitorScreen: React.FC<ExecutionMonitorScreenProps> = ({
  workflow,
  onBackToBuilder
}) => {
  const [report, setReport] = useState<WorkflowExecutionReport | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const [selectedRecord, setSelectedRecord] = useState<NodeExecutionRecord | null>(null);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [inspectedOutput, setInspectedOutput] = useState<any | null>(null);

  // Real Image Input State (Phase 5: Real File Input)
  const PRESETS: Record<string, { label: string; text: string }> = {
    preset_coffee: {
      label: 'Preset A (Coffee - $10.53)',
      text: 'BLUE BOTTLE COFFEE\nSingle Origin Espresso $4.50\nOat Milk Cortado $5.25\nSubtotal: $9.75\nTax: $0.78\nTotal: $10.53'
    },
    preset_bookstore: {
      label: 'Preset B (Books - $48.06)',
      text: 'STRAND BOOKSTORE\nAlgorithms in Kotlin $42.00\nBookmark Pack $3.00\nSubtotal: $45.00\nTax: $3.06\nTotal: $48.06'
    },
    preset_market: {
      label: 'Preset C (Market - $11.61)',
      text: 'WHOLE FOODS MARKET\nAlmond Milk $3.89\nArtisan Sourdough $2.49\nOrganic Honeycrisp Apples $4.50\nSubtotal: $10.88\nTax: $0.73\nTotal: $11.61'
    }
  };

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customImageText, setCustomImageText] = useState<string>(PRESETS.preset_coffee.text);
  const [selectedPreset, setSelectedPreset] = useState<string>('preset_coffee');

  const engine = WorkflowEngine.getInstance();
  const historyStore = ExecutionHistoryStore.getInstance();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedImage(dataUrl);
      setUploadedFileName(file.name);
      setSelectedPreset('custom_upload');
      setCustomImageText(`[Uploaded Image: ${file.name}]`);
      startRun({
        type: 'IMAGE',
        image: dataUrl,
        fileName: file.name,
        source: 'Real User Uploaded File',
        isRealUpload: true
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const chosen = PRESETS[key];
    if (chosen) {
      setCustomImageText(chosen.text);
      startRun({
        type: 'IMAGE',
        rawText: chosen.text,
        source: `Preset: ${chosen.label}`,
        isRealUpload: false
      });
    }
  };

  const startRun = async (overrideInput?: any) => {
    try {
      let inputPayload: any;
      // Guard against React SyntheticEvent being passed as overrideInput
      if (overrideInput && typeof overrideInput === 'object' && !('nativeEvent' in overrideInput)) {
        inputPayload = overrideInput;
      } else if (selectedPreset === 'custom_upload' && uploadedImage) {
        inputPayload = {
          type: 'IMAGE',
          image: uploadedImage,
          fileName: uploadedFileName || 'uploaded_receipt.png',
          source: 'Real User Uploaded File',
          isRealUpload: true
        };
      } else if (PRESETS[selectedPreset]) {
        inputPayload = {
          type: 'IMAGE',
          rawText: PRESETS[selectedPreset].text,
          source: `Preset: ${PRESETS[selectedPreset].label}`,
          isRealUpload: false
        };
      } else {
        inputPayload = {
          type: 'IMAGE',
          rawText: customImageText,
          source: 'User File Input / Image Capture',
          isRealUpload: false
        };
      }
      await engine.executeWorkflow(workflow, inputPayload);
    } catch (err) {
      console.error('Execution encountered error:', err);
    }
  };

  useEffect(() => {
    // Subscribe to live engine events
    const unsub = engine.subscribe((rep, node, log) => {
      setReport(rep);
      setActiveNodeId(node);

      if (node && rep.nodeRecords[node]) {
        setSelectedRecord(rep.nodeRecords[node]);
      }

      if (rep.status === 'COMPLETED' || rep.status === 'FAILED') {
        historyStore.addReport(rep);
      }
    });

    // Arm notification action
    NotificationActionController.getInstance().setActiveWorkflow(workflow);

    // Initial run
    startRun();

    return () => unsub();
  }, [workflow.id]);

  const nodeStatusMap = report
    ? Object.fromEntries(
        Object.entries(report.nodeRecords).map(([id, rec]) => [
          id,
          {
            status: rec.status,
            latencyMs: rec.latencyMs,
            modelName: rec.selectedModelName
          }
        ])
      )
    : {};

  const totalSteps = workflow.nodes.length;
  const completedSteps = report
    ? Object.values(report.nodeRecords).filter((r) => r.status === 'SUCCESS' || r.status === 'FALLBACK').length
    : 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8 w-full min-w-0 pb-12">
      {/* 1. Top Header & Execution Controls */}
      <section className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
                WORKFLOW EXECUTION STREAM
              </span>
              <Badge variant="cyber" className="text-[10px]">
                LIVE RUNTIME
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase mt-1">
              {workflow.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={onBackToBuilder}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to DAG</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              id="re-execute-btn"
              onClick={() => startRun()}
              disabled={report?.status === 'RUNNING'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${report?.status === 'RUNNING' ? 'animate-spin' : ''}`} />
              <span>{report?.status === 'RUNNING' ? 'Running...' : 'Re-execute Workflow'}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Real Input Selection & Transparency Audit Bar */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-black uppercase text-zinc-900">
              REAL INPUT DATA:
            </span>

            {/* Hidden native input for test/CDP automation */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="real-image-input"
            />

            <label
              htmlFor="real-image-input"
              className="btn-primary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>📷 Upload User Receipt Image</span>
            </label>

            <span className="text-xs font-mono text-zinc-500 font-bold">OR PRESET:</span>
            {Object.entries(PRESETS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`px-2.5 py-1 text-xs font-mono font-bold border-2 border-black transition-all cursor-pointer ${
                  selectedPreset === key
                    ? 'bg-black text-amber-300 shadow-[2px_2px_0px_#FACC15]'
                    : 'bg-zinc-100 text-black hover:bg-zinc-200 shadow-[2px_2px_0px_#000]'
                }`}
                onClick={() => handleSelectPreset(key)}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Audit Verification Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-200">
            <span className="text-xs font-mono text-zinc-600 font-bold uppercase">
              Platform Audit:
            </span>
            {workflow.id === 'wf_finance_bill' || workflow.id === 'wf-finance' ? (
              selectedPreset === 'custom_upload' && !!uploadedImage ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black bg-emerald-300 text-black shadow-[2px_2px_0px_#000]">
                    ● REAL INFERENCE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black bg-cyan-300 text-black shadow-[2px_2px_0px_#000]">
                    ● REAL ARITHMETIC
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black bg-purple-300 text-black shadow-[2px_2px_0px_#000]">
                    ● REAL PERSISTENCE
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black bg-amber-300 text-black shadow-[2px_2px_0px_#000]">
                  ● DEMO SIMULATION
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black bg-amber-300 text-black shadow-[2px_2px_0px_#000]">
                ● DEMO SIMULATION
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. Progress & Live Telemetry Bar */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span
              className="status-pill"
              style={{
                backgroundColor:
                  report?.status === 'RUNNING'
                    ? '#67e8f9'
                    : report?.status === 'COMPLETED'
                    ? '#6ee7b7'
                    : report?.status === 'FAILED'
                    ? '#fca5a5'
                    : '#ffffff'
              }}
            >
              {report?.status || 'INITIALIZING'}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-700">
              Step {completedSteps} of {totalSteps} completed ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold flex-wrap">
            <div>
              <span className="text-zinc-500 uppercase">Duration: </span>
              <span className="text-black">
                {report?.totalDurationMs ? `${report.totalDurationMs}ms` : 'Measuring...'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase">Peak RAM: </span>
              <span className="text-cyan-800">{report?.totalMemoryPeakMb || 0} MB</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase">Cache Hits: </span>
              <span className="text-emerald-700">{report?.cacheHitsCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 border-2 border-black bg-zinc-100 overflow-hidden shadow-[1px_1px_0px_#000]">
          <div
            className="h-full bg-amber-400 border-r-2 border-black transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 4. Live Visual DAG Graph Canvas */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase text-black">
              ADAPTIVE EXECUTION DECISION GRAPH
            </span>
            <Badge variant="cyber" className="text-[10px]">
              REACT FLOW DAG
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-zinc-600 font-bold hidden sm:inline">
            Click any node to inspect execution telemetry
          </span>
        </div>

        <DAGVisualizer
          workflow={workflow}
          nodeStatusMap={nodeStatusMap}
          activeNodeId={activeNodeId}
          selectedNodeId={selectedRecord?.nodeId}
          onSelectNode={(node) => {
            if (report?.nodeRecords[node.id]) {
              setSelectedRecord(report.nodeRecords[node.id]);
            }
          }}
        />
      </section>

      {/* 5. Split Inspector: Execution Timeline on Left, Live Node Diagnostics on Right */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch min-w-0">
        {/* Left: Execution Timeline (flex: 1) */}
        <div className="flex-1 min-w-0 min-h-0 border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4 shrink-0">
            <span className="text-xs font-mono font-black uppercase text-black">
              EXECUTION TIMELINE & DATA FLOW
            </span>
            <span className="text-[11px] font-mono text-zinc-600 font-bold">
              {workflow.nodes.length} SEQUENCED NODES
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
            {workflow.nodes.map((node, index) => {
              const rec = report?.nodeRecords[node.id];
              const status = rec?.status || 'QUEUED';
              const isSelected = selectedRecord?.nodeId === node.id;
              const isFinance = workflow.id === 'wf_finance_bill' || workflow.id === 'wf-finance';
              const isRealRun = selectedPreset === 'custom_upload' && !!uploadedImage;
              const isRealOCR =
                isFinance && node.capability === 'OCR' && (isRealRun || rec?.selectedModelName?.includes('Tesseract'));
              const isRealArithmetic =
                isFinance && node.type === 'TRANSFORM' && (isRealRun || selectedPreset === 'custom_upload');
              const isRealPersistence =
                isFinance && node.type === 'ANDROID_ACTION' && (isRealRun || selectedPreset === 'custom_upload');
              const classifLabel = isRealOCR
                ? '● REAL INFERENCE'
                : isRealArithmetic
                ? '● REAL ARITHMETIC'
                : isRealPersistence
                ? '● REAL PERSISTENCE'
                : '● DEMO SIMULATION';
              const classifBadgeVariant = isRealOCR
                ? 'success'
                : isRealArithmetic
                ? 'cyber'
                : isRealPersistence
                ? 'purple'
                : 'default';

              return (
                <div
                  key={node.id}
                  className={`timeline-step ${
                    isSelected ? 'ring-2 ring-black bg-amber-50 shadow-[4px_4px_0px_#000]' : ''
                  }`}
                  onClick={() => rec && setSelectedRecord(rec)}
                >
                  <div className={`step-marker ${status}`}>
                    {status === 'SUCCESS' ? '✓' : status === 'RUNNING' ? '▶' : status === 'FAILED' ? '✕' : index + 1}
                  </div>

                  <div className="step-content">
                    <div className="step-header">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="step-title">{node.label}</span>
                        <Badge variant={classifBadgeVariant as any} className="text-[10px]">
                          {classifLabel}
                        </Badge>
                      </div>
                      <div className="step-meta">
                        {rec?.cacheHit && (
                          <span className="text-emerald-700 font-black">⚡ CACHE HIT</span>
                        )}
                        {rec?.latencyMs !== undefined && (
                          <span>{rec.latencyMs}ms</span>
                        )}
                        {rec?.executionLocation && (
                          <span className={`location-badge ${rec.executionLocation}`}>
                            {rec.executionLocation}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-zinc-700 mt-1">
                      {rec?.selectedModelName ? (
                        <span>
                          Runtime: <strong>{rec.selectedModelName}</strong>
                        </span>
                      ) : (
                        <span>Type: {node.type} ({node.capability})</span>
                      )}
                    </div>

                    {rec?.fallbackTriggered && (
                      <div className="text-xs font-mono text-purple-700 font-bold mt-1">
                        ⚠️ {rec.fallbackReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Step Inspector (flex: 1) */}
        <div className="flex-1 min-w-0 min-h-0 border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4 shrink-0">
            <span className="text-xs font-mono font-black uppercase text-black">
              NODE INSPECTOR & TELEMETRY
            </span>
            {selectedRecord && (
              <span className={`status-pill ${selectedRecord.status}`}>
                {selectedRecord.status}
              </span>
            )}
          </div>

          {selectedRecord ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  ACTIVE NODE
                </div>
                <h3 className="text-base font-black font-mono uppercase text-black">
                  {selectedRecord.label}
                </h3>
              </div>

              {/* Model & Routing telemetry */}
              {selectedRecord.selectedModelName && (
                <div className="border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                        {selectedRecord.nodeId === 'node_bill_ocr' ? 'OCR ENGINE / RUNTIME' : 'SELECTED MODEL'}
                      </div>
                      <div className="text-sm font-black font-mono text-black">
                        {selectedRecord.selectedModelName}
                      </div>
                    </div>
                    {selectedRecord.scoreBreakdown && !selectedRecord.selectedModelName.includes('Tesseract') && (
                      <button
                        type="button"
                        className="btn-secondary text-[10px] py-0.5 px-2"
                        onClick={() => setExplainModalOpen(true)}
                      >
                        Why this? ↗
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-zinc-300">
                    <div>
                      <span className="text-zinc-500">Location: </span>
                      <span className="font-bold">{selectedRecord.executionLocation}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Memory: </span>
                      <span className="font-bold">{selectedRecord.ramConsumedMb || 0} MB</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Latency: </span>
                      <span className="font-bold">{selectedRecord.latencyMs || 0} ms</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Cache Hit: </span>
                      <span className={`font-bold ${selectedRecord.cacheHit ? 'text-emerald-700' : 'text-zinc-700'}`}>
                        {selectedRecord.cacheHit ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Telemetry & Node Logs */}
              <div>
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1">
                  EXECUTION LOG CONSOLE:
                </div>
                <div className="border-2 border-black bg-zinc-900 p-3 font-mono text-xs text-zinc-300 max-h-36 overflow-y-auto space-y-1">
                  {selectedRecord.logLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              {/* Step Output Inspector */}
              {selectedRecord.outputData && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                      INTERMEDIATE OUTPUT ARTIFACT:
                    </span>
                    <button
                      type="button"
                      className="btn-secondary text-[10px] py-0.5 px-2"
                      onClick={() => setInspectedOutput(selectedRecord.outputData)}
                    >
                      Expand View
                    </button>
                  </div>
                  <pre className="code-view max-h-44 overflow-y-auto">
                    {typeof selectedRecord.outputData === 'string'
                      ? selectedRecord.outputData
                      : JSON.stringify(selectedRecord.outputData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-zinc-500 text-center py-12">
              Select any step from the execution timeline to inspect diagnostics and telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        breakdown={selectedRecord?.scoreBreakdown}
      />

      {/* Expanded Output Inspector Modal */}
      {inspectedOutput && (
        <div className="modal-backdrop" onClick={() => setInspectedOutput(null)}>
          <div className="modal-dialog max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-base font-black font-mono uppercase text-black">
                Detailed Step Artifact
              </h3>
              <Button variant="outline" size="sm" onClick={() => setInspectedOutput(null)}>
                ✕
              </Button>
            </div>
            <div className="modal-body p-4 bg-zinc-100">
              <pre className="code-view max-h-[500px]">
                {typeof inspectedOutput === 'string'
                  ? inspectedOutput
                  : JSON.stringify(inspectedOutput, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <Button variant="default" size="sm" onClick={() => setInspectedOutput(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
