import { supabase } from '../../config/supabase.config';
import { HealthCheckInsert } from '../../types/database.types';
import { LabResult } from '../../types/health.types';

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