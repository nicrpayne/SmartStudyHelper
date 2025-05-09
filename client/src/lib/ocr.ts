import { createWorker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
}

export async function performOCR(imageData: string): Promise<OCRResult> {
  try {
    // Initialize worker
    const worker = await createWorker('eng');

    // Recognize text
    const result = await worker.recognize(imageData);
    
    // Terminate worker
    await worker.terminate();

    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image text');
  }
}
