import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './env.config';

// Create Supabase client WITHOUT generic type (let it infer)
export const supabase = createClient(
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