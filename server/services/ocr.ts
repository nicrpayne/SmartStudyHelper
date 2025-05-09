import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Function to preprocess image before OCR
async function preprocessImage(filePath: string): Promise<string> {
  try {
    const outputPath = `${filePath}_processed.png`;
    
    await sharp(filePath)
      // Convert to grayscale
      .grayscale()
      // Increase contrast
      .normalize()
      // Adjust brightness
      .modulate({ brightness: 1.1 })
      // Reduce noise
      .median(1)
      // Save as PNG
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error("Image preprocessing error:", error);
    // If preprocessing fails, return original file path
    return filePath;
  }
}

// Function to perform OCR on an image
export async function processOCR(filePath: string): Promise<{ text: string; confidence: number }> {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    
    // Process only image files
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      // Preprocess the image for better OCR results
      const processedFilePath = await preprocessImage(filePath);
      
      // Perform OCR
      const result = await Tesseract.recognize(
        processedFilePath,
        'eng',
        {
          logger: m => console.log(m)
        }
      );
      
      // Clean up the processed file if it's different from the original
      if (processedFilePath !== filePath) {
        await fs.unlink(processedFilePath).catch(err => console.error("Error removing processed file:", err));
      }
      
      // Return the OCR results
      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence
      };
    } else if (ext === '.pdf') {
      // For PDF files, we could potentially extract text directly or convert to images first
      // This would require additional libraries like pdf.js or pdf-parse
      throw new Error("PDF OCR processing is not implemented yet");
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error("OCR processing error:", error);
    throw new Error(`OCR processing failed: ${(error as Error).message}`);
  }
}
