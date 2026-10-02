import { ModelSpec } from '../../types/model';
import { DeviceContextManager } from '../resources/device-context';

export interface LoadedModelRecord {
  modelSpec: ModelSpec;
  loadedAt: number;
  lastUsedAt: number;
  memoryAllocatedMb: number;
  executionCount: number;
}

export class ModelLifecycleManager {
  private static instance: ModelLifecycleManager;
  private loadedModels: Map<string, LoadedModelRecord> = new Map();
  private maxActiveMemoryBudgetMb: number = 2048; // Conservative mobile RAM budget for AI weights

  private listeners: Set<() => void> = new Set();

  public static getInstance(): ModelLifecycleManager {
    if (!ModelLifecycleManager.instance) {
      ModelLifecycleManager.instance = new ModelLifecycleManager();
    }
    return ModelLifecycleManager.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Memory-aware load. Evicts LRU models if memory budget is exceeded.
   */
  public async loadModel(modelSpec: ModelSpec): Promise<void> {
    const now = Date.now();

    // If already loaded, touch timestamp and return
    if (this.loadedModels.has(modelSpec.id)) {
      const existing = this.loadedModels.get(modelSpec.id)!;
      existing.lastUsedAt = now;
      existing.executionCount++;
      this.notify();
      return;
    }

    const requiredRam = modelSpec.isLocalAvailable ? modelSpec.ramRequirementMb : 15; // Cloud client buffer

    // Enforce memory budget with LRU eviction
    while (this.getTotalActiveRamMb() + requiredRam > this.maxActiveMemoryBudgetMb && this.loadedModels.size > 0) {
      const lruModelId = this.findLruModelId();
      if (lruModelId) {
        this.unloadModel(lruModelId, 'Evicted by memory lifecycle manager to satisfy memory budget');
      } else {
        break;
      }
    }

    // Allocate memory
    this.loadedModels.set(modelSpec.id, {
      modelSpec,
      loadedAt: now,
      lastUsedAt: now,
      memoryAllocatedMb: requiredRam,
      executionCount: 1
    });

    this.notify();
  }

  public unloadModel(modelId: string, reason?: string): boolean {
    if (this.loadedModels.has(modelId)) {
      this.loadedModels.delete(modelId);
      this.notify();
      return true;
    }
    return false;
  }

  public unloadAll(): void {
    this.loadedModels.clear();
    this.notify();
  }

  public isLoaded(modelId: string): boolean {
    return this.loadedModels.has(modelId);
  }

  public getLoadedModels(): LoadedModelRecord[] {
    return Array.from(this.loadedModels.values());
  }

  public getTotalActiveRamMb(): number {
    let total = 0;
    for (const record of this.loadedModels.values()) {
      total += record.memoryAllocatedMb;
    }
    return total;
  }

  private findLruModelId(): string | null {
    let oldestTime = Infinity;
    let oldestId: string | null = null;

    for (const [id, record] of this.loadedModels.entries()) {
      if (record.lastUsedAt < oldestTime) {
        oldestTime = record.lastUsedAt;
        oldestId = id;
      }
    }
    return oldestId;
  }
}
