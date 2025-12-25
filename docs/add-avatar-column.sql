-- =====================================================
-- ADD AVATAR_URL COLUMN TO USERS TABLE
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor

-- Check if column exists first, then add if not exists
DO $$
BEGIN
  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users
      ADD COLUMN avatar_url TEXT;

    RAISE NOTICE 'Column avatar_url added to users table';
  ELSE
    RAISE NOTICE 'Column avatar_url already exists in users table';
  END IF;
END $$;

-- Verify the column was added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('id', 'full_name', 'avatar_url', 'email')
ORDER BY ordinal_position;

-- Expected output should include:
-- id          | text    | NO
-- email       | text    | NO
-- full_name   | text    | YES
-- avatar_url  | text    | YES

-- =====================================================
-- OPTIONAL: Set avatar_url for existing users
-- =====================================================
-- If you want to set default avatar for existing users:
/*
UPDATE users
SET avatar_url = NULL
WHERE avatar_url IS NULL;
*/

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Avatar column is now ready to use
-- Users can now upload profile pictures via EditProfile screen
