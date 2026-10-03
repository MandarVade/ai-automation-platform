import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowNode } from '../../../types/workflow';
import { Cpu, Camera, Mic, Play, FileText, Bot, Sparkles, Database, Bell, Save, Layers } from 'lucide-react';

export interface WorkflowNodeData {
  node: WorkflowNode;
  isSource?: boolean;
  hasErrors?: boolean;
}

const getCapabilityIcon = (capability: string) => {
  switch (capability) {
    case 'CAMERA_CAPTURE':
      return <Camera size={13} />;
    case 'AUDIO_RECORD':
      return <Mic size={13} />;
    case 'MANUAL':
      return <Play size={13} />;
    case 'OCR':
      return <FileText size={13} />;
    case 'SPEECH_TO_TEXT':
      return <Mic size={13} />;
    case 'SUMMARIZATION':
    case 'CONCEPT_EXTRACTION':
    case 'QUESTION_GENERATION':
    case 'PLANT_DISEASE_DIAGNOSIS':
      return <Bot size={13} />;
    case 'CALCULATE_TOTAL':
    case 'STRUCTURED_JSON_MAP':
      return <Sparkles size={13} />;
    case 'EXPENSE_TRACKER_STORE':
    case 'CARE_PLAN_STORE':
    case 'STUDY_NOTES_STORE':
      return <Database size={13} />;
    case 'NOTIFICATION_EMIT':
      return <Bell size={13} />;
    case 'SAVE_FILE':
      return <Save size={13} />;
    default:
      return <Layers size={13} />;
  }
};

export const WorkflowCanvasNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const node = nodeData.node;
  const hasInputs = node.inputTypes && node.inputTypes.length > 0;

  return (
    <div
      className={`el-flow-node ${selected ? 'el-flow-node--selected' : ''} ${
        nodeData.hasErrors ? 'el-flow-node--error' : ''
      }`}
    >
      {/* Target Connection Handle (Top) */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          className="el-flow-node__handle el-flow-node__handle--target"
        />
      )}

      {/* Node Header */}
      <div className="el-flow-node__header">
        <div className="el-flow-node__icon">{getCapabilityIcon(node.capability)}</div>
        <div className="el-flow-node__type-badge">{node.type}</div>
        <div className="el-flow-node__policy-badge">
          {node.executionPolicy === 'AUTO' ? 'AUTO' : node.executionPolicy.replace('FORCE_', '')}
        </div>
      </div>

      {/* Node Title & Description */}
      <div className="el-flow-node__body">
        <div className="el-flow-node__label">{node.label}</div>
        <div className="el-flow-node__capability">{node.capability}</div>
      </div>

      {/* Node Footer: I/O and Model */}
      <div className="el-flow-node__footer">
        <span className="el-flow-node__io">
          {node.outputType}
        </span>
        {node.assignedModelId && (
          <span className="el-flow-node__model" title={`Model: ${node.assignedModelId}`}>
            <Cpu size={10} />
            <span>{node.assignedModelId.split('/').pop()}</span>
          </span>
        )}
      </div>

      {/* Source Connection Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="el-flow-node__handle el-flow-node__handle--source"
      />
    </div>
  );
});

WorkflowCanvasNode.displayName = 'WorkflowCanvasNode';
