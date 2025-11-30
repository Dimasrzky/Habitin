// src/hooks/useLabUpload.ts
import { auth } from '@/config/firebase.config';
import { saveLabResult } from '@/services/health/healthAPI';
import { calculateHealthRisk } from '@/services/health/riskCalculator';
import { extractHealthData } from '@/services/ocr/healthDataExtractor';
import { performOCR } from '@/services/ocr/ocrService';
import { uploadLabImage } from '@/services/storage/uploadService';
import { useState } from 'react';

export interface LabUploadResult {
  success: boolean;
  imageUrl?: string;
  labResultId?: string;
  riskLevel?: 'rendah' | 'sedang' | 'tinggi';
  error?: string;
}

type UploadProgress = 'uploading' | 'ocr' | 'analyzing' | 'saving' | null;

export function useLabUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);

  const processLabUpload = async (fileUri: string): Promise<LabUploadResult> => {
    try {
      console.log('🚀 Starting lab upload process...');
      setIsUploading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const userId = currentUser.uid;
      console.log('✅ Authenticated user:', userId);

      console.log('📤 Step 1: Uploading file...');
      setUploadProgress('uploading');
      const imageUrl = await uploadLabImage(fileUri, userId);
      console.log('✅ Upload complete:', imageUrl);

      console.log('🔍 Step 2: Running OCR...');
      setUploadProgress('ocr');
      const ocrResult = await performOCR(fileUri);
      if (!ocrResult.success) {
        throw new Error('OCR failed: ' + (ocrResult.error || 'Unknown error'));
      }
      console.log('✅ OCR complete, text length:', ocrResult.fullText.length);

      console.log('📊 Step 3: Extracting health data...');
      setUploadProgress('analyzing');
      const healthData = extractHealthData(ocrResult.fullText);
      console.log('✅ Health data extracted:', healthData);

      console.log('⚖️ Step 4: Calculating risk...');
      const riskResult = calculateHealthRisk(healthData);
      console.log('✅ Risk calculated:', riskResult);

      console.log('💾 Step 5: Saving to database...');
      setUploadProgress('saving');
      const labResult = await saveLabResult(
        userId,
        imageUrl,
        healthData,
        riskResult.level,
        riskResult.score,
        ocrResult.fullText
      );
      console.log('✅ Lab result saved, ID:', labResult.id);

      setUploadProgress(null);
      setIsUploading(false);

      return {
        success: true,
        imageUrl,
        labResultId: labResult.id,
        riskLevel: riskResult.level,
      };
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadProgress(null);
      setIsUploading(false);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return {
    processLabUpload,
    isUploading,
    uploadProgress,
  };
}