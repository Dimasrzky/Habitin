import { supabase } from '../../config/supabase.config';

export class UserService {
  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Update user profile
  static async updateUser(
    userId: string,
    updates: {
      full_name?: string | null;
      avatar_url?: string | null;
      phone?: string | null;
      date_of_birth?: string | null;
      gender?: 'male' | 'female' | 'other' | null;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Get all users (untuk komunitas)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}