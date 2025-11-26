import { supabase } from '../../config/supabase.config';
import { ChallengeInsert } from '../../types/database.types';

interface ChallengeRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target: number;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface ChallengeStatus {
  status: 'active' | 'completed' | 'failed';
}

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

      return { data: (data as ChallengeRow[]) || [], error: null };
    } catch (error: any) {
      console.error('Error getting active challenges:', error);
      return { data: [], error: error.message };
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

      const challenges = (data as ChallengeStatus[]) || [];

      const stats = {
        total: challenges.length,
        active: challenges.filter((c) => c.status === 'active').length,
        completed: challenges.filter((c) => c.status === 'completed').length,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error getting challenge stats:', error);
      return {
        data: { total: 0, active: 0, completed: 0 },
        error: error.message,
      };
    }
  }

  // Create new challenge
  static async createChallenge(challenge: ChallengeInsert) {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('challenges')
        .insert(challenge)
        .select()
        .single();

      if (error) throw error;

      return { data: data as ChallengeRow, error: null };
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      return { data: null, error: error.message };
    }
  }

  // Update challenge progress
  static async updateChallengeProgress(challengeId: string, progress: number) {
    try {
      const validProgress = Math.max(0, Math.min(100, progress));
      const status: 'active' | 'completed' = validProgress >= 100 ? 'completed' : 'active';

      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('challenges')
        .update({
          progress: validProgress,
          status: status,
        })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as ChallengeRow, error: null };
    } catch (error: any) {
      console.error('Error updating challenge progress:', error);
      return { data: null, error: error.message };
    }
  }
}