/*
  # Add title column to page_views

  1. Changes
    - `page_views.title` (text, nullable) — human-readable page title for display in analytics
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_views' AND column_name = 'title'
  ) THEN
    ALTER TABLE page_views ADD COLUMN title text;
  END IF;
END $$;
