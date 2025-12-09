import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const ENV_CONFIG = {
  firebase: {
    apiKey: extra.firebase?.apiKey || '',
    authDomain: extra.firebase?.authDomain || '',
    projectId: extra.firebase?.projectId || '',
    storageBucket: extra.firebase?.storageBucket || '',
    messagingSenderId: extra.firebase?.messagingSenderId || '',
    appId: extra.firebase?.appId || '',
  },
  supabase: {
    url: extra.supabase?.url || '',
    anonKey: extra.supabase?.anonKey || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  googleVision: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '',
  },
};

// Validation
export const validateConfig = () => {
  const missing: string[] = [];

  if (!ENV_CONFIG.firebase.apiKey) missing.push('Firebase API Key');
  if (!ENV_CONFIG.firebase.projectId) missing.push('Firebase Project ID');
  if (!ENV_CONFIG.supabase.url) missing.push('Supabase URL');
  if (!ENV_CONFIG.supabase.anonKey) missing.push('Supabase Anon Key');

  if (missing.length > 0) {
    console.warn('⚠️ Missing configuration:', missing.join(', '));
    return false;
  }
  return true;
};

validateConfig();