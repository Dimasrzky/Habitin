// src/services/health/healthAPI.ts
import { supabaseStorage as supabase } from '@/config/supabase.storage'; // ← CHANGED
import { LabResult } from '@/types/health.types';

/**
 * Save lab result to database
 * Uses service role key to bypass RLS
 */
export async function saveLabResult(
  userId: string,
  imageUrl: string,
  data: {
    glucose_level: number | null;
    cholesterol_total: number | null;
    cholesterol_ldl: number | null;
    cholesterol_hdl: number | null;
    triglycerides: number | null;
    hba1c: number | null;
  },
  riskLevel: 'rendah' | 'sedang' | 'tinggi',
  riskScore: number
): Promise<LabResult> {
  try {
    console.log('💾 Saving lab result to database...');
    console.log('👤 User ID:', userId);
    console.log('📊 Health data:', data);
    console.log('⚖️ Risk:', { level: riskLevel, score: riskScore });

    // Insert lab result
    const { data: result, error } = await supabase
      .from('lab_results')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        glucose_level: data.glucose_level,
        cholesterol_total: data.cholesterol_total,
        cholesterol_ldl: data.cholesterol_ldl,
        cholesterol_hdl: data.cholesterol_hdl,
        triglycerides: data.triglycerides,
        hba1c: data.hba1c,
        risk_level: riskLevel,
        risk_score: riskScore,
        created_at: new Date().toISOString(),
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

/**
 * Get lab results for user
 */
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

/**
 * Get latest lab result for user
 */
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
        // No rows found
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