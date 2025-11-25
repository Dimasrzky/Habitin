import { supabase } from '../../config/supabase.config';
import { ChallengeInsert } from '../../types/database.types';

export class ChallengeService {
  // Get active challenges for user
  static async getActiveChallenges(userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Get challenge stats
  static async getChallengeStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: data?.filter((c) => c.status === 'active').length || 0,
        completed: data?.filter((c) => c.status === 'completed').length || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Create new challenge
  static async createChallenge(challenge: ChallengeInsert) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert(challenge)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Update challenge progress
  static async updateChallengeProgress(
    challengeId: string,
    progress: number
  ) {
    try {
      // Calculate status based on progress
      let status: 'active' | 'completed' | 'failed' = 'active';
      if (progress >= 100) {
        status = 'completed';
      }

      const { data, error } = await supabase
        .from('challenges')
        .update({ progress, status })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}