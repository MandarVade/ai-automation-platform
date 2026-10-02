import { describe, it, expect } from 'vitest';
import { IntermediateResultCache } from '../src/core/cache/result-cache';

describe('IntermediateResultCache', () => {
  const cache = IntermediateResultCache.getInstance();

  it('should generate identical deterministic keys for identical inputs', () => {
    const key1 = cache.generateKey('wf_1', 'node_ocr', { text: 'Hello' }, 'v1.0', { lang: 'en' });
    const key2 = cache.generateKey('wf_1', 'node_ocr', { text: 'Hello' }, 'v1.0', { lang: 'en' });
    expect(key1).toEqual(key2);
  });

  it('should generate distinct keys for different inputs or node IDs', () => {
    const key1 = cache.generateKey('wf_1', 'node_ocr', { text: 'Bill A' }, 'v1.0');
    const key2 = cache.generateKey('wf_1', 'node_ocr', { text: 'Bill B' }, 'v1.0');
    expect(key1).not.toEqual(key2);
  });

  it('should store and retrieve cached outputs correctly', () => {
    const key = cache.generateKey('wf_test', 'step_1', 'input_val', 'v2');
    cache.set(key, 'wf_test', 'step_1', 'hash_val', 'v2', { result: 42 }, 'LOCAL_NPU');

    const entry = cache.get(key);
    expect(entry).toBeDefined();
    expect(entry?.outputData.result).toBe(42);
    expect(entry?.executionLocation).toBe('LOCAL_NPU');
  });
});
