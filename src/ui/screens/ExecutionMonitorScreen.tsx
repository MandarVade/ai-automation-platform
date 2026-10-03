import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import { WorkflowExecutionReport } from '../../types/execution';
import { WorkflowEngine } from '../../core/workflow/engine';
import { ExecutionHistoryStore } from '../../data/history-store';
import { NotificationActionController } from '../../core/notification/notification-controller';
import { ExecutionDetailView } from '../components/execution/ExecutionDetailView';

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

  // Input Presets
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
    const unsub = engine.subscribe((rep, node) => {
      setReport(rep);
      setActiveNodeId(node);

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

  return (
    <ExecutionDetailView
      workflow={workflow}
      report={report}
      activeNodeId={activeNodeId}
      onBack={onBackToBuilder}
      onReExecute={() => startRun()}
      isLiveMode={true}
      selectedPreset={selectedPreset}
      onSelectPreset={handleSelectPreset}
      onFileUpload={handleFileUpload}
    />
  );
};
