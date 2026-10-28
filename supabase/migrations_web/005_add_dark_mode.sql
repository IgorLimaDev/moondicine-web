-- Add dark mode support to user profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;
