-- =====================================================
-- QUICK FIX: post_type Constraint Error
-- =====================================================
-- Error: new row for relation "community_posts" violates check constraint
--
-- Run this EXACT script in Supabase SQL Editor

-- Step 1: Drop ALL existing constraints on post_type
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'community_posts'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%post_type%'
  LOOP
    EXECUTE 'ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name) || ' CASCADE';
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  END LOOP;
END $$;

-- Step 2: Create new constraint with exact format
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));

-- Step 3: Verify
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'community_posts'
  AND con.conname = 'community_posts_post_type_check';

-- Expected output:
-- constraint_name: community_posts_post_type_check
-- definition: CHECK ((post_type = ANY (ARRAY['progress'::text, 'tips'::text, 'photo'::text, 'story'::text])))

-- Step 4: Test insert (uncomment to test)
/*
-- This should SUCCEED:
INSERT INTO community_posts (user_id, post_type, content)
VALUES ('test-firebase-uid-123', 'story', 'Test content')
RETURNING id, user_id, post_type, content;

-- Clean up:
DELETE FROM community_posts WHERE user_id = 'test-firebase-uid-123';
*/

-- =====================================================
-- If still error, check for data type issues:
-- =====================================================

-- Check post_type column data type
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'community_posts'
  AND column_name = 'post_type';

-- Should be: data_type = 'text' or 'character varying'

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this, restart your Expo app:
-- npx expo start --clear
