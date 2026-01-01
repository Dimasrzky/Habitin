import { supabase } from '../../config/supabase.config';
import { HealthCheckInsert } from '../../types/database.types';
import { LabResult } from '../../types/health.types';
import { SelfCheckType } from '../../data/selfCheckQuestions';

interface SelfCheckResult {
  type: SelfCheckType;
  riskPercentage: number;
  totalScore: number;
  maxScore: number;
  timestamp: string;
}

export class HealthService {
  // Get latest health check for user
  static async getLatestHealthCheck(userId: string) {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }

      const healthChecks = (data as LabResult[]) || [];
      const healthCheck = healthChecks.length > 0 ? healthChecks[0] : null;

      return { data: healthCheck, error: null };
    } catch (error: any) {
      console.error('Error getting latest health check:', error);
      return { data: null, error: error.message };
    }
  }

  // Get all health checks for user
  static async getHealthChecks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: (data as LabResult[]) || [], error: null };
    } catch (error: any) {
      console.error('Error getting health checks:', error);
      return { data: [], error: error.message };
    }
  }

  // Create new health check
  static async createHealthCheck(healthCheck: HealthCheckInsert) {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('lab_results')
        .insert(healthCheck)
        .select()
        .single();

      if (error) throw error;

      return { data: data as LabResult, error: null };
    } catch (error: any) {
      console.error('Error creating health check:', error);
      return { data: null, error: error.message };
    }
  }
}

// Save self-check result to database
export async function saveSelfCheckResult(userId: string, result: SelfCheckResult) {
  try {
    // Calculate diabetes and cholesterol risk percentages based on type
    let diabetesRiskPercentage = null;
    let cholesterolRiskPercentage = null;

    if (result.type === 'diabetes') {
      diabetesRiskPercentage = result.riskPercentage;
    } else if (result.type === 'cholesterol') {
      cholesterolRiskPercentage = result.riskPercentage;
    } else if (result.type === 'both') {
      // For 'both' type, use the same percentage for both
      diabetesRiskPercentage = result.riskPercentage;
      cholesterolRiskPercentage = result.riskPercentage;
    }

    // Check if user already has a lab result
    const { data: existingResult } = await supabase
      .from('lab_results')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingResult) {
      // Update existing record
      const { data, error } = await supabase
        .from('lab_results')
        .update({
          diabetes_risk_percentage: diabetesRiskPercentage,
          cholesterol_risk_percentage: cholesterolRiskPercentage,
          updated_at: result.timestamp,
        })
        .eq('id', existingResult.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Create new record with self-check data
      const newLabResult = {
        user_id: userId,
        glucose_level: null,
        glucose_2h: null,
        cholesterol_total: null,
        cholesterol_ldl: null,
        cholesterol_hdl: null,
        triglycerides: null,
        hba1c: null,
        risk_level: 'sedang' as const,
        risk_score: result.riskPercentage,
        image_url: '',
        raw_ocr_text: 'Self-Check Result',
        diabetes_risk_percentage: diabetesRiskPercentage,
        cholesterol_risk_percentage: cholesterolRiskPercentage,
        created_at: result.timestamp,
        updated_at: result.timestamp,
      };

      const { data, error } = await supabase
        .from('lab_results')
        .insert(newLabResult)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error: any) {
    console.error('Error saving self-check result:', error);
    throw error;
  }
}