/*
  # Add og_image column to articles and series

  1. Changes
    - `articles` table: add `og_image` (text, nullable) — custom Open Graph image URL
    - `series` table: add `og_image` (text, nullable) — custom Open Graph image URL

  2. Notes
    - When null, the frontend falls back to the site-wide default OG image
    - URLs should point to images sized 1200×630px for optimal social card rendering
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'og_image'
  ) THEN
    ALTER TABLE articles ADD COLUMN og_image text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series' AND column_name = 'og_image'
  ) THEN
    ALTER TABLE series ADD COLUMN og_image text;
  END IF;
END $$;
