// src/services/ocr/healthDataExtractor.ts

import { ExtractedHealthData } from '../../types/health.types';

/**
 * ✅ Extract health data from OCR text
 * @param ocrText - Raw text from OCR
 * @returns Extracted health data with numerical values
 */
export const extractHealthData = (ocrText: string): ExtractedHealthData => {
  console.log('📊 Extracting health data from OCR text...');
  
  // Normalize text: lowercase, remove extra spaces
  const normalizedText = ocrText.toLowerCase().replace(/\s+/g, ' ');
  
  console.log('📝 Normalized text preview:', normalizedText.substring(0, 200));

  // ✅ Regex patterns untuk ekstrak data
  const patterns = {
    glucose: /gula\s*darah\s*(?:puasa)?\s*[:\-]?\s*(\d{2,3})/i,
    cholesterolTotal: /kolesterol\s*total\s*[:\-]?\s*(\d{2,3})/i,
    ldl: /ldl\s*[:\-]?\s*(\d{2,3})/i,
    hdl: /hdl\s*[:\-]?\s*(\d{2,3})/i,
    triglycerides: /trigliserida?\s*[:\-]?\s*(\d{2,3})/i,
    hba1c: /hba1c\s*[:\-]?\s*(\d{1,2}\.?\d?)/i,
  };

  // ✅ Extract values
  const glucose = patterns.glucose.exec(normalizedText);
  const cholesterolTotal = patterns.cholesterolTotal.exec(normalizedText);
  const ldl = patterns.ldl.exec(normalizedText);
  const hdl = patterns.hdl.exec(normalizedText);
  const triglycerides = patterns.triglycerides.exec(normalizedText);
  const hba1c = patterns.hba1c.exec(normalizedText);

  const result: ExtractedHealthData = {
    glucose_level: glucose ? parseInt(glucose[1], 10) : null,
    cholesterol_total: cholesterolTotal ? parseInt(cholesterolTotal[1], 10) : null,
    cholesterol_ldl: ldl ? parseInt(ldl[1], 10) : null,
    cholesterol_hdl: hdl ? parseInt(hdl[1], 10) : null,
    triglycerides: triglycerides ? parseInt(triglycerides[1], 10) : null,
    hba1c: hba1c ? parseFloat(hba1c[1]) : null,
  };

  console.log('✅ Extracted health data:', result);

  // Check if at least one value was extracted
  const hasAnyData = Object.values(result).some(value => value !== null);
  
  if (!hasAnyData) {
    console.warn('⚠️ No health data could be extracted from OCR text');
  }

  return result;
};