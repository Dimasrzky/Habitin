// src/hooks/useLabUpload.ts

import { useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../config/firebase.config';
import { saveLabResult } from '../services/health/healthAPI';
import { calculateRisk } from '../services/health/riskCalculator';
import { extractHealthData } from '../services/ocr/healthDataExtractor';
import { performOCR } from '../services/ocr/ocrService';
import { uploadLabImage } from '../services/storage/uploadService';

export const useLabUpload = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processLabUpload = async (fileUri: string): Promise<string | null> => {
    try {
      console.log('🚀 Starting lab upload process...');
      setLoading(true);
      setProgress(0);

      // STEP 0: Verify Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert(
          'Authentication Required',
          'Please login first to upload lab results.'
        );
        throw new Error('User not authenticated');
      }

      const userId = currentUser.uid;
      console.log('✅ Authenticated user:', userId);

      // STEP 1: Upload image to Supabase Storage
      console.log('📤 Step 1: Uploading file...');
      setProgress(20);
      const imageUrl = await uploadLabImage(fileUri, userId);
      console.log('✅ Upload complete:', imageUrl);

      // STEP 2: Perform OCR
      console.log('🔍 Step 2: Running OCR...');
      setProgress(40);
      const ocrResult = await performOCR(fileUri);
      console.log('✅ OCR complete, text length:', ocrResult.fullText.length);

      // STEP 3: Extract health data
      console.log('📊 Step 3: Extracting health data...');
      setProgress(60);
      const healthData = extractHealthData(ocrResult.fullText);

      if (!healthData) {
        Alert.alert(
          'Extraction Failed',
          'Could not extract health data from the image. Please ensure the image is clear and contains lab results.'
        );
        throw new Error('Health data extraction failed');
      }

      console.log('✅ Health data extracted:', healthData);

      // STEP 4: Calculate risk
      console.log('⚠️ Step 4: Calculating risk...');
      setProgress(80);
      const riskAnalysis = calculateRisk(healthData);
      console.log('✅ Risk calculated:', riskAnalysis);

      // STEP 5: Save to database
      console.log('💾 Step 5: Saving to database...');
      setProgress(90);

      const now = new Date().toISOString();
      
      // ✅ FIX: Use correct property names from ExtractedHealthData
      const labResult = await saveLabResult({
        user_id: userId,
        glucose_level: healthData.glucose_level,           // ✅ Fixed
        cholesterol_total: healthData.cholesterol_total,   // ✅ Fixed
        cholesterol_ldl: healthData.cholesterol_ldl,       // ✅ Fixed
        cholesterol_hdl: healthData.cholesterol_hdl,       // ✅ Fixed
        triglycerides: healthData.triglycerides,
        hba1c: healthData.hba1c,
        risk_level: riskAnalysis.level,
        risk_score: riskAnalysis.score,
        image_url: imageUrl,
        raw_ocr_text: ocrResult.fullText,
        created_at: now,
        updated_at: now,
      });

      // ✅ FIX: saveLabResult returns LabResult directly, not { data, error }
      if (!labResult || !labResult.id) {
        throw new Error('Failed to save result to database');
      }

      console.log('✅ Saved to database:', labResult.id);

      setProgress(100);
      setLoading(false);

      return labResult.id;
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setLoading(false);
      setProgress(0);

      Alert.alert(
        'Upload Failed',
        err instanceof Error ? err.message : 'An unknown error occurred'
      );

      throw err;
    }
  };

  return {
    loading,
    progress,
    processLabUpload,
  };
};