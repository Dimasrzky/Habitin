-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    -- Firebase UID
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
-- Policy: Users can view own data
CREATE POLICY "Users can view own data" ON public.users FOR
SELECT USING (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can insert own data (during registration)
CREATE POLICY "Users can insert own data" ON public.users FOR
INSERT WITH CHECK (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can update own data
CREATE POLICY "Users can update own data" ON public.users FOR
UPDATE USING (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) WITH CHECK (
        id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User profiles synced from Firebase Auth';
COMMENT ON COLUMN public.users.id IS 'Firebase Auth UID';
COMMENT ON COLUMN public.users.email IS 'User email address';
COMMENT ON COLUMN public.users.full_name IS 'User full name';
COMMENT ON COLUMN public.users.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.users.phone IS 'User phone number';
COMMENT ON COLUMN public.users.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.users.gender IS 'User gender (male/female/other)';