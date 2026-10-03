import React, { useState } from 'react';
import { NodeType, NodeCapability, DataType } from '../../../types/workflow';
import { Dialog, Input, Button } from '../ui';
import { Search, Plus, Sparkles, Camera, Mic, Play, FileText, Bot, Database, Bell, Save } from 'lucide-react';

export interface NodeTemplate {
  type: NodeType;
  capability: NodeCapability;
  label: string;
  description: string;
  inputTypes: DataType[];
  outputType: DataType;
  icon: React.ReactNode;
}

const AVAILABLE_CAPABILITIES: NodeTemplate[] = [
  // Triggers
  {
    type: 'TRIGGER',
    capability: 'CAMERA_CAPTURE',
    label: 'Camera Capture',
    description: 'Capture photo or document from Android device hardware camera',
    inputTypes: [],
    outputType: 'IMAGE',
    icon: <Camera size={14} />,
  },
  {
    type: 'TRIGGER',
    capability: 'AUDIO_RECORD',
    label: 'Audio Record',
    description: 'Record streaming voice note or lecture via microphone',
    inputTypes: [],
    outputType: 'AUDIO_STREAM',
    icon: <Mic size={14} />,
  },
  {
    type: 'TRIGGER',
    capability: 'MANUAL',
    label: 'Manual Trigger',
    description: 'Manual button initiation or text input',
    inputTypes: [],
    outputType: 'TEXT',
    icon: <Play size={14} />,
  },
  // AI
  {
    type: 'AI',
    capability: 'OCR',
    label: 'OCR Scanner',
    description: 'Extract raw text, receipt totals, or printed documents via on-device Tesseract/Gemini Nano',
    inputTypes: ['IMAGE'],
    outputType: 'TEXT',
    icon: <FileText size={14} />,
  },
  {
    type: 'AI',
    capability: 'SPEECH_TO_TEXT',
    label: 'Speech Recognition',
    description: 'Transcribe spoken audio into high-accuracy structured text',
    inputTypes: ['AUDIO_STREAM'],
    outputType: 'TEXT',
    icon: <Mic size={14} />,
  },
  {
    type: 'AI',
    capability: 'SUMMARIZATION',
    label: 'Summarizer',
    description: 'Condense long articles, lecture notes, or transcripts',
    inputTypes: ['TEXT'],
    outputType: 'TEXT',
    icon: <Bot size={14} />,
  },
  {
    type: 'AI',
    capability: 'CONCEPT_EXTRACTION',
    label: 'Concept Parser',
    description: 'Extract key taxonomy concepts, terms, and structured entities',
    inputTypes: ['TEXT'],
    outputType: 'STRUCTURED_JSON',
    icon: <Bot size={14} />,
  },
  {
    type: 'AI',
    capability: 'QUESTION_GENERATION',
    label: 'Quiz Generator',
    description: 'Synthesize multiple-choice study questions from concepts',
    inputTypes: ['TEXT'],
    outputType: 'STRUCTURED_JSON',
    icon: <Bot size={14} />,
  },
  {
    type: 'AI',
    capability: 'PLANT_DISEASE_DIAGNOSIS',
    label: 'Plant Doctor',
    description: 'Detect visual botanical pathology and diagnose crop symptoms',
    inputTypes: ['IMAGE'],
    outputType: 'STRUCTURED_JSON',
    icon: <Bot size={14} />,
  },
  // Transforms
  {
    type: 'TRANSFORM',
    capability: 'CALCULATE_TOTAL',
    label: 'Sum Item Prices',
    description: 'Compute arithmetic sums, taxes, and subtotal validation',
    inputTypes: ['TEXT'],
    outputType: 'STRUCTURED_JSON',
    icon: <Sparkles size={14} />,
  },
  {
    type: 'TRANSFORM',
    capability: 'STRUCTURED_JSON_MAP',
    label: 'Schema Transform',
    description: 'Map extracted attributes into normalized JSON schema',
    inputTypes: ['TEXT'],
    outputType: 'STRUCTURED_JSON',
    icon: <Sparkles size={14} />,
  },
  // Android Actions
  {
    type: 'ANDROID_ACTION',
    capability: 'EXPENSE_TRACKER_STORE',
    label: 'Save Expense DB',
    description: 'Persist audited receipt record into local SQLite / Jetpack Room database',
    inputTypes: ['STRUCTURED_JSON'],
    outputType: 'STRUCTURED_JSON',
    icon: <Database size={14} />,
  },
  {
    type: 'ANDROID_ACTION',
    capability: 'NOTIFICATION_EMIT',
    label: 'Android Notification',
    description: 'Post persistent or interactive Android system notification',
    inputTypes: ['ANY'],
    outputType: 'TEXT',
    icon: <Bell size={14} />,
  },
  {
    type: 'ANDROID_ACTION',
    capability: 'SAVE_FILE',
    label: 'Save File',
    description: 'Write resulting document or JSON to device scoped storage',
    inputTypes: ['TEXT'],
    outputType: 'TEXT',
    icon: <Save size={14} />,
  },
];

export interface AddNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onAddNode: (template: NodeTemplate) => void;
}

export const AddNodeDialog: React.FC<AddNodeDialogProps> = ({
  open,
  onClose,
  onAddNode,
}) => {
  const [search, setSearch] = useState('');

  const filtered = AVAILABLE_CAPABILITIES.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.capability.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Workflow Node"
      description="Select from verified on-device capabilities, transforms, and Android system actions."
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          placeholder="Search node capabilities..."
          leftIcon={<Search size={14} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="el-node-picker__list">
          {filtered.map((item) => (
            <div
              key={item.capability}
              className="el-node-picker__item"
              onClick={() => {
                onAddNode(item);
                onClose();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onAddNode(item);
                  onClose();
                }
              }}
            >
              <div className="el-node-picker__item-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="el-node-picker__item-icon">{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </span>
                </div>
                <span className="el-node-picker__item-badge">{item.type}</span>
              </div>
              <p className="el-node-picker__item-desc">{item.description}</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                <span>In: {item.inputTypes.length ? item.inputTypes.join(', ') : 'None'}</span>
                <span>•</span>
                <span>Out: {item.outputType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
