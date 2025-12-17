// Types untuk Supabase tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          updated_at?: string;
        };
      };
      health_checks: {
        Row: {
          id: string;
          user_id: string;
          weight: number | null;
          height: number | null;
          blood_pressure: string | null;
          heart_rate: number | null;
          check_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          weight?: number | null;
          height?: number | null;
          blood_pressure?: string | null;
          heart_rate?: number | null;
          check_date?: string;
          notes?: string | null;
        };
        Update: {
          weight?: number | null;
          height?: number | null;
          blood_pressure?: string | null;
          heart_rate?: number | null;
          check_date?: string;
          notes?: string | null;
        };
      };
      master_challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          emoji: string | null;
          category: string;
          health_focus: string;
          duration_days: number;
          daily_tasks: any[];
          total_points: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          emoji?: string | null;
          category: string;
          health_focus: string;
          duration_days: number;
          daily_tasks: any[];
          total_points: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          emoji?: string | null;
          category?: string;
          health_focus?: string;
          duration_days?: number;
          daily_tasks?: any[];
          total_points?: number;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      user_active_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: 'active' | 'completed' | 'failed' | 'abandoned';
          current_day: number;
          daily_progress: any;
          current_streak: number;
          longest_streak: number;
          started_at: string;
          completed_at: string | null;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          challenge_id: string;
          status?: 'active' | 'completed' | 'failed' | 'abandoned';
          current_day?: number;
          daily_progress?: any;
          current_streak?: number;
          longest_streak?: number;
          started_at?: string;
          completed_at?: string | null;
          last_activity_at?: string;
        };
        Update: {
          status?: 'active' | 'completed' | 'failed' | 'abandoned';
          current_day?: number;
          daily_progress?: any;
          current_streak?: number;
          longest_streak?: number;
          completed_at?: string | null;
          last_activity_at?: string;
          updated_at?: string;
        };
      };
      user_challenge_stats: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          total_challenges_completed: number;
          total_daily_quests_completed: number;
          current_fire_streak: number;
          longest_fire_streak: number;
          last_activity_date: string | null;
          badges_earned: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_points?: number;
          total_challenges_completed?: number;
          total_daily_quests_completed?: number;
          current_fire_streak?: number;
          longest_fire_streak?: number;
          last_activity_date?: string | null;
          badges_earned?: any[];
        };
        Update: {
          total_points?: number;
          total_challenges_completed?: number;
          total_daily_quests_completed?: number;
          current_fire_streak?: number;
          longest_fire_streak?: number;
          last_activity_date?: string | null;
          badges_earned?: any[];
          updated_at?: string;
        };
      };
      daily_quests: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          emoji: string | null;
          points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          emoji?: string | null;
          points?: number;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          emoji?: string | null;
          points?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      user_daily_quest_completions: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          completed_at: string;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          quest_id: string;
          completed_at?: string;
          points_earned: number;
        };
        Update: {
          completed_at?: string;
          points_earned?: number;
        };
      };
      lab_results: {
        Row: {
          id: string;
          user_id: string;
          glucose_level: number | null;
          glucose_2h: number | null;
          cholesterol_total: number | null;
          cholesterol_ldl: number | null;
          cholesterol_hdl: number | null;
          triglycerides: number | null;
          hba1c: number | null;
          risk_level: 'rendah' | 'sedang' | 'tinggi';
          risk_score: number;
          image_url: string;
          raw_ocr_text: string | null;
          diabetes_risk_percentage: number | null;
          cholesterol_risk_percentage: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          glucose_level?: number | null;
          glucose_2h?: number | null;
          cholesterol_total?: number | null;
          cholesterol_ldl?: number | null;
          cholesterol_hdl?: number | null;
          triglycerides?: number | null;
          hba1c?: number | null;
          risk_level: 'rendah' | 'sedang' | 'tinggi';
          risk_score: number;
          image_url: string;
          raw_ocr_text?: string | null;
          diabetes_risk_percentage?: number | null;
          cholesterol_risk_percentage?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          glucose_level?: number | null;
          glucose_2h?: number | null;
          cholesterol_total?: number | null;
          cholesterol_ldl?: number | null;
          cholesterol_hdl?: number | null;
          triglycerides?: number | null;
          hba1c?: number | null;
          risk_level?: 'rendah' | 'sedang' | 'tinggi';
          risk_score?: number;
          image_url?: string;
          raw_ocr_text?: string | null;
          diabetes_risk_percentage?: number | null;
          cholesterol_risk_percentage?: number | null;
          updated_at?: string;
        };
      };
    };
  };
}

// Exported types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type HealthCheck = Database['public']['Tables']['health_checks']['Row'];
export type HealthCheckInsert = Database['public']['Tables']['health_checks']['Insert'];
export type HealthCheckUpdate = Database['public']['Tables']['health_checks']['Update'];

export type MasterChallenge = Database['public']['Tables']['master_challenges']['Row'];
export type MasterChallengeInsert = Database['public']['Tables']['master_challenges']['Insert'];
export type MasterChallengeUpdate = Database['public']['Tables']['master_challenges']['Update'];

export type UserActiveChallenge = Database['public']['Tables']['user_active_challenges']['Row'];
export type UserActiveChallengeInsert = Database['public']['Tables']['user_active_challenges']['Insert'];
export type UserActiveChallengeUpdate = Database['public']['Tables']['user_active_challenges']['Update'];

export type UserChallengeStats = Database['public']['Tables']['user_challenge_stats']['Row'];
export type UserChallengeStatsInsert = Database['public']['Tables']['user_challenge_stats']['Insert'];
export type UserChallengeStatsUpdate = Database['public']['Tables']['user_challenge_stats']['Update'];

export type DailyQuest = Database['public']['Tables']['daily_quests']['Row'];
export type DailyQuestInsert = Database['public']['Tables']['daily_quests']['Insert'];
export type DailyQuestUpdate = Database['public']['Tables']['daily_quests']['Update'];

export type UserDailyQuestCompletion = Database['public']['Tables']['user_daily_quest_completions']['Row'];
export type UserDailyQuestCompletionInsert = Database['public']['Tables']['user_daily_quest_completions']['Insert'];
export type UserDailyQuestCompletionUpdate = Database['public']['Tables']['user_daily_quest_completions']['Update'];

export type LabResult = Database['public']['Tables']['lab_results']['Row'];
export type LabResultInsert = Database['public']['Tables']['lab_results']['Insert'];
export type LabResultUpdate = Database['public']['Tables']['lab_results']['Update'];

// Legacy alias for backward compatibility
export type Challenge = UserActiveChallenge;
export type ChallengeInsert = UserActiveChallengeInsert;
export type ChallengeUpdate = UserActiveChallengeUpdate;