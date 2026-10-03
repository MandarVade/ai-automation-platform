import React, { useState } from 'react';
import { CreateScreen } from '../screens/CreateScreen';
import { VisualBuilderScreen } from '../screens/VisualBuilderScreen';
import { Workflow } from '../../types/workflow';
import { Sparkles, GitBranch } from 'lucide-react';

interface StudioScreenProps {
  initialPrompt?: string;
  initialWorkflow?: Workflow;
  onRunWorkflow: (wf: Workflow) => void;
  activeSubView?: 'create' | 'builder';
}

export const StudioScreen: React.FC<StudioScreenProps> = ({
  initialPrompt,
  initialWorkflow,
  onRunWorkflow,
  activeSubView = 'builder',
}) => {
  const [mode, setMode] = useState<'create' | 'builder'>(activeSubView);
  const [workflow, setWorkflow] = useState<Workflow | undefined>(initialWorkflow);

  const handleEditInVisualBuilder = (wf: Workflow) => {
    setWorkflow(wf);
    setMode('builder');
  };

  return (
    <div className="el-studio-container">
      {/* Studio Sub-Navigation Bar (Phase 2 transitional selector) */}
      <div className="el-studio-subnav">
        <div className="el-studio-subnav__group">
          <button
            type="button"
            className={`el-studio-subnav__tab ${mode === 'builder' ? 'el-studio-subnav__tab--active' : ''}`}
            onClick={() => setMode('builder')}
          >
            <GitBranch size={14} />
            <span>Visual DAG Builder</span>
          </button>
          <button
            type="button"
            className={`el-studio-subnav__tab ${mode === 'create' ? 'el-studio-subnav__tab--active' : ''}`}
            onClick={() => setMode('create')}
          >
            <Sparkles size={14} />
            <span>Natural Language Planner</span>
          </button>
        </div>
        <div className="el-studio-subnav__hint">
          <span>Phase 2 Transitional Studio</span>
        </div>
      </div>

      {/* Render selected creator/builder experience without altering internal logic */}
      <div className="el-studio-content">
        {mode === 'create' ? (
          <CreateScreen
            initialPrompt={initialPrompt}
            onRunWorkflow={onRunWorkflow}
            onEditInVisualBuilder={handleEditInVisualBuilder}
          />
        ) : (
          <VisualBuilderScreen
            initialWorkflow={workflow || initialWorkflow}
            onRunWorkflow={onRunWorkflow}
          />
        )}
      </div>
    </div>
  );
};
