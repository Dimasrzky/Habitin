-- =====================================================
-- DEBUG CHECK CONSTRAINT
-- =====================================================
-- Run this to debug the post_type constraint issue

-- 1. Check current constraint definition
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'community_posts'
  AND con.conname LIKE '%post_type%';

-- 2. Check column info
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_posts'
  AND column_name = 'post_type';

-- 3. Drop constraint and recreate with exact values
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_post_type_check CASCADE;

-- 4. Recreate constraint with EXACT lowercase values
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type::text = ANY (ARRAY['progress'::text, 'tips'::text, 'photo'::text, 'story'::text]));

-- 5. Verify constraint created
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'community_posts'
  AND con.conname LIKE '%post_type%';

-- 6. Test insert with each valid value
-- Uncomment to test:

/*
-- Test 'story' (should succeed)
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-1', 'story', 'Test story')
RETURNING *;

-- Test 'progress' (should succeed)
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-2', 'progress', 'Test progress')
RETURNING *;

-- Test 'tips' (should succeed)
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-3', 'tips', 'Test tips')
RETURNING *;

-- Test 'photo' (should succeed)
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-4', 'photo', 'Test photo')
RETURNING *;

-- Test invalid (should fail)
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-user-5', 'invalid', 'Test invalid')
RETURNING *;

-- Clean up test data
DELETE FROM community_posts WHERE user_id LIKE 'test-user-%';
*/

-- 7. Check if there's any existing data with invalid post_type
SELECT DISTINCT post_type
FROM community_posts;

-- If you see any values other than 'progress', 'tips', 'photo', 'story',
-- you need to fix or delete those rows first

-- 8. Optional: Fix invalid existing data
/*
-- Example: Convert invalid values to 'story'
UPDATE community_posts
SET post_type = 'story'
WHERE post_type NOT IN ('progress', 'tips', 'photo', 'story');
*/
