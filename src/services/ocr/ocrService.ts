// src/services/ocr/ocrService.ts

import { analyzeImageWithVisionAPI } from '../../config/googleVision.config';
import type { OCRResult } from '../../types/health.types';
import { convertToBase64 } from '../storage/uploadService';

/**
 * Perform OCR on lab result image
 */
export const performOCR = async (imageUri: string): Promise<OCRResult> => {
  try {
    console.log('🔍 Starting OCR process...');
    console.log('📄 Image URI:', imageUri);

    // ✅ Gunakan helper yang sudah ada
    const base64Image = await convertToBase64(imageUri);
    console.log('✅ Converted to base64, length:', base64Image.length);

    const visionResult = await analyzeImageWithVisionAPI(base64Image);

    const fullText = visionResult.responses?.[0]?.textAnnotations?.[0]?.description || '';
    
    console.log('✅ OCR complete, text length:', fullText.length);
    console.log('📝 Extracted text preview:', fullText.substring(0, 200));

    return {
      success: true,
      fullText,
      confidence: 0.9,
    };
  } catch (error: any) {
    console.error('❌ OCR Error:', error);
    throw error;
  }
};