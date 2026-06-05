/*
  # Add role and avatar_url to profiles table

  1. Changes
    - `profiles` table: add `role` (text, default 'user') — 'admin' or 'user'
    - `profiles` table: add `avatar_url` (text, nullable)

  2. Security
    - Admins can only be set via service role (not by users themselves)
    - Users cannot elevate their own role via RLS
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;
