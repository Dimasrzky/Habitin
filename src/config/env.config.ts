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
  },
};

export const validateConfig = () => {
  const missing: string[] = [];

  if (!ENV_CONFIG.firebase.apiKey) {
    console.warn('⚠️ Firebase API Key not found');
    missing.push('Firebase API Key');
  }
  if (!ENV_CONFIG.firebase.projectId) {
    console.warn('⚠️ Firebase Project ID not found');
    missing.push('Firebase Project ID');
  }
  if (!ENV_CONFIG.supabase.url) {
    console.warn('⚠️ Supabase URL not found');
    missing.push('Supabase URL');
  }
  if (!ENV_CONFIG.supabase.anonKey) {
    console.warn('⚠️ Supabase Anon Key not found');
    missing.push('Supabase Anon Key');
  }

  if (missing.length > 0) {
    console.warn('Missing configuration:', missing.join(', '));
    console.warn('App may not work correctly');
    return false;
  }

  console.log('✅ All environment variables validated');
  return true;
};

// Auto-validate on import
validateConfig();