import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './env.config';

const supabaseUrl = ENV_CONFIG.supabase.url;
const serviceRoleKey = ENV_CONFIG.supabase.serviceRoleKey;

if (!serviceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found - storage uploads will fail!');
  console.warn('Get it from: Supabase Dashboard → Settings → API → Legacy anon, service_role API keys');
}

// ⚠️ This client BYPASSES RLS - use ONLY for storage operations!
// DO NOT use for database queries - it will bypass all security policies!
export const supabaseStorage = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase storage client created (service role)');