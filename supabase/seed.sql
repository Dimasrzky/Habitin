-- Seed data for testing
-- Note: In production, users will be created via Firebase Auth sync
-- This is just for development/testing purposes
-- Insert sample users (using test Firebase UIDs)
INSERT INTO public.users (
        id,
        email,
        full_name,
        avatar_url,
        phone,
        date_of_birth,
        gender,
        created_at
    )
VALUES (
        'test-user-1',
        'john.doe@example.com',
        'John Doe',
        NULL,
        '+6281234567890',
        '1990-01-15',
        'male',
        NOW()
    ),
    (
        'test-user-2',
        'jane.smith@example.com',
        'Jane Smith',
        NULL,
        '+6281234567891',
        '1992-05-20',
        'female',
        NOW()
    ),
    (
        'test-user-3',
        'bob.wilson@example.com',
        'Bob Wilson',
        NULL,
        '+6281234567892',
        '1988-11-30',
        'male',
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
-- Insert sample health checks
INSERT INTO public.health_checks (
        user_id,
        weight,
        height,
        blood_pressure,
        heart_rate,
        check_date,
        notes
    )
VALUES (
        'test-user-1',
        75.5,
        175.0,
        '120/80',
        72,
        CURRENT_DATE - INTERVAL '1 day',
        'Feeling good'
    ),
    (
        'test-user-1',
        75.0,
        175.0,
        '118/78',
        70,
        CURRENT_DATE - INTERVAL '7 days',
        'Weekly check'
    ),
    (
        'test-user-2',
        62.0,
        165.0,
        '115/75',
        68,
        CURRENT_DATE,
        'Morning check'
    ),
    (
        'test-user-3',
        85.0,
        180.0,
        '130/85',
        75,
        CURRENT_DATE - INTERVAL '2 days',
        'Need to exercise more'
    );
-- Insert sample challenges
INSERT INTO public.challenges (
        user_id,
        title,
        description,
        target,
        progress,
        status,
        start_date,
        end_date
    )
VALUES (
        'test-user-1',
        '7-Day Walking Challenge',
        'Walk 10,000 steps every day for 7 days',
        70000,
        45000,
        'active',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE + INTERVAL '4 days'
    ),
    (
        'test-user-1',
        '30-Day Water Intake',
        'Drink 8 glasses of water daily for 30 days',
        240,
        150,
        'active',
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE + INTERVAL '20 days'
    ),
    (
        'test-user-2',
        'Weekly Exercise Goal',
        'Exercise for 30 minutes, 5 times a week',
        5,
        3,
        'active',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '2 days'
    ),
    (
        'test-user-2',
        'Weight Loss Challenge',
        'Lose 2kg in 30 days',
        2,
        2,
        'completed',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE - INTERVAL '1 day'
    ),
    (
        'test-user-3',
        'Morning Meditation',
        'Meditate for 10 minutes every morning for 21 days',
        21,
        8,
        'active',
        CURRENT_DATE - INTERVAL '8 days',
        CURRENT_DATE + INTERVAL '13 days'
    );
-- Update statistics
ANALYZE public.users;
ANALYZE public.health_checks;
ANALYZE public.challenges;
-- Verify data
SELECT 'Users created:' AS info,
    COUNT(*) AS count
FROM public.users;
SELECT 'Health checks created:' AS info,
    COUNT(*) AS count
FROM public.health_checks;
SELECT 'Challenges created:' AS info,
    COUNT(*) AS count
FROM public.challenges;