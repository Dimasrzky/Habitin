// src/services/ocr/healthDataExtractor.ts
import { ExtractedHealthData } from '../../types/health.types';

/**
 * Extract health data from OCR text
 * Supports various lab result formats
 */
export function extractHealthData(ocrText: string): ExtractedHealthData {
  console.log('📊 Extracting health data from OCR text...');
  
  // Normalize text: lowercase, remove extra spaces/newlines
  const normalizedText = ocrText
    .toLowerCase()
    .replace(/\s+/g, ' ')  // Replace multiple spaces/newlines with single space
    .trim();
  
  console.log('📝 Normalized text preview:', normalizedText.substring(0, 200));

  const result: ExtractedHealthData = {
    glucose_level: null,
    cholesterol_total: null,
    cholesterol_ldl: null,
    cholesterol_hdl: null,
    triglycerides: null,
    hba1c: null,
  };

  // ==============================================
  // GLUCOSE PATTERNS
  // ==============================================
  const glucosePatterns = [
    /glukosa\s*puasa[:\s]*(\d+(?:[.,]\d+)?)/i,
    /gula\s*darah\s*puasa[:\s]*(\d+(?:[.,]\d+)?)/i,
    /glucose\s*fasting[:\s]*(\d+(?:[.,]\d+)?)/i,
    /fasting\s*glucose[:\s]*(\d+(?:[.,]\d+)?)/i,
    /gdp[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of glucosePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.glucose_level = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found glucose:', result.glucose_level);
      break;
    }
  }

  // ==============================================
  // HbA1c PATTERNS
  // ==============================================
  const hba1cPatterns = [
    /hb\s*a1c[:\s]*(\d+(?:[.,]\d+)?)/i,
    /hemoglobin\s*a1c[:\s]*(\d+(?:[.,]\d+)?)/i,
    /glycated\s*hemoglobin[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of hba1cPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.hba1c = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found HbA1c:', result.hba1c);
      break;
    }
  }

  // ==============================================
  // CHOLESTEROL TOTAL PATTERNS
  // ==============================================
  const cholesterolTotalPatterns = [
    /cholesterol\s*total[:\s]*(\d+(?:[.,]\d+)?)/i,
    /kolesterol\s*total[:\s]*(\d+(?:[.,]\d+)?)/i,
    /total\s*cholesterol[:\s]*(\d+(?:[.,]\d+)?)/i,
    /total\s*kolesterol[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of cholesterolTotalPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.cholesterol_total = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found cholesterol total:', result.cholesterol_total);
      break;
    }
  }

  // ==============================================
  // LDL PATTERNS
  // ==============================================
  const ldlPatterns = [
    /cholesterol\s*ldl[:\s]*(\d+(?:[.,]\d+)?)/i,
    /kolesterol\s*ldl[:\s]*(\d+(?:[.,]\d+)?)/i,
    /ldl\s*cholesterol[:\s]*(\d+(?:[.,]\d+)?)/i,
    /ldl[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of ldlPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.cholesterol_ldl = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found LDL:', result.cholesterol_ldl);
      break;
    }
  }

  // ==============================================
  // HDL PATTERNS
  // ==============================================
  const hdlPatterns = [
    /cholesterol\s*hdl[:\s]*(\d+(?:[.,]\d+)?)/i,
    /kolesterol\s*hdl[:\s]*(\d+(?:[.,]\d+)?)/i,
    /hdl\s*cholesterol[:\s]*(\d+(?:[.,]\d+)?)/i,
    /hdl[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of hdlPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.cholesterol_hdl = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found HDL:', result.cholesterol_hdl);
      break;
    }
  }

  // ==============================================
  // TRIGLYCERIDES PATTERNS
  // ==============================================
  const triglyceridesPatterns = [
    /trigliserida[:\s]*(\d+(?:[.,]\d+)?)/i,
    /triglycerides[:\s]*(\d+(?:[.,]\d+)?)/i,
    /trigliserid[:\s]*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const pattern of triglyceridesPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.triglycerides = parseFloat(match[1].replace(',', '.'));
      console.log('✅ Found triglycerides:', result.triglycerides);
      break;
    }
  }

  console.log('✅ Extracted health data:', result);
  return result;
}