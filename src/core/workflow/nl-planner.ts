import { Workflow, WorkflowNode, WorkflowEdge, DataType } from '../../types/workflow';
import { DAGValidator } from './dag-validator';

export interface NLIntentAnalysis {
  userPrompt: string;
  detectedDomain: 'FINANCE' | 'EDUCATION' | 'HEALTHCARE' | 'PRODUCTIVITY' | 'GENERAL';
  extractedSlots: {
    trigger: string;
    aiCapabilities: string[];
    transforms: string[];
    actions: string[];
  };
  analysisSteps: string[];
  generatedWorkflow: Workflow;
}

export class NLWorkflowPlanner {
  public static planFromPrompt(prompt: string): NLIntentAnalysis {
    const lower = prompt.toLowerCase();
    const analysisSteps: string[] = [];
    const extractedAI: string[] = [];
    const extractedTransforms: string[] = [];
    const extractedActions: string[] = [];

    let domain: 'FINANCE' | 'EDUCATION' | 'HEALTHCARE' | 'PRODUCTIVITY' | 'GENERAL' = 'GENERAL';
    let triggerCapability: 'CAMERA_CAPTURE' | 'AUDIO_RECORD' | 'FILE_PICKER' | 'MANUAL' = 'MANUAL';

    // 1. Detect Trigger
    if (lower.includes('photo') || lower.includes('camera') || lower.includes('picture') || lower.includes('scan')) {
      triggerCapability = 'CAMERA_CAPTURE';
      analysisSteps.push('✓ Visual capture trigger detected: Android Camera');
    } else if (lower.includes('record') || lower.includes('audio') || lower.includes('voice') || lower.includes('lecture') || lower.includes('meeting')) {
      triggerCapability = 'AUDIO_RECORD';
      analysisSteps.push('✓ Acoustic capture trigger detected: Android Audio Recorder');
    } else if (lower.includes('file') || lower.includes('pdf') || lower.includes('upload') || lower.includes('document')) {
      triggerCapability = 'FILE_PICKER';
      analysisSteps.push('✓ Storage trigger detected: Android Document Provider');
    } else {
      triggerCapability = 'MANUAL';
      analysisSteps.push('✓ Execution trigger: Manual launch / Quick Tile');
    }

    // 2. Domain & AI Capability Classification
    if (lower.includes('bill') || lower.includes('receipt') || lower.includes('expense') || lower.includes('total') || lower.includes('price')) {
      domain = 'FINANCE';
      extractedAI.push('OCR', 'EXPENSE_CATEGORIZATION');
      extractedTransforms.push('CALCULATE_TOTAL');
      extractedActions.push('EXPENSE_TRACKER_STORE', 'NOTIFICATION_EMIT');

      analysisSteps.push('✓ Domain identified: Finance & Document Processing');
      analysisSteps.push('✓ AI capability required: Optical Character Recognition (OCR)');
      analysisSteps.push('✓ Data transformation required: Numeric Calculation & Summation');
      analysisSteps.push('✓ AI capability required: Expense Categorization & Merchant Extraction');
      analysisSteps.push('✓ Android Action required: Write to Expense Ledger DB & Notification');
    } else if (lower.includes('lecture') || lower.includes('study') || lower.includes('notes') || lower.includes('quiz') || lower.includes('question')) {
      domain = 'EDUCATION';
      extractedAI.push('SPEECH_TO_TEXT', 'CONCEPT_EXTRACTION', 'SUMMARIZATION', 'QUESTION_GENERATION');
      extractedActions.push('STUDY_NOTES_STORE', 'NOTIFICATION_EMIT');

      analysisSteps.push('✓ Domain identified: Education & Academic Synthesis');
      analysisSteps.push('✓ AI capability required: Speech-to-Text (Acoustic Transcription)');
      analysisSteps.push('✓ AI capability required: Important Concept & Taxonomy Extraction');
      analysisSteps.push('✓ AI capability required: Generative Study Note Summarization');
      analysisSteps.push('✓ AI capability required: 5-Question Quiz Generation');
      analysisSteps.push('✓ Android Action required: Save Notes to App Sandbox & Emit Notification');
    } else if (lower.includes('plant') || lower.includes('disease') || lower.includes('symptom') || lower.includes('leaf') || lower.includes('treatment') || lower.includes('care plan')) {
      domain = 'HEALTHCARE';
      extractedAI.push('PLANT_DISEASE_DIAGNOSIS', 'SUMMARIZATION');
      extractedActions.push('CARE_PLAN_STORE', 'NOTIFICATION_EMIT');

      analysisSteps.push('✓ Domain identified: Botanical Healthcare & Computer Vision');
      analysisSteps.push('✓ AI capability required: Plant Pathology Computer Vision');
      analysisSteps.push('✓ AI capability required: Treatment Protocol Synthesis');
      analysisSteps.push('✓ Android Action required: Store Care Plan & Notify User');
    } else if (lower.includes('meeting') || lower.includes('action item') || lower.includes('task') || lower.includes('productivity')) {
      domain = 'PRODUCTIVITY';
      extractedAI.push('SPEECH_TO_TEXT', 'SUMMARIZATION', 'TASK_EXTRACTION');
      extractedActions.push('SAVE_FILE', 'NOTIFICATION_EMIT');

      analysisSteps.push('✓ Domain identified: Productivity & Meeting Operations');
      analysisSteps.push('✓ AI capability required: Speech-to-Text Transcription');
      analysisSteps.push('✓ AI capability required: Executive Summary Synthesis');
      analysisSteps.push('✓ AI capability required: Action Item & Task Extraction');
      analysisSteps.push('✓ Android Action required: Save Markdown Report & Emit Notification');
    } else {
      domain = 'GENERAL';
      extractedAI.push('SUMMARIZATION');
      extractedActions.push('NOTIFICATION_EMIT');
      analysisSteps.push('✓ General AI transformation pipeline planned');
    }

    // 3. Assemble typed nodes & edges
    const workflow = this.constructWorkflow(prompt, domain, triggerCapability, extractedAI, extractedTransforms, extractedActions);

    // 4. Validate DAG
    const validation = DAGValidator.validate(workflow);
    if (!validation.isValid) {
      analysisSteps.push(`⚠️ Plan adjusted: ${validation.diagnostics.map((d) => d.message).join('; ')}`);
    } else {
      analysisSteps.push(`✓ Structured DAG validated: ${workflow.nodes.length} nodes, ${workflow.edges.length} edges in acyclic sequence.`);
    }

    return {
      userPrompt: prompt,
      detectedDomain: domain,
      extractedSlots: {
        trigger: triggerCapability,
        aiCapabilities: extractedAI,
        transforms: extractedTransforms,
        actions: extractedActions
      },
      analysisSteps,
      generatedWorkflow: workflow
    };
  }

