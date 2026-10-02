import { Workflow } from '../types/workflow';

export const DEMO_WORKFLOWS: Workflow[] = [
  // --- 1. FINANCE / BILL PROCESSING ---
  {
    id: 'wf_finance_bill',
    name: 'Smart Bill & Expense Processor',
    description: 'Take a photo of a handwritten bill, extract items and prices, calculate total, categorize expenses, and add to expense tracker.',
    domain: 'FINANCE',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    version: '1.2.0',
    triggerNotificationAction: 'Scan Bill & Record',
    nodes: [
      {
        id: 'node_bill_cam',
        label: 'Camera Capture (Bill/Receipt)',
        type: 'TRIGGER',
        capability: 'CAMERA_CAPTURE',
        inputTypes: [],
        outputType: 'IMAGE',
        dependencies: [],
        config: { resolution: '1080p', autoFlash: true },
        executionPolicy: 'AUTO',
        position: { x: 60, y: 180 }
      },
      {
        id: 'node_bill_ocr',
        label: 'PaddleOCR / Document Text',
        type: 'AI',
        capability: 'OCR',
        inputTypes: ['IMAGE'],
        outputType: 'TEXT',
        dependencies: ['node_bill_cam'],
        config: { language: 'en', detectOrientation: true },
        executionPolicy: 'AUTO',
        fallbackPolicy: { enableSmallerModelFallback: true, enableCloudFallback: true },
        position: { x: 300, y: 180 }
      },
      {
        id: 'node_bill_calc',
        label: 'Extract & Calculate Sums',
        type: 'TRANSFORM',
        capability: 'CALCULATE_TOTAL',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_bill_ocr'],
        config: { currency: 'USD', computeTax: true },
        executionPolicy: 'AUTO',
        position: { x: 540, y: 180 }
      },
      {
        id: 'node_bill_cat',
        label: 'BERT Expense Categorizer',
        type: 'AI',
        capability: 'EXPENSE_CATEGORIZATION',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_bill_calc'],
        config: { taxDeductibleCheck: true },
        executionPolicy: 'AUTO',
        position: { x: 780, y: 180 }
      },
      {
        id: 'node_bill_save',
        label: 'Android Expense Ledger DB',
        type: 'ANDROID_ACTION',
        capability: 'EXPENSE_TRACKER_STORE',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_bill_cat'],
        config: { table: 'expenses', notifyUser: true },
        executionPolicy: 'AUTO',
        position: { x: 1020, y: 180 }
      }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'node_bill_cam', targetNodeId: 'node_bill_ocr', dataType: 'IMAGE' },
      { id: 'e2', sourceNodeId: 'node_bill_ocr', targetNodeId: 'node_bill_calc', dataType: 'TEXT' },
      { id: 'e3', sourceNodeId: 'node_bill_calc', targetNodeId: 'node_bill_cat', dataType: 'STRUCTURED_JSON' },
      { id: 'e4', sourceNodeId: 'node_bill_cat', targetNodeId: 'node_bill_save', dataType: 'STRUCTURED_JSON' }
    ]
  },

  // --- 2. EDUCATION / LECTURE STUDY NOTES & QUIZ ---
  {
    id: 'wf_education_lecture',
    name: 'Lecture Note & Quiz Synthesizer',
    description: 'Record a lecture, transcribe it, identify important concepts, generate study notes, and create five quiz questions.',
    domain: 'EDUCATION',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    version: '1.4.0',
    triggerNotificationAction: 'Record Lecture & Synthesize',
    nodes: [
      {
        id: 'node_lec_mic',
        label: 'Audio Record (Lecture)',
        type: 'TRIGGER',
        capability: 'AUDIO_RECORD',
        inputTypes: [],
        outputType: 'AUDIO_STREAM',
        dependencies: [],
        config: { sampleRateHz: 16000, noiseSuppression: true },
        executionPolicy: 'AUTO',
        position: { x: 60, y: 220 }
      },
      {
        id: 'node_lec_stt',
        label: 'Whisper Speech Recognition',
        type: 'AI',
        capability: 'SPEECH_TO_TEXT',
        inputTypes: ['AUDIO_STREAM'],
        outputType: 'TEXT',
        dependencies: ['node_lec_mic'],
        config: { beamSize: 5, language: 'en' },
        executionPolicy: 'AUTO',
        fallbackPolicy: { enableSmallerModelFallback: true, enableCloudFallback: true },
        position: { x: 280, y: 220 }
      },
      {
        id: 'node_lec_concepts',
        label: 'Qwen Core Concept Extraction',
        type: 'AI',
        capability: 'CONCEPT_EXTRACTION',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_lec_stt'],
        config: { maxConcepts: 6 },
        executionPolicy: 'AUTO',
        position: { x: 500, y: 120 }
      },
      {
        id: 'node_lec_summary',
        label: 'Llama Generative Study Notes',
        type: 'AI',
        capability: 'SUMMARIZATION',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: ['node_lec_stt'],
        config: { format: 'bulleted_academic' },
        executionPolicy: 'AUTO',
        position: { x: 500, y: 310 }
      },
      {
        id: 'node_lec_quiz',
        label: 'Flan-T5 5-Question Quiz Generator',
        type: 'AI',
        capability: 'QUESTION_GENERATION',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_lec_summary'],
        config: { questionCount: 5, difficulty: 'MEDIUM' },
        executionPolicy: 'AUTO',
        position: { x: 740, y: 310 }
      },
      {
        id: 'node_lec_save',
        label: 'Save Study Pack & Android Notification',
        type: 'ANDROID_ACTION',
        capability: 'STUDY_NOTES_STORE',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_lec_quiz'],
        config: { notify: true, format: 'markdown_pdf' },
        executionPolicy: 'AUTO',
        position: { x: 980, y: 220 }
      }
    ],
    edges: [
      { id: 'e10', sourceNodeId: 'node_lec_mic', targetNodeId: 'node_lec_stt', dataType: 'AUDIO_STREAM' },
      { id: 'e11', sourceNodeId: 'node_lec_stt', targetNodeId: 'node_lec_concepts', dataType: 'TEXT' },
      { id: 'e12', sourceNodeId: 'node_lec_stt', targetNodeId: 'node_lec_summary', dataType: 'TEXT' },
      { id: 'e13', sourceNodeId: 'node_lec_summary', targetNodeId: 'node_lec_quiz', dataType: 'TEXT' },
      { id: 'e14', sourceNodeId: 'node_lec_quiz', targetNodeId: 'node_lec_save', dataType: 'STRUCTURED_JSON' }
    ]
  },

  // --- 3. HEALTHCARE / BOTANICAL PATHOLOGY & CARE PLAN ---
  {
    id: 'wf_plant_pathology',
    name: 'Plant Disease & Botanical Care Plan',
    description: 'Take a photo of a plant, identify the disease, explain the symptoms, retrieve treatment information, and create a care plan.',
    domain: 'HEALTHCARE',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    version: '1.1.0',
    triggerNotificationAction: 'Scan Plant & Cure',
    nodes: [
      {
        id: 'node_plant_cam',
        label: 'Camera Capture (Foliage)',
        type: 'TRIGGER',
        capability: 'CAMERA_CAPTURE',
        inputTypes: [],
        outputType: 'IMAGE',
        dependencies: [],
        config: { macroFocus: true },
        executionPolicy: 'AUTO',
        position: { x: 60, y: 180 }
      },
      {
        id: 'node_plant_diag',
        label: 'MobileNetV4 AgroVision Pathologist',
        type: 'AI',
        capability: 'PLANT_DISEASE_DIAGNOSIS',
        inputTypes: ['IMAGE'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_plant_cam'],
        config: { minConfidence: 0.75 },
        executionPolicy: 'AUTO',
        position: { x: 320, y: 180 }
      },
      {
        id: 'node_plant_treat',
        label: 'Botanical Treatment & Protocol Synthesizer',
        type: 'AI',
        capability: 'SUMMARIZATION',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'TEXT',
        dependencies: ['node_plant_diag'],
        config: { targetAudience: 'agronomist' },
        executionPolicy: 'AUTO',
        position: { x: 600, y: 180 }
      },
      {
        id: 'node_plant_save',
        label: 'Save Care Plan & Schedule Notification',
        type: 'ANDROID_ACTION',
        capability: 'CARE_PLAN_STORE',
        inputTypes: ['TEXT'],
        outputType: 'TEXT',
        dependencies: ['node_plant_treat'],
        config: { recurrenceDays: 7 },
        executionPolicy: 'AUTO',
        position: { x: 880, y: 180 }
      }
    ],
    edges: [
      { id: 'ep1', sourceNodeId: 'node_plant_cam', targetNodeId: 'node_plant_diag', dataType: 'IMAGE' },
      { id: 'ep2', sourceNodeId: 'node_plant_diag', targetNodeId: 'node_plant_treat', dataType: 'STRUCTURED_JSON' },
      { id: 'ep3', sourceNodeId: 'node_plant_treat', targetNodeId: 'node_plant_save', dataType: 'TEXT' }
    ]
  },

  // --- 4. PRODUCTIVITY / MEETING DIGEST & ACTION ITEMS ---
  {
    id: 'wf_meeting_digest',
    name: 'Meeting Digest & Action Tracker',
    description: 'Process meeting recording, transcribe, generate executive summary, extract action items, and emit Android notification.',
    domain: 'PRODUCTIVITY',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now(),
    version: '1.0.0',
    triggerNotificationAction: 'Summarize Meeting Audio',
    nodes: [
      {
        id: 'node_meet_mic',
        label: 'Audio Record (Meeting)',
        type: 'TRIGGER',
        capability: 'AUDIO_RECORD',
        inputTypes: [],
        outputType: 'AUDIO_STREAM',
        dependencies: [],
        config: { stereo: false },
        executionPolicy: 'AUTO',
        position: { x: 60, y: 180 }
      },
      {
        id: 'node_meet_stt',
        label: 'Whisper Speech Recognition',
        type: 'AI',
        capability: 'SPEECH_TO_TEXT',
        inputTypes: ['AUDIO_STREAM'],
        outputType: 'TEXT',
        dependencies: ['node_meet_mic'],
        config: { speakerDiarization: true },
        executionPolicy: 'AUTO',
        position: { x: 300, y: 180 }
      },
      {
        id: 'node_meet_tasks',
        label: 'DistilBERT Task & Action Extractor',
        type: 'AI',
        capability: 'TASK_EXTRACTION',
        inputTypes: ['TEXT'],
        outputType: 'STRUCTURED_JSON',
        dependencies: ['node_meet_stt'],
        config: { extractDeadlines: true },
        executionPolicy: 'AUTO',
        position: { x: 560, y: 180 }
      },
      {
        id: 'node_meet_notif',
        label: 'Android Notification & Export File',
        type: 'ANDROID_ACTION',
        capability: 'NOTIFICATION_EMIT',
        inputTypes: ['STRUCTURED_JSON'],
        outputType: 'TEXT',
        dependencies: ['node_meet_tasks'],
        config: { priority: 'HIGH' },
        executionPolicy: 'AUTO',
        position: { x: 820, y: 180 }
      }
    ],
    edges: [
      { id: 'em1', sourceNodeId: 'node_meet_mic', targetNodeId: 'node_meet_stt', dataType: 'AUDIO_STREAM' },
      { id: 'em2', sourceNodeId: 'node_meet_stt', targetNodeId: 'node_meet_tasks', dataType: 'TEXT' },
      { id: 'em3', sourceNodeId: 'node_meet_tasks', targetNodeId: 'node_meet_notif', dataType: 'STRUCTURED_JSON' }
    ]
  }
];
