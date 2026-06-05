/*
  # Add username to profiles

  Adds a unique, URL-safe `username` column to the profiles table so authors
  can have short handles like @orhanbalci instead of UUIDs in URLs.

  1. Changes
    - `profiles.username` — lowercase alphanumeric + hyphens/underscores, unique, nullable
      (nullable so existing rows don't break; users set it via their profile page)

  2. Index
    - Unique index on username for fast lookups

  3. Security
    - Existing RLS policies remain unchanged
    - Users can only update their own username (enforced by existing update policy)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text;
  END IF;
END $$;

-- Unique constraint (case-insensitive via lower())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles' AND indexname = 'profiles_username_unique'
  ) THEN
    CREATE UNIQUE INDEX profiles_username_unique ON profiles (lower(username));
  END IF;
END $$;

-- Check constraint: only lowercase letters, digits, hyphens, underscores, 2-30 chars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_username_format'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_format
      CHECK (username IS NULL OR username ~ '^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$');
  END IF;
END $$;
