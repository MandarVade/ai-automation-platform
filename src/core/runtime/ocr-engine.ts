import { createWorker } from 'tesseract.js';

export interface OCRResult {
  rawText: string;
  confidence: number;
  wordCount: number;
  runtime: 'TESSERACT_WASM_ON_DEVICE' | 'PRESET_SIMULATION';
  isRealInference: boolean;
}

export class RealOCREngine {
  /**
   * Performs genuine on-device Optical Character Recognition using Tesseract WebAssembly.
   * Accepts image file, base64 data URL, or image buffer.
   */
  public static async recognizeImage(imageSource: string | File | Blob): Promise<OCRResult> {
    // If the imageSource is an explicit pre-extracted text preset (starts without image header/extension),
    // handle it as preset demo simulation
    if (
      typeof imageSource === 'string' &&
      !imageSource.startsWith('data:image') &&
      !imageSource.startsWith('blob:') &&
      !imageSource.startsWith('http') &&
      !/\.(png|jpe?g|webp|bmp|gif)$/i.test(imageSource.trim()) &&
      (imageSource.includes('\n') || imageSource.length > 20)
    ) {
      const trimmed = imageSource.trim();
      const words = trimmed.split(/\s+/).filter(Boolean);
      return {
        rawText: trimmed,
        confidence: 95,
        wordCount: words.length,
        runtime: 'PRESET_SIMULATION',
        isRealInference: false
      };
    }

    // Real image inference via Tesseract.js WASM
    const isBrowser = typeof window !== 'undefined';
    const origin = isBrowser && window.location ? window.location.origin : '';

    const workerOptions: any = {
      langPath: isBrowser ? origin : '.',
      gzip: false
    };

    if (isBrowser) {
      // Configure local Vite same-origin paths to prevent external CDN reliance
      workerOptions.workerBlobURL = false;
      workerOptions.workerPath = `${origin}/node_modules/tesseract.js/dist/worker.min.js`;
      workerOptions.corePath = `${origin}/node_modules/tesseract.js-core`;
    }

    let worker: any;
    try {
      worker = await createWorker('eng', 1, workerOptions);
    } catch (workerInitErr) {
      console.warn('Local Tesseract worker spawn error, attempting default worker configuration:', workerInitErr);
      worker = await createWorker('eng');
    }

    try {
      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const text = (ret.data && ret.data.text) ? ret.data.text.trim() : '';
      const words = text ? text.split(/\s+/).filter(Boolean) : [];

      return {
        rawText: text || 'NO_TEXT_DETECTED_IN_IMAGE',
        confidence: Math.round(ret.data?.confidence || 0),
        wordCount: words.length,
        runtime: 'TESSERACT_WASM_ON_DEVICE',
        isRealInference: true
      };
    } catch (inferErr: any) {
      if (worker) {
        try {
          await worker.terminate();
        } catch (_) {}
      }
      throw new Error(`Tesseract.js WASM OCR failed on uploaded image: ${inferErr?.message || inferErr}`);
    }
  }
}

