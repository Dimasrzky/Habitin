-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target INTEGER NOT NULL,
    -- Target value (steps, days, etc.)
    progress INTEGER DEFAULT 0,
    -- Current progress
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON public.challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON public.challenges(end_date);
-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON public.challenges;
-- Policy: Users can view own challenges
CREATE POLICY "Users can view own challenges" ON public.challenges FOR
SELECT USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can insert own challenges
CREATE POLICY "Users can insert own challenges" ON public.challenges FOR
INSERT WITH CHECK (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can update own challenges
CREATE POLICY "Users can update own challenges" ON public.challenges FOR
UPDATE USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) WITH CHECK (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can delete own challenges
CREATE POLICY "Users can delete own challenges" ON public.challenges FOR DELETE USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
);
-- Add check constraints
ALTER TABLE public.challenges
ADD CONSTRAINT check_target_positive CHECK (target > 0),
    ADD CONSTRAINT check_progress_non_negative CHECK (progress >= 0),
    ADD CONSTRAINT check_progress_not_exceed_target CHECK (progress <= target),
    ADD CONSTRAINT check_end_date_after_start CHECK (end_date >= start_date);
-- Create function to automatically update status based on progress
CREATE OR REPLACE FUNCTION update_challenge_status() RETURNS TRIGGER AS $$ BEGIN IF NEW.progress >= NEW.target THEN NEW.status := 'completed';
ELSIF NEW.progress < NEW.target
AND NEW.end_date < CURRENT_DATE THEN NEW.status := 'failed';
ELSE NEW.status := 'active';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to automatically update status
DROP TRIGGER IF EXISTS trigger_update_challenge_status ON public.challenges;
CREATE TRIGGER trigger_update_challenge_status BEFORE
INSERT
    OR
UPDATE OF progress,
    target,
    end_date ON public.challenges FOR EACH ROW EXECUTE FUNCTION update_challenge_status();
-- Add comments for documentation
COMMENT ON TABLE public.challenges IS 'User challenges and goals';
COMMENT ON COLUMN public.challenges.user_id IS 'Reference to user';
COMMENT ON COLUMN public.challenges.title IS 'Challenge title';
COMMENT ON COLUMN public.challenges.description IS 'Challenge description';
COMMENT ON COLUMN public.challenges.target IS 'Target value to achieve (e.g., 10000 steps, 7 days)';
COMMENT ON COLUMN public.challenges.progress IS 'Current progress towards target';
COMMENT ON COLUMN public.challenges.status IS 'Challenge status: active, completed, or failed';
COMMENT ON COLUMN public.challenges.start_date IS 'Challenge start date';
COMMENT ON COLUMN public.challenges.end_date IS 'Challenge end date';