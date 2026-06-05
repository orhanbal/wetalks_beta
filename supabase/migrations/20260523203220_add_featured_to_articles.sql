/*
  # Add featured flag to articles

  Adds a `featured` boolean column to the articles table.
  Featured articles are shown in the homepage hero slider.
  Defaults to false so existing articles are unaffected.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'featured'
  ) THEN
    ALTER TABLE articles ADD COLUMN featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(featured);
