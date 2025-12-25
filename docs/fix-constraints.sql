-- =====================================================
-- FIX CHECK CONSTRAINTS
-- =====================================================
-- Error: new row violates check constraint "community_posts_post_type_check"
--
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Drop existing constraint (if exists)
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_post_type_check;

-- 2. Add correct constraint with exact values
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));

-- 3. Verify constraint
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'community_posts'
  AND con.conname LIKE '%post_type%';

-- Expected output:
-- constraint_name: community_posts_post_type_check
-- constraint_definition: CHECK (post_type = ANY (ARRAY['progress'::text, 'tips'::text, 'photo'::text, 'story'::text]))

-- =====================================================
-- TEST INSERT
-- =====================================================
-- Test if constraint works correctly

-- This should succeed:
/*
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-id', 'story', 'Test content');

-- Check if inserted
SELECT * FROM community_posts WHERE user_id = 'test-user-id';

-- Clean up test data
DELETE FROM community_posts WHERE user_id = 'test-user-id';
*/

-- This should fail (wrong post_type):
/*
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-id', 'invalid-type', 'Test content');
*/