  private static constructWorkflow(
    prompt: string,
    domain: 'FINANCE' | 'EDUCATION' | 'HEALTHCARE' | 'PRODUCTIVITY' | 'GENERAL',
    triggerCapability: any,
    aiCaps: string[],
    transforms: string[],
    actions: string[]
  ): Workflow {
    const id = `wf_${Date.now()}`;
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];

    let currentX = 80;
    const yCenter = 160;

    // Node 1: Trigger
    const triggerNodeId = 'trigger_01';
    nodes.push({
      id: triggerNodeId,
      label: triggerCapability === 'CAMERA_CAPTURE' ? 'Camera Capture' : triggerCapability === 'AUDIO_RECORD' ? 'Record Audio' : 'Manual Trigger',
      type: 'TRIGGER',
      capability: triggerCapability,
      inputTypes: [],
      outputType: triggerCapability === 'CAMERA_CAPTURE' ? 'IMAGE' : triggerCapability === 'AUDIO_RECORD' ? 'AUDIO_STREAM' : 'TEXT',
      dependencies: [],
      config: {},
      executionPolicy: 'AUTO',
      position: { x: currentX, y: yCenter }
    });

    let prevNodeId = triggerNodeId;
    let prevOutputType: DataType = nodes[0].outputType;

    // Build specific domain pipelines for maximum semantic precision
    if (domain === 'FINANCE') {
      currentX += 220;
      const ocrNodeId = 'ai_ocr';
      nodes.push({
        id: ocrNodeId,
        label: 'Optical Character Recognition',
        type: 'AI',
        capability: 'OCR',
        inputTypes: ['IMAGE'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${ocrNodeId}`, sourceNodeId: prevNodeId, targetNodeId: ocrNodeId, dataType: 'IMAGE' });
      prevNodeId = ocrNodeId;

      currentX += 220;
      const calcNodeId = 'transform_calc';
      nodes.push({
        id: calcNodeId,
        label: 'Calculate Itemized Total',
        type: 'TRANSFORM',
        capability: 'CALCULATE_TOTAL',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${calcNodeId}`, sourceNodeId: prevNodeId, targetNodeId: calcNodeId, dataType: 'TEXT' });
      prevNodeId = calcNodeId;

      currentX += 220;
      const catNodeId = 'ai_categorize';
      nodes.push({
        id: catNodeId,
        label: 'Categorize Expense & Merchant',
        type: 'AI',
        capability: 'EXPENSE_CATEGORIZATION',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${catNodeId}`, sourceNodeId: prevNodeId, targetNodeId: catNodeId, dataType: 'STRUCTURED_JSON' });
      prevNodeId = catNodeId;

      currentX += 220;
      const saveNodeId = 'action_save_expense';
      nodes.push({
        id: saveNodeId,
        label: 'Save to Expense Tracker',
        type: 'ANDROID_ACTION',
        capability: 'EXPENSE_TRACKER_STORE',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${saveNodeId}`, sourceNodeId: prevNodeId, targetNodeId: saveNodeId, dataType: 'STRUCTURED_JSON' });
    } else if (domain === 'EDUCATION') {
      currentX += 220;
      const sttNodeId = 'ai_stt';
      nodes.push({
        id: sttNodeId,
        label: 'Speech-to-Text Transcription',
        type: 'AI',
        capability: 'SPEECH_TO_TEXT',
        inputTypes: ['AUDIO_STREAM'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${sttNodeId}`, sourceNodeId: prevNodeId, targetNodeId: sttNodeId, dataType: 'AUDIO_STREAM' });
      prevNodeId = sttNodeId;

      currentX += 220;
      const conceptNodeId = 'ai_concepts';
      nodes.push({
        id: conceptNodeId,
        label: 'Extract Core Concepts',
        type: 'AI',
        capability: 'CONCEPT_EXTRACTION',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter - 70 }
      });
      edges.push({ id: `e_${prevNodeId}_${conceptNodeId}`, sourceNodeId: prevNodeId, targetNodeId: conceptNodeId, dataType: 'TEXT' });

      const summaryNodeId = 'ai_summary';
      nodes.push({
        id: summaryNodeId,
        label: 'Generate Study Notes',
        type: 'AI',
        capability: 'SUMMARIZATION',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter + 70 }
      });
      edges.push({ id: `e_${prevNodeId}_${summaryNodeId}`, sourceNodeId: prevNodeId, targetNodeId: summaryNodeId, dataType: 'TEXT' });

      currentX += 220;
      const quizNodeId = 'ai_quiz';
      nodes.push({
        id: quizNodeId,
        label: 'Generate 5 Quiz Questions',
        type: 'AI',
        capability: 'QUESTION_GENERATION',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [summaryNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${summaryNodeId}_${quizNodeId}`, sourceNodeId: summaryNodeId, targetNodeId: quizNodeId, dataType: 'TEXT' });

      currentX += 220;
      const saveActionId = 'action_save_notes';
      nodes.push({
        id: saveActionId,
        label: 'Save Notes & Quiz',
        type: 'ANDROID_ACTION',
        capability: 'STUDY_NOTES_STORE',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [quizNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${quizNodeId}_${saveActionId}`, sourceNodeId: quizNodeId, targetNodeId: saveActionId, dataType: 'STRUCTURED_JSON' });
    } else if (domain === 'HEALTHCARE') {
      currentX += 220;
      const diagNodeId = 'ai_plant_diag';
      nodes.push({
        id: diagNodeId,
        label: 'AgroVision Disease Diagnosis',
        type: 'AI',
        capability: 'PLANT_DISEASE_DIAGNOSIS',
        inputTypes: ['IMAGE'],
        outputType: 'STRUCTURED_JSON',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${diagNodeId}`, sourceNodeId: prevNodeId, targetNodeId: diagNodeId, dataType: 'IMAGE' });
      prevNodeId = diagNodeId;

      currentX += 220;
      const treatNodeId = 'ai_treatment';
      nodes.push({
        id: treatNodeId,
        label: 'Generate Treatment & Care Plan',
        type: 'AI',
        capability: 'SUMMARIZATION',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${treatNodeId}`, sourceNodeId: prevNodeId, targetNodeId: treatNodeId, dataType: 'STRUCTURED_JSON' });
      prevNodeId = treatNodeId;

      currentX += 220;
      const actionCareId = 'action_save_care';
      nodes.push({
        id: actionCareId,
        label: 'Save Botanical Care Plan',
        type: 'ANDROID_ACTION',
        capability: 'CARE_PLAN_STORE',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${actionCareId}`, sourceNodeId: prevNodeId, targetNodeId: actionCareId, dataType: 'TEXT' });
    } else {
      // General Fallback
      currentX += 220;
      const genAiId = 'ai_summary';
      nodes.push({
        id: genAiId,
        label: 'Synthesize & Summarize',
        type: 'AI',
        capability: 'SUMMARIZATION',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${genAiId}`, sourceNodeId: prevNodeId, targetNodeId: genAiId, dataType: 'TEXT' });
      prevNodeId = genAiId;

      currentX += 220;
      const notifId = 'action_notif';
      nodes.push({
        id: notifId,
        label: 'Android Notification',
        type: 'ANDROID_ACTION',
        capability: 'NOTIFICATION_EMIT',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: [prevNodeId],
        config: {},
        executionPolicy: 'AUTO',
        position: { x: currentX, y: yCenter }
      });
      edges.push({ id: `e_${prevNodeId}_${notifId}`, sourceNodeId: prevNodeId, targetNodeId: notifId, dataType: 'TEXT' });
    }

    return {
      id,
      name: this.formatWorkflowName(prompt, domain),
      description: prompt,
      domain,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      triggerNotificationAction: 'Run Automation'
    };
  }

  private static formatWorkflowName(prompt: string, domain: string): string {
    if (domain === 'FINANCE') return 'Smart Bill & Expense Processor';
    if (domain === 'EDUCATION') return 'Lecture Note & Quiz Synthesizer';
    if (domain === 'HEALTHCARE') return 'Plant Disease & Care Assistant';
    if (domain === 'PRODUCTIVITY') return 'Meeting Digest & Action Tracker';
    return prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt;
  }
}
