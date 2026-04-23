-- ============================================================
-- FIX: Relax CHECK constraints on profiles to allow trigger
-- to insert with empty first_name/last_name
-- (the auth.js pending_profile flow will update them after)
-- ============================================================

-- Drop the strict CHECK constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_first_name_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_last_name_check;

-- Re-add with >= 0 (allows empty string from trigger)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_first_name_check CHECK (char_length(first_name) >= 0);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_last_name_check CHECK (char_length(last_name) >= 0);

-- Also clean up any failed test users
DELETE FROM auth.users WHERE email = 'test@example.com';
