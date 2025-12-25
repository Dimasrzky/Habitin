-- =====================================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- Reason: Using Firebase Auth instead of Supabase Auth
-- RLS policies expect Supabase Auth but we're using Firebase
-- For production, you can create custom RLS policies later

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on community_posts table
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on post_reactions table
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFY RLS IS DISABLED
-- =====================================================
-- Run this to confirm RLS is disabled:

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'community_posts', 'post_reactions');

-- Expected result: rowsecurity = false for all tables

-- =====================================================
-- ALTERNATIVE: Enable RLS with Permissive Policies
-- =====================================================
-- If you want to keep RLS enabled but allow all operations:
-- (Uncomment if needed)

/*
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all for now)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on community_posts" ON community_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on post_reactions" ON post_reactions
  FOR ALL USING (true) WITH CHECK (true);
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Disabling RLS is fine for development
-- 2. For production, consider implementing proper policies
-- 3. You can integrate Firebase Auth with Supabase RLS using JWT
-- 4. See: https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac
