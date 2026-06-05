/*
  # Add supertitle and subtitle to articles

  Adds two optional display fields to the articles table:
  - `supertitle`: shown above the main title (e.g., series chapter/section label like "BÖLÜM I")
  - `subtitle`: shown below the main title (replaces or supplements excerpt in header)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'supertitle'
  ) THEN
    ALTER TABLE articles ADD COLUMN supertitle text DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE articles ADD COLUMN subtitle text DEFAULT NULL;
  END IF;
END $$;
