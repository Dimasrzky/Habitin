import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { ENV_CONFIG } from './env.config';
import { auth } from './firebase.config';

const supabaseUrl = ENV_CONFIG.supabase.url;
const supabaseAnonKey = ENV_CONFIG.supabase.anonKey;
const supabaseServiceRoleKey = ENV_CONFIG.supabase.serviceRoleKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey ? {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
}: undefined);

// ✅ SYNC FIREBASE AUTH TO SUPABASE
export const syncAuthToSupabase = async () => {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      console.log('⚠️ No Firebase user found');
      return;
    }

    const idToken = await firebaseUser.getIdToken();
    
    // Set Supabase auth header manually
    supabase.auth.setSession({
      access_token: idToken,
      refresh_token: '', // Firebase doesn't use refresh tokens this way
    });

    console.log('✅ Auth synced to Supabase');
  } catch (error) {
    console.error('❌ Error syncing auth:', error);
  }
};