import { ModelSpec, ModelCapability } from '../../types/model';

export class ModelRegistry {
  private static models: Map<string, ModelSpec> = new Map();

  static {
    this.registerDefaults();
  }

  private static registerDefaults(): void {
    const catalog: ModelSpec[] = [
      // --- OCR ---
      {
        id: 'tesseract-mobile-lite',
        name: 'Tesseract OCR Mobile Lite',
        version: 'v5.3.0-int8',
        capability: 'OCR',
        inputType: 'IMAGE',
        outputType: 'TEXT',
        sizeMb: 12,
        ramRequirementMb: 65,
        quantization: 'INT8',
        supportedDelegates: ['CPU'],
        expectedLatencyMs: 320,
        qualityScore: 0.81,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Ultra-lightweight on-device OCR engine optimized for budget Android chipsets.',
        parametersCount: '15M'
      },
      {
        id: 'paddleocr-mobile-v4',
        name: 'PaddleOCR Mobile v4',
        version: 'v4.1.0-int8',
        capability: 'OCR',
        inputType: 'IMAGE',
        outputType: 'TEXT',
        sizeMb: 28,
        ramRequirementMb: 140,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'GPU_VULKAN', 'CPU'],
        expectedLatencyMs: 450,
        qualityScore: 0.92,
        batteryImpact: 'MEDIUM',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'High-accuracy on-device document & receipt OCR with NPU acceleration.',
        parametersCount: '34M'
      },
      {
        id: 'cloud-vision-ocr',
        name: 'Google Cloud Vision OCR',
        version: 'v1.4',
        capability: 'OCR',
        inputType: 'IMAGE',
        outputType: 'TEXT',
        sizeMb: 0,
        ramRequirementMb: 15,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 650,
        qualityScore: 0.99,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Serverless cloud OCR endpoint with multi-language and skewed handwriting support.'
      },

      // --- SPEECH TO TEXT ---
      {
        id: 'whisper-tiny-mobile',
        name: 'Whisper Tiny Mobile INT8',
        version: 'v2.1',
        capability: 'SPEECH_TO_TEXT',
        inputType: 'AUDIO_STREAM',
        outputType: 'TEXT',
        sizeMb: 39,
        ramRequirementMb: 180,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'GPU_OPENCL', 'CPU'],
        expectedLatencyMs: 850,
        qualityScore: 0.84,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Fast, energy-efficient speech recognizer for on-device voice automations.',
        parametersCount: '39M'
      },
      {
        id: 'whisper-base-mobile',
        name: 'Whisper Base Mobile INT8',
        version: 'v2.1',
        capability: 'SPEECH_TO_TEXT',
        inputType: 'AUDIO_STREAM',
        outputType: 'TEXT',
        sizeMb: 142,
        ramRequirementMb: 420,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'GPU_VULKAN'],
        expectedLatencyMs: 1650,
        qualityScore: 0.91,
        batteryImpact: 'MEDIUM',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Balanced accuracy speech recognition model with punctuation restoration.',
        parametersCount: '74M'
      },
      {
        id: 'cloud-whisper-v3',
        name: 'Whisper Large v3 Turbo (Cloud)',
        version: 'v3-turbo',
        capability: 'SPEECH_TO_TEXT',
        inputType: 'AUDIO_STREAM',
        outputType: 'TEXT',
        sizeMb: 0,
        ramRequirementMb: 20,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 900,
        qualityScore: 0.98,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'State-of-the-art cloud speech-to-text with industry-leading lecture acoustics parsing.'
      },

      // --- SUMMARIZATION ---
      {
        id: 'smolllm-135m-mobile',
        name: 'SmolLM 135M Instruct INT4',
        version: 'v1.0',
        capability: 'SUMMARIZATION',
        inputType: 'TEXT',
        outputType: 'TEXT',
        sizeMb: 85,
        ramRequirementMb: 210,
        quantization: 'INT4',
        supportedDelegates: ['CPU', 'GPU_OPENCL'],
        expectedLatencyMs: 820,
        qualityScore: 0.80,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Compact generative transformer tuned for brief summaries and bullet points.',
        parametersCount: '135M'
      },
      {
        id: 'llama-3.2-1b-mobile',
        name: 'Llama 3.2 1B Mobile INT4',
        version: 'v3.2',
        capability: 'SUMMARIZATION',
        inputType: 'TEXT',
        outputType: 'TEXT',
        sizeMb: 680,
        ramRequirementMb: 1150,
        quantization: 'INT4',
        supportedDelegates: ['NNAPI', 'GPU_VULKAN'],
        expectedLatencyMs: 2200,
        qualityScore: 0.92,
        batteryImpact: 'HIGH',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Deep on-device comprehension model for complex lecture notes and synthesis.',
        parametersCount: '1.2B'
      },
      {
        id: 'cloud-claude-haiku-summary',
        name: 'Claude 3.5 Haiku Summarizer (Cloud)',
        version: 'v3.5',
        capability: 'SUMMARIZATION',
        inputType: 'TEXT',
        outputType: 'TEXT',
        sizeMb: 0,
        ramRequirementMb: 12,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 720,
        qualityScore: 0.97,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'High-speed cloud reasoning engine for dense semantic summaries and key takeaways.'
      },

      // --- CONCEPT EXTRACTION ---
      {
        id: 'qwen-2.5-0.5b-mobile',
        name: 'Qwen 2.5 0.5B Concept Extractor INT4',
        version: 'v2.5',
        capability: 'CONCEPT_EXTRACTION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 340,
        ramRequirementMb: 580,
        quantization: 'INT4',
        supportedDelegates: ['NNAPI', 'GPU_OPENCL'],
        expectedLatencyMs: 1400,
        qualityScore: 0.88,
        batteryImpact: 'MEDIUM',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Fine-tuned small language model extracting structured concepts, terms, and definitions.',
        parametersCount: '490M'
      },
      {
        id: 'cloud-gemini-concepts',
        name: 'Gemini 1.5 Flash Concept Parser (Cloud)',
        version: 'v1.5',
        capability: 'CONCEPT_EXTRACTION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 0,
        ramRequirementMb: 15,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 800,
        qualityScore: 0.98,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Structured JSON concept extraction with hierarchical taxonomy and definitions.'
      },

      // --- QUESTION GENERATION ---
      {
        id: 'flan-t5-mobile-quiz',
        name: 'Flan-T5 Mobile Quiz Generator INT8',
        version: 'v1.2',
        capability: 'QUESTION_GENERATION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 95,
        ramRequirementMb: 240,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'CPU'],
        expectedLatencyMs: 950,
        qualityScore: 0.85,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'On-device educational model producing multiple-choice and conceptual assessment questions.',
        parametersCount: '80M'
      },
      {
        id: 'cloud-gpt4o-mini-quiz',
        name: 'GPT-4o Mini Quiz Generator (Cloud)',
        version: 'v4.0',
        capability: 'QUESTION_GENERATION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 0,
        ramRequirementMb: 15,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 850,
        qualityScore: 0.97,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Generates rigorous 5-question multi-choice study quizzes with answers and explanations.'
      },

      // --- EXPENSE CATEGORIZATION ---
      {
        id: 'bert-mini-expense',
        name: 'BERT Mini Expense Classifier INT8',
        version: 'v1.1',
        capability: 'EXPENSE_CATEGORIZATION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 16,
        ramRequirementMb: 52,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'CPU'],
        expectedLatencyMs: 70,
        qualityScore: 0.94,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Instant classification of receipts into Food, Travel, Utilities, Office, and Supplies.',
        parametersCount: '11M'
      },
      {
        id: 'cloud-claude-expense',
        name: 'Claude 3.5 Haiku Expense Engine (Cloud)',
        version: 'v3.5',
        capability: 'EXPENSE_CATEGORIZATION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 0,
        ramRequirementMb: 10,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 650,
        qualityScore: 0.99,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Advanced financial itemization with tax extraction, vendor detection, and ledger tagging.'
      },

      // --- PLANT DISEASE DIAGNOSIS & VISION ---
      {
        id: 'mobilenet-agrovision-int8',
        name: 'MobileNetV4 AgroVision INT8',
        version: 'v4.0',
        capability: 'PLANT_DISEASE_DIAGNOSIS',
        inputType: 'IMAGE',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 19,
        ramRequirementMb: 88,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'GPU_VULKAN', 'CPU'],
        expectedLatencyMs: 195,
        qualityScore: 0.91,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Specialized edge vision model detecting 38 plant leaf pathologies in real-time.',
        parametersCount: '4.5M'
      },
      {
        id: 'cloud-gemini-plant-pathologist',
        name: 'Gemini 1.5 Flash Botanist (Cloud)',
        version: 'v1.5',
        capability: 'PLANT_DISEASE_DIAGNOSIS',
        inputType: 'IMAGE',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 0,
        ramRequirementMb: 16,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 1100,
        qualityScore: 0.98,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Comprehensive botanical vision model analyzing lesions, chlorosis, and curative protocols.'
      },

      // --- TASK & ACTION ITEM EXTRACTION ---
      {
        id: 'distilbert-task-extractor',
        name: 'DistilBERT Task Extractor Mobile INT8',
        version: 'v2.0',
        capability: 'TASK_EXTRACTION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 65,
        ramRequirementMb: 175,
        quantization: 'INT8',
        supportedDelegates: ['NNAPI', 'CPU'],
        expectedLatencyMs: 380,
        qualityScore: 0.89,
        batteryImpact: 'LOW',
        isLocalAvailable: true,
        isCloudAvailable: false,
        description: 'Detects action items, assignees, and deadlines from meeting transcripts.',
        parametersCount: '66M'
      },
      {
        id: 'cloud-gpt4o-task-extractor',
        name: 'GPT-4o Mini Action Tracker (Cloud)',
        version: 'v4.0',
        capability: 'TASK_EXTRACTION',
        inputType: 'TEXT',
        outputType: 'STRUCTURED_JSON',
        sizeMb: 0,
        ramRequirementMb: 15,
        quantization: 'NONE',
        supportedDelegates: ['CLOUD_API'],
        expectedLatencyMs: 780,
        qualityScore: 0.98,
        batteryImpact: 'LOW',
        isLocalAvailable: false,
        isCloudAvailable: true,
        description: 'Extracts structured JIRA/Asana style tasks, owners, and due dates from raw conversations.'
      }
    ];

    for (const spec of catalog) {
      this.models.set(spec.id, spec);
    }
  }

  public static getAll(): ModelSpec[] {
    return Array.from(this.models.values());
  }

  public static getById(id: string): ModelSpec | undefined {
    return this.models.get(id);
  }

  public static getByCapability(capability: ModelCapability): ModelSpec[] {
    return this.getAll().filter((m) => m.capability === capability);
  }

  public static registerCustomModel(model: ModelSpec): void {
    this.models.set(model.id, model);
  }
}
