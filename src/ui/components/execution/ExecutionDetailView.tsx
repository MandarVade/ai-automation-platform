import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowNode } from '../../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../../types/execution';
import { ExecutionResultCard } from './ExecutionResultCard';
import { ExecutionSummaryBar } from './ExecutionSummaryBar';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ExecutionStepDetails } from './ExecutionStepDetails';
import { ExplainabilityModal } from '../ExplainabilityModal';
import { Sheet, Button } from '../ui';
import { Image as ImageIcon, SlidersHorizontal, ChevronRight } from 'lucide-react';

export interface ExecutionDetailViewProps {
  workflow: Workflow;
  report: WorkflowExecutionReport | null;
  activeNodeId?: string;
  onBack: () => void;
  onReExecute?: () => void;
  // Optional live upload/preset controls
  isLiveMode?: boolean;
  selectedPreset?: string;
  onSelectPreset?: (key: string) => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ExecutionDetailView: React.FC<ExecutionDetailViewProps> = ({
  workflow,
  report,
  activeNodeId,
  onBack,
  onReExecute,
  isLiveMode = false,
  selectedPreset = 'preset_coffee',
  onSelectPreset,
  onFileUpload,
}) => {
  // Currently selected step for deep inspection
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    workflow.nodes[0]?.id || ''
  );

  // Mobile drawer state
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  // Model explanation modal state
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  // Auto-select active node when engine runs
  useEffect(() => {
    if (activeNodeId) {
      setSelectedNodeId(activeNodeId);
    }
  }, [activeNodeId]);

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) || workflow.nodes[0];
  const selectedRecord: NodeExecutionRecord | undefined = report?.nodeRecords[selectedNode?.id || ''];

  const handleStepSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // On mobile screens, open drawer sheet
    if (window.innerWidth <= 900) {
      setMobileDetailsOpen(true);
    }
  };

  return (
    <div className="el-exec-detail-view" role="main" aria-label={`Execution of ${workflow.name}`}>
      {/* 1. Result Card (Human Outcome First) */}
      <ExecutionResultCard
        workflow={workflow}
        report={report}
        activeNodeId={activeNodeId}
        onBack={onBack}
        onReExecute={onReExecute || (() => {})}
        onViewFinalOutput={() => {
          const lastNode = workflow.nodes[workflow.nodes.length - 1];
          if (lastNode) handleStepSelect(lastNode.id);
        }}
      />

      {/* 2. Execution Summary Bar (Steps, Duration, Times) */}
      <ExecutionSummaryBar
        totalSteps={workflow.nodes.length}
        report={report}
      />

      {/* 3. Live Input Source Controls (Subordinate & Collapsible in Live Mode) */}
      {isLiveMode && (
        <div className="el-exec-input-bar">
          <div className="el-exec-input-bar__left">
            <span className="el-exec-input-bar__label">Input Source:</span>
            <label className="el-exec-input-bar__upload-btn">
              <ImageIcon size={13} aria-hidden="true" />
              <span>Upload Custom Image</span>
              <input
                id="real-image-input"
                type="file"
                accept="image/*"
                onChange={onFileUpload}
                style={{ display: 'none' }}
                aria-label="Upload custom user receipt or document image"
              />
            </label>

            {onSelectPreset && (
              <div className="el-exec-input-bar__presets">
                <span className="el-exec-input-bar__preset-label">Presets:</span>
                <button
                  type="button"
                  className={`el-exec-preset-chip ${selectedPreset === 'preset_coffee' ? 'el-exec-preset-chip--active' : ''}`}
                  onClick={() => onSelectPreset('preset_coffee')}
                >
                  Coffee ($10.53)
                </button>
                <button
                  type="button"
                  className={`el-exec-preset-chip ${selectedPreset === 'preset_bookstore' ? 'el-exec-preset-chip--active' : ''}`}
                  onClick={() => onSelectPreset('preset_bookstore')}
                >
                  Books ($48.06)
                </button>
                <button
                  type="button"
                  className={`el-exec-preset-chip ${selectedPreset === 'preset_market' ? 'el-exec-preset-chip--active' : ''}`}
                  onClick={() => onSelectPreset('preset_market')}
                >
                  Market ($11.61)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Split Timeline & Step Inspector */}
      <div className="el-exec-split-container">
        {/* Left Column: Timeline */}
        <div className="el-exec-split-left">
          <ExecutionTimeline
            workflow={workflow}
            report={report}
            activeNodeId={activeNodeId}
            selectedNodeId={selectedNode?.id}
            onSelectStep={handleStepSelect}
          />
        </div>

        {/* Right Column: Step Details Panel (Desktop) */}
        <div className="el-exec-split-right">
          {selectedNode && (
            <ExecutionStepDetails
              node={selectedNode}
              record={selectedRecord}
              onExplainModel={() => setExplainModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Mobile Step Details Sheet Drawer */}
      <Sheet
        open={mobileDetailsOpen}
        onClose={() => setMobileDetailsOpen(false)}
        title={selectedNode?.label || 'Step Details'}
        side="bottom"
      >
        {selectedNode && (
          <div style={{ padding: 'var(--space-2) 0' }}>
            <ExecutionStepDetails
              node={selectedNode}
              record={selectedRecord}
              onExplainModel={() => setExplainModalOpen(true)}
            />
          </div>
        )}
      </Sheet>

      {/* Model Explainability Modal */}
      <ExplainabilityModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        breakdown={selectedRecord?.scoreBreakdown}
      />
    </div>
  );
};
