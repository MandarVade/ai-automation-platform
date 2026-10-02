import { CacheEntry } from '../../types/execution';
import { ExecutionLocation } from '../../types/model';

export class IntermediateResultCache {
  private static instance: IntermediateResultCache;
  private cache: Map<string, CacheEntry> = new Map();

  private hitsCount = 0;
  private missesCount = 0;

  public static getInstance(): IntermediateResultCache {
    if (!IntermediateResultCache.instance) {
      IntermediateResultCache.instance = new IntermediateResultCache();
    }
    return IntermediateResultCache.instance;
  }

  /**
   * Generates a deterministic SHA-256 equivalent hash key
   * key = workflowId + nodeId + inputHash + modelVersion + parameters
   */
  public generateKey(
    workflowId: string,
    nodeId: string,
    inputData: any,
    modelVersion: string,
    parameters: Record<string, any> = {}
  ): string {
    const inputHash = this.computeHash(JSON.stringify(inputData ?? ''));
    const paramsHash = this.computeHash(JSON.stringify(parameters ?? {}));
    return `cache_${workflowId}::${nodeId}::${inputHash}::${modelVersion}::${paramsHash}`;
  }

  public get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      this.hitsCount++;
      return entry;
    }
    this.missesCount++;
    return undefined;
  }

  public set(
    key: string,
    workflowId: string,
    nodeId: string,
    inputHash: string,
    modelVersion: string,
    outputData: any,
    location: ExecutionLocation
  ): void {
    this.cache.set(key, {
      key,
      workflowId,
      nodeId,
      inputHash,
      modelVersion,
      outputData,
      timestamp: Date.now(),
      executionLocation: location
    });
  }

  public clear(): void {
    this.cache.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
  }

  public getStats(): { size: number; hits: number; misses: number; hitRatioPercent: number } {
    const total = this.hitsCount + this.missesCount;
    const hitRatioPercent = total > 0 ? Math.round((this.hitsCount / total) * 100) : 0;
    return {
      size: this.cache.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatioPercent
    };
  }

  /**
   * Deterministic 32-bit FNV-1a & Murmur-like polynomial rolling hash
   */
  public computeHash(str: string): string {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c64e6d;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  }
}
