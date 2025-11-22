import { User as FirebaseUser } from 'firebase/auth';
import { supabase } from '../../config/supabase.config';

export class AuthSyncService {
  // Sync Firebase user ke Supabase setelah register
  static async syncUserToSupabase(firebaseUser: FirebaseUser) {
    try {
      // Data user untuk insert ke Supabase
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: firebaseUser.displayName || null,
        avatar_url: firebaseUser.photoURL || null,
      };

      // Insert ke Supabase users table
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        // Jika user sudah ada (duplicate), anggap berhasil
        if (error.code === '23505') {
          console.log('User already exists in Supabase');
          return { data: null, error: null };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error syncing user to Supabase:', error);
      return { data: null, error: error.message };
    }
  }

  // Fetch user data dari Supabase
  static async fetchUserFromSupabase(uid: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching user from Supabase:', error);
      return { data: null, error: error.message };
    }
  }

  // Update user data di Supabase
  static async updateUserInSupabase(
    uid: string,
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
        .update(updates)
        .eq('id', uid)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating user in Supabase:', error);
      return { data: null, error: error.message };
    }
  }
}