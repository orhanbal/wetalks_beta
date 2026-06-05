/*
  # Add country column to page_views

  1. Changes
    - `page_views.country` (text, nullable) — ISO 3166-1 alpha-2 country code (e.g. "TR", "US")
    - `page_views.country_name` (text, nullable) — full country name (e.g. "Türkiye")
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_views' AND column_name = 'country'
  ) THEN
    ALTER TABLE page_views ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_views' AND column_name = 'country_name'
  ) THEN
    ALTER TABLE page_views ADD COLUMN country_name text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS page_views_country_idx ON page_views (country);
