/*
  # Fix profiles table and handle_new_user trigger

  1. Changes
    - Add `full_name` column alias: rename `display_name` → add `full_name` (keep display_name for compat)
    - Actually add `full_name` column to profiles if missing
    - Update handle_new_user trigger function to use correct column name

  2. Notes
    - The existing trigger references `full_name` but the column was created as `display_name`
    - We add `full_name` and fix the trigger
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text DEFAULT '';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
