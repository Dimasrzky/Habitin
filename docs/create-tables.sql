-- =====================================================
-- CREATE ALL REQUIRED TABLES
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- This creates all tables needed for the community feature

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Check if table exists first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE users (
      id TEXT PRIMARY KEY,  -- Firebase Auth UID
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_users_email ON users(email);

    RAISE NOTICE 'Table users created successfully';
  ELSE
    -- Table exists, ensure id column is TEXT
    ALTER TABLE users ALTER COLUMN id TYPE TEXT;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
      ALTER TABLE users ADD COLUMN avatar_url TEXT;
      RAISE NOTICE 'Added avatar_url column to users table';
    END IF;

    RAISE NOTICE 'Table users already exists, updated columns';
  END IF;
END $$;

-- =====================================================
-- 2. COMMUNITY POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- References users.id (TEXT, not UUID)
  post_type TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  metrics JSONB,
  reactions_count JSONB DEFAULT '{"likes": 0, "supports": 0, "celebrates": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- Ensure user_id is TEXT
DO $$
BEGIN
  ALTER TABLE community_posts ALTER COLUMN user_id TYPE TEXT;
  RAISE NOTICE 'Updated community_posts.user_id to TEXT';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'community_posts.user_id already TEXT or error: %', SQLERRM;
END $$;

-- =====================================================
-- 3. POST REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,  -- References users.id (TEXT, not UUID)
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);

-- Ensure user_id is TEXT
DO $$
BEGIN
  ALTER TABLE post_reactions ALTER COLUMN user_id TYPE TEXT;
  RAISE NOTICE 'Updated post_reactions.user_id to TEXT';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'post_reactions.user_id already TEXT or error: %', SQLERRM;
END $$;

-- =====================================================
-- 4. ADD CHECK CONSTRAINTS
-- =====================================================
-- Drop existing constraints if any
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_post_type_check;
ALTER TABLE post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

-- Add new constraints
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));

ALTER TABLE post_reactions
  ADD CONSTRAINT post_reactions_reaction_type_check
  CHECK (reaction_type IN ('like', 'support', 'celebrate'));

-- =====================================================
-- 5. DISABLE RLS (Row Level Security)
-- =====================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE UPDATE TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. VERIFY TABLES CREATED
-- =====================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('users', 'community_posts', 'post_reactions')
ORDER BY table_name;

-- =====================================================
-- 8. VERIFY CONSTRAINTS
-- =====================================================
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname IN ('community_posts', 'post_reactions')
  AND con.contype = 'c'
ORDER BY rel.relname, con.conname;

-- =====================================================
-- 9. VERIFY RLS DISABLED
-- =====================================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'community_posts', 'post_reactions')
ORDER BY tablename;

-- Expected: rowsecurity = false for all tables

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created/updated successfully!';
  RAISE NOTICE '✅ Check constraints added';
  RAISE NOTICE '✅ RLS disabled';
  RAISE NOTICE '✅ Ready to use!';
END $$;
