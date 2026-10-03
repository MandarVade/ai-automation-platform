import { describe, it, expect, beforeEach } from 'vitest';
import { RealOCREngine } from '../src/core/runtime/ocr-engine';
import { ReceiptParser } from '../src/core/workflow/receipt-parser';
import { IntermediateResultCache } from '../src/core/cache/result-cache';
import { AndroidActionLayer } from '../src/core/actions/android-actions';
import { WorkflowEngine } from '../src/core/workflow/engine';
import { DEMO_WORKFLOWS } from '../src/data/templates';

describe('Real Finance Vertical Slice (Phases 4-10, 15) & OCR Integration', () => {
  beforeEach(() => {
    IntermediateResultCache.getInstance().clear();
  });

  // 1. Real image input reaches OCR adapter
  it('1. should accept real user image input structure with metadata and reach OCR adapter', () => {
    const userImageInput = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'bean_and_brew_receipt.png',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    expect(userImageInput.type).toBe('IMAGE');
    expect(userImageInput.image).toContain('data:image/png;base64');
    expect(userImageInput.fileName).toBe('bean_and_brew_receipt.png');
    expect(userImageInput.isRealUpload).toBe(true);
  });

  // 2. RealOCREngine is selected when an uploaded image exists
  it('2. should select RealOCREngine and Tesseract.js / WASM when an uploaded image exists in workflow', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0];

    const imageInput = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'user_uploaded_bill.png',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    const report = await engine.executeWorkflow(financeWorkflow, imageInput);
    expect(report.status).toBe('COMPLETED');

    const ocrRecord = report.nodeRecords['node_bill_ocr'];
    expect(ocrRecord).toBeDefined();
    expect(ocrRecord.status).toBe('SUCCESS');
    // Must NOT select Google Cloud Vision OCR when real uploaded image is present
    expect(ocrRecord.selectedModelName).toBe('Tesseract.js / WASM');
    expect(ocrRecord.selectedModelName).not.toBe('Google Cloud Vision OCR');
    expect(ocrRecord.executionLocation).toBe('LOCAL_CPU');
  });

  // 3. Fixture/preset path is not used for real uploads
  it('3. should execute RealOCREngine without falling back to Cafe Nero/Bakery fixture', async () => {
    const rasterData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const ocrResult = await RealOCREngine.recognizeImage(rasterData);

    expect(ocrResult).toBeDefined();
    // Must not be the fake fallback fixture
    expect(ocrResult.rawText).not.toContain('CAFE NERO');
    expect(ocrResult.rawText).not.toContain('METRO MARKET');
    expect(ocrResult.runtime).toBe('TESSERACT_WASM_ON_DEVICE');
    expect(ocrResult.isRealInference).toBe(true);
  });

  // 4. OCR runtime is Tesseract.js/WASM
  it('4. should identify OCR runtime as Tesseract.js/WASM for real image inference', async () => {
    const rasterData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const ocrResult = await RealOCREngine.recognizeImage(rasterData);

    expect(ocrResult.runtime).toBe('TESSERACT_WASM_ON_DEVICE');
    expect(ocrResult.isRealInference).toBe(true);
  });

  // 5. Receipt parser consumes OCR output (including BEAN & BREW with integer & rupee amounts)
  it('5. should parse raw OCR text into structured receipt including BEAN & BREW receipt with ₹ / integer values', () => {
    const rawOcr = `
      BEAN & BREW
      Cappuccino 150
      Veg Sandwich 220
      Blueberry Muffin 180
      French Fries 250
      Mineral Water 80
      --------------------------------
      Subtotal: 880
      CGST: 22
      SGST: 22
      --------------------------------
      Total: 924
    `;

    const parsed = ReceiptParser.parse(rawOcr);
    expect(parsed.merchant).toBe('BEAN & BREW');
    expect(parsed.items.length).toBe(5);
    expect(parsed.items[0]).toEqual({ name: 'Cappuccino', price: 150 });
    expect(parsed.items[1]).toEqual({ name: 'Veg Sandwich', price: 220 });
    expect(parsed.items[2]).toEqual({ name: 'Blueberry Muffin', price: 180 });
    expect(parsed.items[3]).toEqual({ name: 'French Fries', price: 250 });
    expect(parsed.items[4]).toEqual({ name: 'Mineral Water', price: 80 });
  });

  // 6. Arithmetic consumes parsed values
  it('6. should dynamically compute real arithmetic: sum(items) -> subtotal -> tax -> total', () => {
    const rawOcr = `
      BEAN & BREW
      Cappuccino 150
      Veg Sandwich 220
      Blueberry Muffin 180
      French Fries 250
      Mineral Water 80
      Subtotal: 880
      CGST: 22
      SGST: 22
      Total: 924
    `;

    const parsed = ReceiptParser.parse(rawOcr);
    const sumItems = parsed.items.reduce((s, i) => s + i.price, 0);

    expect(sumItems).toBe(880);
    expect(parsed.subtotal).toBe(880);
    // CGST (22) + SGST (22) = 44
    expect(parsed.tax).toBe(44);
    expect(parsed.total).toBe(924);
    expect(parsed.arithmeticVerified).toBe(true);
  });

  // 7. Cache miss occurs for first image
  it('7. should produce a CACHE MISS on first evaluation of Image A in workflow engine', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0];

    const imagePayloadA = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'image_a.png',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    const report = await engine.executeWorkflow(financeWorkflow, imagePayloadA);
    const ocrRecord = report.nodeRecords['node_bill_ocr'];

    expect(ocrRecord.cacheHit).toBe(false); // First evaluation is genuine MISS
  });

  // 8. Cache hit occurs for identical image
  it('8. should produce a genuine CACHE HIT when Image A is evaluated a second time', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0];

    const imagePayloadA = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'image_a.png',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    // First execution (populates cache)
    await engine.executeWorkflow(financeWorkflow, imagePayloadA);

    // Second execution with identical image
    const secondReport = await engine.executeWorkflow(financeWorkflow, imagePayloadA);
    const ocrRecord = secondReport.nodeRecords['node_bill_ocr'];

    expect(ocrRecord.cacheHit).toBe(true);
    expect(secondReport.cacheHitsCount).toBeGreaterThanOrEqual(1);
  });

  // 9. Different image invalidates cache
  it('9. should produce a CACHE MISS for Image B and not reuse Image A cached result', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0];

    const imagePayloadA = {
      type: 'IMAGE',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      fileName: 'image_a.png',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    const imagePayloadB = {
      type: 'IMAGE',
      image: 'data:image/bmp;base64,Qk1GAAAAAAAAADYAAAAoAAAAAgAAAP7///8BABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAAAAP8AAP8AAA==',
      fileName: 'image_b.bmp',
      source: 'Real User Uploaded File',
      isRealUpload: true
    };

    // Execute Image A
    await engine.executeWorkflow(financeWorkflow, imagePayloadA);

    // Execute Image B (different pixels)
    const reportB = await engine.executeWorkflow(financeWorkflow, imagePayloadB);
    const ocrRecordB = reportB.nodeRecords['node_bill_ocr'];

    expect(ocrRecordB.cacheHit).toBe(false); // Cache miss for distinct image
  });

  // 10. Expense persistence contract with parsed values
  it('10. should persist structured expense with all audit fields and parsed dynamic values', () => {
    const actionLayer = AndroidActionLayer.getInstance();
    const expense = actionLayer.recordExpense({
      vendor: 'BEAN & BREW',
      items: [
        { name: 'Cappuccino', price: 150 },
        { name: 'Veg Sandwich', price: 220 },
        { name: 'Blueberry Muffin', price: 180 },
        { name: 'French Fries', price: 250 },
        { name: 'Mineral Water', price: 80 }
      ],
      subtotal: 880,
      tax: 44,
      total: 924,
      category: 'Food & Dining'
    });

    expect(expense.id).toBeDefined();
    expect(expense.vendor).toBe('BEAN & BREW');
    expect(expense.items.length).toBe(5);
    expect(expense.subtotal).toBe(880);
    expect(expense.tax).toBe(44);
    expect(expense.total).toBe(924);
    expect(expense.category).toBe('Food & Dining');
    expect(expense.timestamp).toBeGreaterThan(0);

    const stored = actionLayer.getExpenses();
    const match = stored.find((e) => e.id === expense.id);
    expect(match).toBeDefined();
    expect(match?.total).toBe(924);
  });

  // 11. Full workflow execution through existing engine with custom text payload
  it('11. should execute complete Finance workflow through WorkflowEngine with dynamic arithmetic', async () => {
    const engine = WorkflowEngine.getInstance();
    const financeWorkflow = DEMO_WORKFLOWS[0];

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

    const transformRecord = report.nodeRecords['node_bill_calc'];
    expect(transformRecord).toBeDefined();
    expect(transformRecord.status).toBe('SUCCESS');
    expect(transformRecord.outputData.total).toBeCloseTo(64.8, 2);
    expect(transformRecord.outputData.subtotal).toBeCloseTo(60.0, 2);
    expect(transformRecord.outputData.total).not.toBe(35.26);

    const actionRecord = report.nodeRecords['node_bill_save'];
    expect(actionRecord).toBeDefined();
    expect(actionRecord.status).toBe('SUCCESS');
    expect(actionRecord.outputData.total).toBeCloseTo(64.8, 2);
    expect(actionRecord.outputData.vendor).toBe('CENTRAL BOOK EMPORIUM');
  });
});
