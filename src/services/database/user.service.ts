import { supabase } from '../../config/supabase.config';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  created_at: string;
  updated_at: string;
}

interface UserUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  updated_at?: string;
}

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
      return { data: data as UserRow, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Update user profile
  static async updateUser(userId: string, updates: UserUpdate) {
    try {
      const updateData: UserUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // @ts-ignore - Supabase type inference issue
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as UserRow, error: null };
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
      return { data: (data as Partial<UserRow>[]) || [], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }
}