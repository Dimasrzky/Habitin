-- Create health_checks table
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    weight DECIMAL(5, 2),
    -- Weight in kg (e.g., 75.50)
    height DECIMAL(5, 2),
    -- Height in cm (e.g., 175.00)
    blood_pressure TEXT,
    -- Format: "120/80"
    heart_rate INTEGER,
    -- Beats per minute
    check_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_checks_user_id ON public.health_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_check_date ON public.health_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON public.health_checks(created_at DESC);
-- Enable Row Level Security
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own health checks" ON public.health_checks;
DROP POLICY IF EXISTS "Users can insert own health checks" ON public.health_checks;
DROP POLICY IF EXISTS "Users can update own health checks" ON public.health_checks;
DROP POLICY IF EXISTS "Users can delete own health checks" ON public.health_checks;
-- Policy: Users can view own health checks
CREATE POLICY "Users can view own health checks" ON public.health_checks FOR
SELECT USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can insert own health checks
CREATE POLICY "Users can insert own health checks" ON public.health_checks FOR
INSERT WITH CHECK (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can update own health checks
CREATE POLICY "Users can update own health checks" ON public.health_checks FOR
UPDATE USING (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) WITH CHECK (
        user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );
-- Policy: Users can delete own health checks
CREATE POLICY "Users can delete own health checks" ON public.health_checks FOR DELETE USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
);
-- Add check constraints
ALTER TABLE public.health_checks
ADD CONSTRAINT check_weight_positive CHECK (
        weight IS NULL
        OR weight > 0
    ),
    ADD CONSTRAINT check_height_positive CHECK (
        height IS NULL
        OR height > 0
    ),
    ADD CONSTRAINT check_heart_rate_valid CHECK (
        heart_rate IS NULL
        OR (
            heart_rate >= 40
            AND heart_rate <= 220
        )
    );
-- Add comments for documentation
COMMENT ON TABLE public.health_checks IS 'User health check records';
COMMENT ON COLUMN public.health_checks.user_id IS 'Reference to user';
COMMENT ON COLUMN public.health_checks.weight IS 'Weight in kilograms';
COMMENT ON COLUMN public.health_checks.height IS 'Height in centimeters';
COMMENT ON COLUMN public.health_checks.blood_pressure IS 'Blood pressure in format systolic/diastolic (e.g., 120/80)';
COMMENT ON COLUMN public.health_checks.heart_rate IS 'Heart rate in beats per minute';
COMMENT ON COLUMN public.health_checks.check_date IS 'Date of health check';
COMMENT ON COLUMN public.health_checks.notes IS 'Additional notes about health check';