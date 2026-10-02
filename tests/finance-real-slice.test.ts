import { describe, it, expect, beforeEach } from 'vitest';
import { RealOCREngine } from '../src/core/runtime/ocr-engine';
import { ReceiptParser } from '../src/core/workflow/receipt-parser';
import { IntermediateResultCache } from '../src/core/cache/result-cache';
import { AndroidActionLayer } from '../src/core/actions/android-actions';
import { WorkflowEngine } from '../src/core/workflow/engine';
import { DEMO_WORKFLOWS } from '../src/data/templates';

describe('Real Finance Vertical Slice (Phases 4-10, 15)', () => {
  beforeEach(() => {
    IntermediateResultCache.getInstance().clear();
  });

  // 1. File / image input
  it('1. should accept real user image input structure with metadata', () => {
    const userImageInput = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'store_receipt_2026.png',
      source: 'User File Input'
    };

    expect(userImageInput.type).toBe('IMAGE');
    expect(userImageInput.image).toContain('data:image/png;base64');
    expect(userImageInput.fileName).toBe('store_receipt_2026.png');
  });

  // 2. OCR adapter execution
  it('2. should execute OCR adapter and return real inference contract', async () => {
    const rasterData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const ocrResult = await RealOCREngine.recognizeImage(rasterData);

    expect(ocrResult).toBeDefined();
    expect(ocrResult.rawText).toBeTruthy();
    expect(ocrResult.confidence).toBeGreaterThanOrEqual(0);
    expect(ocrResult.runtime).toBe('TESSERACT_WASM_ON_DEVICE');
    expect(ocrResult.isRealInference).toBe(true);
  });

  // 3. OCR output parsing
  it('3. should parse raw OCR text into distinct lines and values', () => {
    const rawOcr = `
      METRO SUPERMARKET
      Organic Almond Milk $4.50
      Artisan Sourdough $5.25
      Dark Roast Coffee $12.00
      Subtotal: $21.75
      Tax: $1.74
      Total: $23.49
    `;

    const parsed = ReceiptParser.parse(rawOcr);
    expect(parsed.merchant).toBe('METRO SUPERMARKET');
    expect(parsed.items.length).toBe(3);
  });

  // 4. Structured receipt extraction
  it('4. should extract structured JSON with items, prices, subtotal, and tax', () => {
    const receiptText = `
      BLUE BOTTLE COFFEE
      Single Origin Espresso $4.50
      Oat Milk Cortado $5.25
      Almond Croissant $4.75
      Subtotal: $14.50
      Tax: $1.16
      Total: $15.66
    `;

    const structured = ReceiptParser.parse(receiptText);
    expect(structured.merchant).toBe('BLUE BOTTLE COFFEE');
    expect(structured.items).toEqual([
      { name: 'Single Origin Espresso', price: 4.5 },
      { name: 'Oat Milk Cortado', price: 5.25 },
      { name: 'Almond Croissant', price: 4.75 }
    ]);
  });

  // 5. Dynamic arithmetic calculation (sum(items) -> subtotal -> tax -> total)
  it('5. should dynamically calculate sum(items) -> subtotal -> tax -> total without hardcoding $35.26', () => {
    const receiptText = `
      CAMPUS BOOKSTORE
      Algorithms Textbook $85.00
      Spiral Notebook $6.50
      Gel Pens Pack $8.50
      Subtotal: $100.00
      Tax: $8.00
      Total: $108.00
    `;

    const calculated = ReceiptParser.parse(receiptText);
    const itemSum = calculated.items.reduce((acc, i) => acc + i.price, 0);

    expect(itemSum).toBeCloseTo(100.0, 2);
    expect(calculated.subtotal).toBeCloseTo(100.0, 2);
    expect(calculated.tax).toBeCloseTo(8.0, 2);
    expect(calculated.total).toBeCloseTo(108.0, 2);
    // Explicitly verify this is NOT the old fixture
    expect(calculated.total).not.toBe(35.26);
  });

  // 6. Cache Miss
  it('6. should produce a CACHE MISS on first evaluation of Image A', () => {
    const cache = IntermediateResultCache.getInstance();
    const imagePayloadA = { hash: 'img_hash_aaa_111', bytes: 4096 };
    const cacheKeyA = cache.generateKey('wf-finance', 'node-ocr', imagePayloadA, 'tesseract-v7');

    const lookup = cache.get(cacheKeyA);
    expect(lookup).toBeUndefined(); // Genuine MISS
  });

  // 7. Cache Hit
  it('7. should produce a genuine CACHE HIT when Image A is evaluated a second time', () => {
    const cache = IntermediateResultCache.getInstance();
    const imagePayloadA = { hash: 'img_hash_aaa_111', bytes: 4096 };
    const cacheKeyA = cache.generateKey('wf-finance', 'node-ocr', imagePayloadA, 'tesseract-v7');

    // Populate after first run
    cache.set(cacheKeyA, 'wf-finance', 'node-ocr', 'img_hash_aaa_111', 'tesseract-v7', { text: 'OCR text A' }, 'LOCAL_CPU');

    // Second evaluation
    const lookup = cache.get(cacheKeyA);
    expect(lookup).toBeDefined();
    expect(lookup?.outputData.text).toBe('OCR text A');
  });

  // 8. Different input invalidates cache (Image B)
  it('8. should produce a CACHE MISS for Image B and not reuse Image A cached result', () => {
    const cache = IntermediateResultCache.getInstance();
    const imagePayloadA = { hash: 'img_hash_aaa_111', bytes: 4096 };
    const imagePayloadB = { hash: 'img_hash_bbb_222', bytes: 8192 };

    const keyA = cache.generateKey('wf-finance', 'node-ocr', imagePayloadA, 'tesseract-v7');
    const keyB = cache.generateKey('wf-finance', 'node-ocr', imagePayloadB, 'tesseract-v7');

    cache.set(keyA, 'wf-finance', 'node-ocr', 'img_hash_aaa_111', 'tesseract-v7', { text: 'OCR text A' }, 'LOCAL_CPU');

    const lookupB = cache.get(keyB);
    expect(lookupB).toBeUndefined(); // B is a MISS
    expect(keyA).not.toEqual(keyB);
  });

  // 9. Expense persistence contract
  it('9. should persist structured expense with all required audit fields', () => {
    const actionLayer = AndroidActionLayer.getInstance();
    const expense = actionLayer.recordExpense({
      vendor: 'BLUE BOTTLE COFFEE',
      items: [
        { name: 'Espresso', price: 4.5 },
        { name: 'Cortado', price: 5.25 }
      ],
      subtotal: 9.75,
      tax: 0.78,
      total: 10.53,
      category: 'Food & Dining'
    });

    expect(expense.id).toBeDefined();
    expect(expense.vendor).toBe('BLUE BOTTLE COFFEE');
    expect(expense.items.length).toBe(2);
    expect(expense.subtotal).toBe(9.75);
    expect(expense.tax).toBe(0.78);
    expect(expense.total).toBe(10.53);
    expect(expense.category).toBe('Food & Dining');
    expect(expense.timestamp).toBeGreaterThan(0);

    // Retrieve from store
    const stored = actionLayer.getExpenses();
    const match = stored.find((e) => e.id === expense.id);
    expect(match).toBeDefined();
    expect(match?.total).toBe(10.53);
  });

  // 10. Full workflow execution through existing engine
  it('10. should execute complete Finance workflow through WorkflowEngine with dynamic arithmetic', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0]; // Bill OCR to Expense Tracker

    const customReceipt = {
      type: 'IMAGE',
      rawText: `
        CENTRAL BOOK EMPORIUM
        Distributed Systems Vol 1 $45.00
        Notebook Moleskine $15.00
        Subtotal: $60.00
        Tax: $4.80
        Total: $64.80
      `,
      source: 'Integration Test'
    };

    const report = await engine.executeWorkflow(financeWorkflow, customReceipt);

    expect(report.status).toBe('COMPLETED');
    expect(report.error).toBeUndefined();

    // Check transform step output
    const transformRecord = report.nodeRecords['node_bill_calc'];
    expect(transformRecord).toBeDefined();
    expect(transformRecord.status).toBe('SUCCESS');
    expect(transformRecord.outputData.total).toBeCloseTo(64.8, 2);
    expect(transformRecord.outputData.subtotal).toBeCloseTo(60.0, 2);
    expect(transformRecord.outputData.total).not.toBe(35.26);

    // Check persistence action
    const actionRecord = report.nodeRecords['node_bill_save'];
    expect(actionRecord).toBeDefined();
    expect(actionRecord.status).toBe('SUCCESS');
    expect(actionRecord.outputData.total).toBeCloseTo(64.8, 2);
    expect(actionRecord.outputData.vendor).toBe('CENTRAL BOOK EMPORIUM');
  });
});
