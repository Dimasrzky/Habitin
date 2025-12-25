-- Database Schema for Habitin Community Feature
-- This schema supports Firebase Auth + Supabase Database architecture

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Note: id is TEXT (not UUID) to support Firebase Auth UIDs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Firebase Auth UID (not UUID)
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- COMMUNITY POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- References users.id (TEXT, not UUID)
  post_type TEXT NOT NULL CHECK (post_type IN ('progress', 'tips', 'photo', 'story')),
  content TEXT NOT NULL,
  image_url TEXT,
  metrics JSONB,  -- For progress posts: {steps, calories, distance, duration}
  reactions_count JSONB DEFAULT '{"likes": 0, "supports": 0, "celebrates": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- =====================================================
-- POST REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,  -- References users.id (TEXT, not UUID)
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'support', 'celebrate')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)  -- One reaction per user per post
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Create storage bucket for community images
-- Run this in Supabase Dashboard > Storage

-- Bucket: community-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Note: Since using Firebase Auth, you may need to disable RLS
-- or create custom policies based on your auth setup

-- Disable RLS for now (enable later with proper Firebase integration)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for community_posts table
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- If you already have these tables with UUID for user_id:
-- 1. Backup your data first
-- 2. Drop the old tables or rename them
-- 3. Run this schema to create new tables with TEXT user_id
-- 4. Migrate existing data if needed

-- Example migration (if needed):
-- ALTER TABLE users ALTER COLUMN id TYPE TEXT;
-- ALTER TABLE community_posts ALTER COLUMN user_id TYPE TEXT;
-- ALTER TABLE post_reactions ALTER COLUMN user_id TYPE TEXT;
