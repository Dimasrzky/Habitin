import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ENV_CONFIG } from './env.config';

// Create Supabase client
export const supabase = createClient<Database>(
  ENV_CONFIG.supabase.url,
  ENV_CONFIG.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);