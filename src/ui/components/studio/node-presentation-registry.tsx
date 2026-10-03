import React from 'react';
import {
  Camera,
  Mic,
  Play,
  FileText,
  Bot,
  Sparkles,
  Database,
  Bell,
  Save,
  Layers,
  Filter,
  ArrowRightLeft,
  Calendar,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { NodeCapability, NodeType } from '../../../types/workflow';

export interface NodePresentation {
  icon: React.ReactNode;
  categoryLabel: string;
  dataFlowDescription: string;
  colorToken?: string;
}

export const getNodePresentation = (
  type: NodeType,
  capability: NodeCapability
): NodePresentation => {
  switch (capability) {
    // Triggers
    case 'CAMERA_CAPTURE':
      return {
        icon: <Camera size={13} />,
        categoryLabel: 'Hardware Trigger',
        dataFlowDescription: 'Hardware Camera → Image Buffer',
      };
    case 'AUDIO_RECORD':
      return {
        icon: <Mic size={13} />,
        categoryLabel: 'Hardware Trigger',
        dataFlowDescription: 'Microphone → Audio Stream',
      };
    case 'MANUAL':
      return {
        icon: <Play size={13} />,
        categoryLabel: 'Manual Trigger',
        dataFlowDescription: 'User Input → Text/Intent',
      };
    case 'FILE_PICKER':
      return {
        icon: <FileText size={13} />,
        categoryLabel: 'Storage Trigger',
        dataFlowDescription: 'Document Provider → File',
      };
    case 'NOTIFICATION_ACTION':
      return {
        icon: <Bell size={13} />,
        categoryLabel: 'System Trigger',
        dataFlowDescription: 'Action Tap → Intent',
      };
    case 'SCHEDULED':
      return {
        icon: <Calendar size={13} />,
        categoryLabel: 'Scheduler Trigger',
        dataFlowDescription: 'AlarmManager → Wakeup Event',
      };

    // AI Capabilities
    case 'OCR':
      return {
        icon: <FileText size={13} />,
        categoryLabel: 'Vision Inference',
        dataFlowDescription: 'Image → Extracted Text',
      };
    case 'SPEECH_TO_TEXT':
      return {
        icon: <Mic size={13} />,
        categoryLabel: 'Audio Inference',
        dataFlowDescription: 'Audio Stream → Text',
      };
    case 'SUMMARIZATION':
      return {
        icon: <Bot size={13} />,
        categoryLabel: 'Language Model',
        dataFlowDescription: 'Long Text → Concise Summary',
      };
    case 'CONCEPT_EXTRACTION':
      return {
        icon: <Bot size={13} />,
        categoryLabel: 'Entity Extraction',
        dataFlowDescription: 'Text → Structured Entities',
      };
    case 'QUESTION_GENERATION':
      return {
        icon: <HelpCircle size={13} />,
        categoryLabel: 'Synthetic Evaluation',
        dataFlowDescription: 'Text → 5-Question Quiz JSON',
      };
    case 'EXPENSE_CATEGORIZATION':
      return {
        icon: <Sparkles size={13} />,
        categoryLabel: 'Finance Classifier',
        dataFlowDescription: 'Line Items → Budget Category',
      };
    case 'PLANT_DISEASE_DIAGNOSIS':
      return {
        icon: <Bot size={13} />,
        categoryLabel: 'AgroVision Classifier',
        dataFlowDescription: 'Foliage Image → Pathology Diagnosis',
      };
    case 'IMAGE_UNDERSTANDING':
      return {
        icon: <Camera size={13} />,
        categoryLabel: 'Multimodal Vision',
        dataFlowDescription: 'Image → Visual Description',
      };
    case 'TASK_EXTRACTION':
      return {
        icon: <CheckCircle size={13} />,
        categoryLabel: 'Action Parser',
        dataFlowDescription: 'Notes → Structured Tasks',
      };

    // Transforms
    case 'CALCULATE_TOTAL':
      return {
        icon: <Sparkles size={13} />,
        categoryLabel: 'Arithmetic Transform',
        dataFlowDescription: 'Item Text → Validated Arithmetic',
      };
    case 'STRUCTURED_JSON_MAP':
      return {
        icon: <ArrowRightLeft size={13} />,
        categoryLabel: 'Schema Transform',
        dataFlowDescription: 'Raw Text → Normalized JSON',
      };
    case 'TEXT_FORMATTER':
      return {
        icon: <FileText size={13} />,
        categoryLabel: 'Formatting',
        dataFlowDescription: 'String Template → Formatted Text',
      };
    case 'FILTER':
      return {
        icon: <Filter size={13} />,
        categoryLabel: 'Predicate Filter',
        dataFlowDescription: 'Collection → Filtered Subset',
      };
    case 'AGGREGATE':
      return {
        icon: <Layers size={13} />,
        categoryLabel: 'Aggregation',
        dataFlowDescription: 'Stream Items → Batched Object',
      };

    // Android Actions
    case 'EXPENSE_TRACKER_STORE':
      return {
        icon: <Database size={13} />,
        categoryLabel: 'Android Database',
        dataFlowDescription: 'Audited Expense → SQLite Room DB',
      };
    case 'NOTIFICATION_EMIT':
      return {
        icon: <Bell size={13} />,
        categoryLabel: 'Android System',
        dataFlowDescription: 'Result Text → System Notification',
      };
    case 'SAVE_FILE':
      return {
        icon: <Save size={13} />,
        categoryLabel: 'Android Storage',
        dataFlowDescription: 'Result Data → Scoped Document',
      };
    case 'SHARE_INTENT':
      return {
        icon: <ArrowRightLeft size={13} />,
        categoryLabel: 'Android Interop',
        dataFlowDescription: 'Payload → Android Share Sheet',
      };
    case 'CARE_PLAN_STORE':
      return {
        icon: <Database size={13} />,
        categoryLabel: 'Android Database',
        dataFlowDescription: 'Botany Schedule → Local DB',
      };
    case 'STUDY_NOTES_STORE':
      return {
        icon: <Database size={13} />,
        categoryLabel: 'Android Database',
        dataFlowDescription: 'Study Cards → Local DB',
      };

    default:
      return {
        icon: <Layers size={13} />,
        categoryLabel: type,
        dataFlowDescription: 'Generic Node Processing',
      };
  }
};
