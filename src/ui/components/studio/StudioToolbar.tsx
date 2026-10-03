import React from 'react';
import { Button, Tooltip } from '../ui';
import {
  Plus,
  Play,
  CheckCircle,
  AlertTriangle,
  Undo2,
  Redo2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ValidationResult } from '../../../types/workflow';

export interface StudioToolbarProps {
  workflowName: string;
  validation: ValidationResult;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenAddNode: () => void;
  onTogglePrompt: () => void;
  onToggleMobileInspector: () => void;
  onRunWorkflow: () => void;
  selectedNodeCount: number;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  workflowName,
  validation,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenAddNode,
  onTogglePrompt,
  onToggleMobileInspector,
  onRunWorkflow,
  selectedNodeCount,
}) => {
  return (
    <div className="el-studio-toolbar">
      {/* Left: Workflow context & generator toggle */}
      <div className="el-studio-toolbar__left">
        <div className="el-studio-toolbar__title-group">
          <span className="el-studio-toolbar__title">{workflowName}</span>
          {validation.isValid ? (
            <span className="el-studio-toolbar__status el-studio-toolbar__status--valid" title="Valid DAG Schema">
              <CheckCircle size={12} />
              <span>Valid DAG</span>
            </span>
          ) : (
            <span
              className="el-studio-toolbar__status el-studio-toolbar__status--error"
              title={validation.diagnostics.map((d) => d.message).join(' | ')}
            >
              <AlertTriangle size={12} />
              <span>{validation.diagnostics.length} Issues</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Editing tools */}
      <div className="el-studio-toolbar__center">
        <Tooltip content="Describe automation in natural language" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePrompt}
            leftIcon={<Sparkles size={13} style={{ color: 'var(--color-accent)' }} />}
          >
            <span>Describe</span>
          </Button>
        </Tooltip>

        <div className="el-studio-toolbar__divider" />

        <Tooltip content="Add a new node" position="bottom">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddNode}
            leftIcon={<Plus size={13} />}
          >
            <span>Add Node</span>
          </Button>
        </Tooltip>

        <div className="el-studio-toolbar__divider" />

        <Tooltip content="Undo change (Ctrl+Z)" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 size={13} />
          </Button>
        </Tooltip>

        <Tooltip content="Redo change (Ctrl+Shift+Z)" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 size={13} />
          </Button>
        </Tooltip>

        <div className="el-studio-toolbar__mobile-inspector-btn">
          <Button
            variant={selectedNodeCount > 0 ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onToggleMobileInspector}
            leftIcon={<Sliders size={13} />}
          >
            <span>Inspector</span>
          </Button>
        </div>
      </div>

      {/* Right: Primary Run Action */}
      <div className="el-studio-toolbar__right">
        <Button
          variant="primary"
          size="sm"
          onClick={onRunWorkflow}
          disabled={!validation.isValid}
          leftIcon={<Play size={13} />}
          title={validation.isValid ? 'Execute workflow pipeline' : 'Fix validation issues before execution'}
        >
          <span>Run</span>
        </Button>
      </div>
    </div>
  );
};
