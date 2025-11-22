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
      challenges: {
        Row: {
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
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          target: number;
          progress?: number;
          status?: 'active' | 'completed' | 'failed';
          start_date: string;
          end_date: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          target?: number;
          progress?: number;
          status?: 'active' | 'completed' | 'failed';
          start_date?: string;
          end_date?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type HealthCheck = Database['public']['Tables']['health_checks']['Row'];
export type HealthCheckInsert = Database['public']['Tables']['health_checks']['Insert'];

export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];