import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../types/execution';
import { WorkflowEngine } from '../../core/workflow/engine';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { ExplainabilityModal } from '../components/ExplainabilityModal';
import { ExecutionHistoryStore } from '../../data/history-store';
import { NotificationActionController } from '../../core/notification/notification-controller';

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
    <div>
      {/* Top Header & Execution Controls */}
      <div className="section-header">
        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            DEVICE-AWARE EXECUTION RUNTIME
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{workflow.name}</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={onBackToBuilder}>
            ← Back to DAG
          </button>
          <button
            id="re-execute-btn"
            className="btn-primary"
            onClick={() => startRun()}
            disabled={report?.status === 'RUNNING'}
          >
            {report?.status === 'RUNNING' ? 'Running...' : '↺ Re-execute Workflow'}
          </button>
        </div>
      </div>
      {/* Real Input Selection & Transparency Audit Bar (Phase 5 & 11) */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              REAL INPUT DATA:
            </span>
            <label
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📷 Upload User Receipt Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="real-image-input"
              />
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>or preset:</span>
            {Object.entries(PRESETS).map(([key, val]) => (
              <button
                key={key}
                className={selectedPreset === key ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '10px', padding: '3px 8px' }}
                onClick={() => handleSelectPreset(key)}
              >
                {val.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Platform Audit:</span>
            {workflow.id === 'wf-finance' ? (
              <>
                <span className="location-badge ON_DEVICE" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #34d399', fontSize: '10px' }}>
                  ● REAL INFERENCE
                </span>
                <span className="location-badge ON_DEVICE" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '10px' }}>
                  ● REAL ARITHMETIC
                </span>
                {selectedPreset === 'custom_upload' ? (
                  <span className="location-badge ON_DEVICE" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid #22d3ee', fontSize: '10px' }}>
                    ● TESSERACT WASM REAL OCR
                  </span>
                ) : (
                  <span className="location-badge CLOUD" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24', fontSize: '10px' }}>
                    ● DEMO SIMULATION
                  </span>
                )}
              </>
            ) : (
              <span className="location-badge CLOUD" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24', fontSize: '10px' }}>
                ● DEMO SIMULATION
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Live Telemetry Bar */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="status-pill"
              style={{
                color:
                  report?.status === 'RUNNING'
                    ? 'var(--accent-blue)'
                    : report?.status === 'COMPLETED'
                    ? 'var(--status-success)'
                    : 'var(--status-error)',
                fontWeight: 600
              }}
            >
              {report?.status || 'INITIALIZING'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Step {completedSteps} of {totalSteps} completed
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <span>
              Duration: <strong style={{ color: 'var(--text-primary)' }}>{report?.totalDurationMs ? `${report.totalDurationMs}ms` : 'Measuring...'}</strong>
            </span>
            <span>
              Peak RAM: <strong style={{ color: 'var(--accent-cyan)' }}>{report?.totalMemoryPeakMb || 0} MB</strong>
            </span>
            <span>
              Cache Hits: <strong style={{ color: '#34d399' }}>{report?.cacheHitsCount || 0}</strong>
            </span>
          </div>
        </div>

        <div className="progress-track" style={{ height: '6px' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Live Visual DAG Graph */}
      <div style={{ marginBottom: '16px' }}>
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
      </div>

      {/* Split Inspector: Execution Timeline on Left, Live Node Diagnostics on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Step-by-Step Timeline */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px' }}>
            EXECUTION TIMELINE & DATA FLOW
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {workflow.nodes.map((node, index) => {
              const rec = report?.nodeRecords[node.id];
              const status = rec?.status || 'QUEUED';
              const isSelected = selectedRecord?.nodeId === node.id;
              const isRealOCR = workflow.id === 'wf-finance' && node.capability === 'OCR';
              const isRealArithmetic = workflow.id === 'wf-finance' && node.type === 'TRANSFORM';
              const isRealPersistence = workflow.id === 'wf-finance' && node.type === 'ANDROID_ACTION';
              const classifLabel = isRealOCR
                ? '● REAL INFERENCE'
                : isRealArithmetic
                ? '● REAL ARITHMETIC'
                : isRealPersistence
                ? '● REAL PERSISTENCE'
                : '● DEMO SIMULATION';
              const classifColor = isRealOCR
                ? '#34d399'
                : isRealArithmetic
                ? '#38bdf8'
                : isRealPersistence
                ? '#a78bfa'
                : '#fbbf24';

              return (
                <div
                  key={node.id}
                  className="timeline-step"
                  style={{
                    background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => rec && setSelectedRecord(rec)}
                >
                  <div className={`step-marker ${status}`}>
                    {status === 'SUCCESS' ? '✓' : status === 'RUNNING' ? '▶' : status === 'FAILED' ? '✕' : index + 1}
                  </div>

                  <div className="step-content">
                    <div className="step-header">
                      <div>
                        <span className="step-title">{node.label}</span>
                        <span style={{ fontSize: '10px', color: classifColor, marginLeft: '6px', fontWeight: 600 }}>
                          {classifLabel}
                        </span>
                      </div>
                      <div className="step-meta">
                        {rec?.cacheHit && (
                          <span style={{ color: '#34d399', fontWeight: 600 }}>⚡ CACHE HIT</span>
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

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {rec?.selectedModelName ? (
                        <span>Model: <strong>{rec.selectedModelName}</strong></span>
                      ) : (
                        <span>Type: {node.type} ({node.capability})</span>
                      )}
                    </div>

                    {rec?.fallbackTriggered && (
                      <div style={{ color: 'var(--status-fallback)', fontSize: '11px', marginTop: '4px' }}>
                        ⚠️ {rec.fallbackReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Inspector Card */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          {selectedRecord ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span className="stat-label">SELECTED STEP DETAILS</span>
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{selectedRecord.label}</h3>
                </div>
                <span className={`status-pill ${selectedRecord.status}`}>
                  {selectedRecord.status}
                </span>
              </div>

              {/* Model & Routing telemetry */}
              {selectedRecord.selectedModelName && (
                <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {selectedRecord.nodeId === 'node_bill_ocr' ? 'OCR ENGINE / RUNTIME' : 'SELECTED MODEL'}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedRecord.selectedModelName}
                      </span>
                    </div>
                    {selectedRecord.scoreBreakdown && !selectedRecord.selectedModelName.includes('Tesseract') && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--accent-cyan)' }}
                        onClick={() => setExplainModalOpen(true)}
                      >
                        Why this model? ↗
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                      <span className={`location-badge ${selectedRecord.executionLocation}`}>
                        {selectedRecord.executionLocation}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Memory: </span>
                      <span>{selectedRecord.ramConsumedMb || 0} MB</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
                      <span>{selectedRecord.latencyMs || 0} ms</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cache Hit: </span>
                      <span style={{ color: selectedRecord.cacheHit ? '#34d399' : 'inherit' }}>
                        {selectedRecord.cacheHit ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Execution Console Logs */}
              <div>
                <span className="stat-label">Telemetry & Node Logs</span>
                <div className="step-log-console">
                  {selectedRecord.logLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              {/* Step Output Inspector */}
              {selectedRecord.outputData && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="stat-label">Intermediate Output Result</span>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                      onClick={() => setInspectedOutput(selectedRecord.outputData)}
                    >
                      Expand View
                    </button>
                  </div>
                  <pre className="code-view" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                    {typeof selectedRecord.outputData === 'string'
                      ? selectedRecord.outputData
                      : JSON.stringify(selectedRecord.outputData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Select a step from the execution timeline to inspect diagnostics.
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
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Detailed Step Output</h3>
              <button className="btn-secondary" onClick={() => setInspectedOutput(null)}>✕</button>
            </div>
            <div className="modal-body">
              <pre className="code-view" style={{ maxHeight: '500px' }}>
                {typeof inspectedOutput === 'string' ? inspectedOutput : JSON.stringify(inspectedOutput, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setInspectedOutput(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
