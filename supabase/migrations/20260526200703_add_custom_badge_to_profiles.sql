/*
  # Add custom_badge column to profiles

  Allows admins to assign a custom badge to any author, overriding the
  automatic article-count-based badge.

  1. Changes
    - `profiles` table: new nullable `custom_badge` text column
      - NULL = use automatic badge based on article count
      - Any badge id string = use that badge instead
  2. Security
    - Existing admin update policy already covers this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_badge'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_badge text DEFAULT NULL;
  END IF;
END $$;
