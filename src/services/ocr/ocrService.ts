import { analyzeImageWithVisionAPI } from '../../config/googleVision.config';
import type { OCRResult } from '../../types/health.types';
import { convertToBase64 } from '../storage/uploadService'; // ✅ Import helper

/**
 * Perform OCR on lab result image
 */
export const performOCR = async (imageUri: string): Promise<OCRResult> => {
  try {
    console.log('🔍 Starting OCR process...');
    console.log('📄 Image URI:', imageUri);

    // ✅ CRITICAL FIX: Convert file URI to base64 first!
    const base64Image = await convertToBase64(imageUri);
    console.log('✅ Converted to base64, length:', base64Image.length);

    // Call Google Vision API with base64 content
    const visionResult = await analyzeImageWithVisionAPI(base64Image);

    // Extract text from Vision API response
    const fullText = visionResult.responses?.[0]?.textAnnotations?.[0]?.description || '';
    
    console.log('✅ OCR complete, text length:', fullText.length);
    console.log('📝 Extracted text preview:', fullText.substring(0, 200));

    return {
      success: true,
      fullText,
      confidence: 0.9, // Vision API doesn't return overall confidence
    };
  } catch (error: any) {
    console.error('❌ OCR Error:', error);
    throw error;
  }
};