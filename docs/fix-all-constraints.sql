-- =====================================================
-- FIX ALL CONSTRAINTS - Community Posts
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Drop all existing check constraints
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_post_type_check;

ALTER TABLE post_reactions
  DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

-- Step 2: Recreate constraints with correct values
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));

ALTER TABLE post_reactions
  ADD CONSTRAINT post_reactions_reaction_type_check
  CHECK (reaction_type IN ('like', 'support', 'celebrate'));

-- Step 3: Verify all constraints
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname IN ('community_posts', 'post_reactions')
  AND con.contype = 'c'  -- c = check constraint
ORDER BY rel.relname, con.conname;

-- Step 4: Check column data types
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('community_posts', 'post_reactions')
  AND column_name IN ('post_type', 'reaction_type', 'user_id', 'content')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
/*
Constraints:
1. community_posts_post_type_check: CHECK (post_type = ANY (ARRAY['progress', 'tips', 'photo', 'story']))
2. post_reactions_reaction_type_check: CHECK (reaction_type = ANY (ARRAY['like', 'support', 'celebrate']))

Column Types:
- community_posts.user_id: TEXT
- community_posts.post_type: TEXT
- community_posts.content: TEXT
- post_reactions.user_id: TEXT
- post_reactions.reaction_type: TEXT
*/

-- =====================================================
-- TEST INSERTS
-- =====================================================
-- Uncomment to test

-- Test 1: Valid post_type (should succeed)
/*
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-firebase-uid', 'story', 'Test story content')
RETURNING *;
*/

-- Test 2: Invalid post_type (should fail with constraint error)
/*
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-firebase-uid', 'invalid', 'Test content');
*/

-- Clean up test data
/*
DELETE FROM community_posts WHERE user_id = 'test-firebase-uid';
*/
