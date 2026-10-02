import { WorkflowExecutionReport } from '../types/execution';

export class ExecutionHistoryStore {
  private static instance: ExecutionHistoryStore;
  private reports: WorkflowExecutionReport[] = [];
  private listeners: Set<(reports: WorkflowExecutionReport[]) => void> = new Set();

  private constructor() {
    this.seedInitialHistory();
  }

  public static getInstance(): ExecutionHistoryStore {
    if (!ExecutionHistoryStore.instance) {
      ExecutionHistoryStore.instance = new ExecutionHistoryStore();
    }
    return ExecutionHistoryStore.instance;
  }

  public subscribe(cb: (reports: WorkflowExecutionReport[]) => void): () => void {
    this.listeners.add(cb);
    cb([...this.reports]);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb([...this.reports]);
    }
  }

  public addReport(report: WorkflowExecutionReport): void {
    this.reports.unshift(report);
    this.notify();
  }

  public getAll(): WorkflowExecutionReport[] {
    return [...this.reports];
  }

  public getById(id: string): WorkflowExecutionReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  public clear(): void {
    this.reports = [];
    this.notify();
  }

  private seedInitialHistory(): void {
    const now = Date.now();

    this.reports = [
      {
        id: 'hist_01',
        workflowId: 'wf_finance_bill',
        workflowName: 'Smart Bill & Expense Processor',
        status: 'COMPLETED',
        startTime: now - 3600000 * 2,
        endTime: now - 3600000 * 2 + 1240,
        totalDurationMs: 1240,
        cacheHitsCount: 0,
        totalMemoryPeakMb: 140,
        deviceContextSnapshot: {
          deviceModel: 'Pixel 8 Pro (Google Tensor G3)',
          androidVersion: 14,
          totalRamMb: 8192,
          availableRamMb: 3450,
          batteryPercentage: 84,
          isCharging: false,
          thermalStatus: 'NOMINAL',
          networkState: 'WIFI_HIGH_SPEED',
          hasNpu: true,
          hasGpu: true,
          cpuCores: 8,
          storageAvailableMb: 42800,
          powerSaverEnabled: false,
          allowCloudInference: true
        },
        nodeRecords: {
          node_bill_cam: {
            nodeId: 'node_bill_cam',
            label: 'Camera Capture (Bill/Receipt)',
            status: 'SUCCESS',
            startTime: now - 3600000 * 2,
            endTime: now - 3600000 * 2 + 150,
            latencyMs: 150,
            cacheHit: false,
            logLines: ['Trigger captured 1080p image raster.']
          },
          node_bill_ocr: {
            nodeId: 'node_bill_ocr',
            label: 'PaddleOCR / Document Text',
            status: 'SUCCESS',
            startTime: now - 3600000 * 2 + 150,
            endTime: now - 3600000 * 2 + 580,
            latencyMs: 430,
            selectedModelId: 'paddleocr-mobile-v4',
            selectedModelName: 'PaddleOCR Mobile v4',
            executionLocation: 'LOCAL_NPU',
            ramConsumedMb: 140,
            cacheHit: false,
            logLines: [
              'Model selected: PaddleOCR Mobile v4 (Score: 89/100)',
              'Extracted 8 text blocks, tax line, subtotal, and total amount.'
            ]
          },
          node_bill_calc: {
            nodeId: 'node_bill_calc',
            label: 'Extract & Calculate Sums',
            status: 'SUCCESS',
            startTime: now - 3600000 * 2 + 580,
            endTime: now - 3600000 * 2 + 595,
            latencyMs: 15,
            cacheHit: false,
            logLines: ['Arithmetic balance check passed: Subtotal $32.50 + Tax $2.76 = Total $35.26']
          },
          node_bill_cat: {
            nodeId: 'node_bill_cat',
            label: 'BERT Expense Categorizer',
            status: 'SUCCESS',
            startTime: now - 3600000 * 2 + 595,
            endTime: now - 3600000 * 2 + 675,
            latencyMs: 80,
            selectedModelId: 'bert-mini-expense',
            selectedModelName: 'BERT Mini Expense Classifier INT8',
            executionLocation: 'LOCAL_NPU',
            ramConsumedMb: 52,
            cacheHit: false,
            logLines: [
              'Model selected: BERT Mini Expense Classifier INT8 (Score: 92/100)',
              'Categorized as "Groceries & Household Supplies" with 96% confidence.'
            ]
          },
          node_bill_save: {
            nodeId: 'node_bill_save',
            label: 'Android Expense Ledger DB',
            status: 'SUCCESS',
            startTime: now - 3600000 * 2 + 675,
            endTime: now - 3600000 * 2 + 710,
            latencyMs: 35,
            cacheHit: false,
            logLines: ['Persisted to SQLite expense table and emitted Android notification.']
          }
        },
        finalOutputs: {
          node_bill_save: {
            vendor: 'Metro Wholesale & Organic Mart',
            total: 35.26,
            category: 'Groceries',
            status: 'PERSISTED'
          }
        }
      }
    ];
  }
}
