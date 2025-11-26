import { supabase } from '../../config/supabase.config';
import { HealthCheckInsert } from '../../types/database.types';

// Simple interface untuk hasil query
interface HealthCheckRow {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  blood_pressure: string | null;
  heart_rate: number | null;
  check_date: string;
  notes: string | null;
  created_at: string;
}

export class HealthService {
  // Get latest health check for user
  static async getLatestHealthCheck(userId: string) {
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .eq('user_id', userId)
        .order('check_date', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }

      const healthChecks = (data || []) as HealthCheckRow[];
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
        .from('health_checks')
        .select('*')
        .eq('user_id', userId)
        .order('check_date', { ascending: false });

      if (error) throw error;

      return { data: (data || []) as HealthCheckRow[], error: null };
    } catch (error: any) {
      console.error('Error getting health checks:', error);
      return { data: [] as HealthCheckRow[], error: error.message };
    }
  }

  // Create new health check
  static async createHealthCheck(healthCheck: HealthCheckInsert) {
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .insert(healthCheck)
        .select()
        .single();

      if (error) throw error;

      return { data: data as HealthCheckRow, error: null };
    } catch (error: any) {
      console.error('Error creating health check:', error);
      return { data: null, error: error.message };
    }
  }
}