/*
  # Add bio and social media fields to profiles

  1. Changes to `profiles` table
    - `bio` (text) — short personal description
    - `title` (text) — job title or tagline
    - `twitter` (text) — Twitter/X handle or URL
    - `instagram` (text) — Instagram handle or URL
    - `linkedin` (text) — LinkedIn URL
    - `website` (text) — personal website URL

  2. Notes
    - All new columns are nullable with empty string defaults
    - No RLS changes needed (existing policies cover profile updates)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'title') THEN
    ALTER TABLE profiles ADD COLUMN title text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter') THEN
    ALTER TABLE profiles ADD COLUMN twitter text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram') THEN
    ALTER TABLE profiles ADD COLUMN instagram text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin') THEN
    ALTER TABLE profiles ADD COLUMN linkedin text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website text DEFAULT '';
  END IF;
END $$;
