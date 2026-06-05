/*
  # Add author_id to series table

  1. Changes
    - `series` table: add `author_id` (uuid, nullable FK to profiles)

  2. Notes
    - Nullable so existing series are unaffected
    - Admin can assign an author when editing a series
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE series ADD COLUMN author_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
