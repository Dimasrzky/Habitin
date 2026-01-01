// src/services/health/healthAPI.ts

import { supabaseStorage as supabase } from '@/config/supabase.storage';
import { LabResult } from '@/types/health.types';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { getAuth } from 'firebase/auth';
import { extractHealthData } from '../ocr/healthDataExtractor';
import { performOCR } from '../ocr/ocrService';
import { calculateHealthRisk } from './riskCalculator';

// =====================================================
// EXISTING FUNCTIONS (KEEP AS IS)
// =====================================================

export async function saveLabResult(
  userId: string,
  imageUrl: string,
  data: {
    glucose_level: number | null;
    glucose_2h: number | null;
    cholesterol_total: number | null;
    cholesterol_ldl: number | null;
    cholesterol_hdl: number | null;
    triglycerides: number | null;
    hba1c: number | null;
  },
  riskLevel: 'rendah' | 'sedang' | 'tinggi',
  riskScore: number,
  rawOcrText?: string
): Promise<LabResult> {
  try {
    console.log('💾 Saving lab result to database...');
    console.log('👤 User ID:', userId);
    console.log('📊 Health data:', data);
    console.log('⚖️ Risk:', { level: riskLevel, score: riskScore });

    const { data: result, error } = await supabase
      .from('lab_results')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        glucose_level: data.glucose_level,
        glucose_2h: data.glucose_2h,
        cholesterol_total: data.cholesterol_total,
        cholesterol_ldl: data.cholesterol_ldl,
        cholesterol_hdl: data.cholesterol_hdl,
        triglycerides: data.triglycerides,
        hba1c: data.hba1c,
        risk_level: riskLevel,
        risk_score: riskScore,
        raw_ocr_text: rawOcrText || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Save lab result error:', error);
      throw error;
    }

    console.log('✅ Lab result saved successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Failed to save lab result:', error);
    throw error;
  }
}

export async function getLabResults(userId: string): Promise<LabResult[]> {
  try {
    console.log('📊 Fetching lab results for user:', userId);

    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch lab results error:', error);
      throw error;
    }

    console.log(`✅ Found ${data.length} lab results`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch lab results:', error);
    throw error;
  }
}

export async function getLatestLabResult(userId: string): Promise<LabResult | null> {
  try {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to fetch latest lab result:', error);
    return null;
  }
}

export async function deleteLabResult(labResultId: string, userId: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting lab result:', labResultId);

    // Delete from database
    const { error } = await supabase
      .from('lab_results')
      .delete()
      .eq('id', labResultId)
      .eq('user_id', userId); // Ensure user owns this record

    if (error) {
      console.error('❌ Delete lab result error:', error);
      throw error;
    }

    console.log('✅ Lab result deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete lab result:', error);
    return false;
  }
}

// =====================================================
// 🆕 NEW FUNCTION: UPLOAD WITH PROGRESS
// =====================================================

export interface UploadLabResponse {
  success: boolean;
  labResultId?: string;
  imageUrl?: string;
  riskLevel?: 'rendah' | 'sedang' | 'tinggi';
  riskScore?: number;
  error?: string;
}

export async function uploadLabResultWithProgress(
  imageUri: string,
  onProgress?: (step: number) => void
): Promise<UploadLabResponse> {
  try {
    console.log('🚀 Starting lab upload process...');

    // Auth check
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('✅ Authenticated user:', user.uid);

    // ============================================
    // STEP 0: UPLOAD FILE TO STORAGE
    // ============================================
    console.log('📤 Step 1: Uploading file...');
    onProgress?.(0);

    // ✅ FIX: Gunakan string literal 'base64' langsung
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64', // ✅ String literal, bukan EncodingType
    });
    console.log('✅ File read as base64, length:', base64.length);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}.jpeg`;
    const filePath = `lab-results/${user.uid}/${filename}`;
    console.log('📁 Upload path:', filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lab-results')
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    console.log('✅ Upload successful:', uploadData.path);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('lab-results')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;
    console.log('🔗 Public URL:', imageUrl);

    // ============================================
    // STEP 1: OCR PROCESSING
    // ============================================
    console.log('🔍 Step 2: Running OCR...');
    onProgress?.(1);

    const ocrResult = await performOCR(imageUri);
    const ocrText = ocrResult.fullText;
    console.log('✅ OCR complete, text length:', ocrText.length);

    // ============================================
    // STEP 2: EXTRACT DATA & CALCULATE RISK
    // ============================================
    console.log('📊 Step 3: Extracting health data...');
    onProgress?.(2);

    const healthData = extractHealthData(ocrText);
    console.log('✅ Health data extracted:', healthData);

    console.log('⚖️ Calculating risk...');
    const riskResult = calculateHealthRisk(healthData);
    console.log('✅ Risk calculated:', riskResult);

    // ============================================
    // STEP 3: SAVE TO DATABASE
    // ============================================
    console.log('💾 Step 4: Saving to database...');
    onProgress?.(3);

    const savedResult = await saveLabResult(
      user.uid,
      imageUrl,
      healthData,
      riskResult.level,
      riskResult.score,
      ocrText
    );

    console.log('✅ Lab result saved, ID:', savedResult.id);

    return {
      success: true,
      labResultId: savedResult.id,
      imageUrl: imageUrl,
      riskLevel: riskResult.level,
      riskScore: riskResult.score,
    };

  } catch (error) {
    console.error('❌ Error in uploadLabResultWithProgress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}