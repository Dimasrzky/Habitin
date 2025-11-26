import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './env.config';

const supabaseUrl = ENV_CONFIG.supabase.url;
const supabaseAnonKey = ENV_CONFIG.supabase.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created');