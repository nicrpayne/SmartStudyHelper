import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Function to preprocess image before OCR
async function preprocessImage(filePath: string): Promise<string> {
  try {
    const outputPath = `${filePath}_processed.png`;
    
    // Enhanced preprocessing pipeline for better text recognition
    await sharp(filePath)
      // Convert to grayscale
      .grayscale()
      // Increase contrast for better text visibility
      .normalize()
      // Sharpen the image to enhance text edges
      .sharpen({ sigma: 1.2 })
      // Adjust brightness for better contrast
      .modulate({ brightness: 1.2 })
      // Threshold to make text more distinct
      .threshold(128)
      // Reduce noise while preserving text edges
      .median(1)
      // Ensure proper resolution for OCR
      .resize({ 
        width: 2000, 
        height: 2000, 
        fit: 'inside',
        withoutEnlargement: true 
      })
      // Save as PNG (lossless format is better for OCR)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`Image preprocessed: ${outputPath}`);
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
      
      // Perform OCR with improved configuration
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
      
      // Clean and process the OCR results
      let extractedText = result.data.text.trim();
      
      // Remove excessive whitespace and normalize line breaks
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      // If the text is too short, try to extract more context
      if (extractedText.length < 10) {
        console.log("Extracted text too short, using original text");
        // Just ensure it's properly formatted
        extractedText = result.data.text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
      }
      
      console.log('Extracted OCR text:', extractedText);
      
      // Return the cleaned OCR results
      return {
        text: extractedText,
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
