import { supabase } from '../../config/supabase.config';
import { HealthCheckInsert } from '../../types/database.types';

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

      // Return first item if exists, otherwise null
      if (error) {
        // PGRST116 = no rows found, not an error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }

      // Return first item or null
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (error: any) {
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
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
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
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}