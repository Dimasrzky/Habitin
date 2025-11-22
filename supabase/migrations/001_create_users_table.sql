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
-- Create index
CREATE INDEX idx_users_email ON public.users(email);
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policy: Users dapat read own data
CREATE POLICY "Users can view own data" ON public.users FOR
SELECT USING (auth.uid()::text = id);
-- Policy: Users dapat update own data
CREATE POLICY "Users can update own data" ON public.users FOR
UPDATE USING (auth.uid()::text = id);