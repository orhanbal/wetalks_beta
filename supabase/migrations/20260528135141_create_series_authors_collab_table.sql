/*
  # Series Co-Authors / Publication System

  1. New Tables
    - `series_authors` — many-to-many: a series can have multiple authors
      - `series_id` (text, FK to series.id)
      - `author_id` (uuid, FK to profiles.id)
      - `role` (text) — 'lead' | 'contributor' | 'editor'
      - `joined_at` (timestamptz)
      - PRIMARY KEY (series_id, author_id)

  2. Security
    - RLS enabled
    - Anyone can read (public)
    - Admins/editors can insert/update/delete
    - Authors can see their own rows

  3. Migrate existing series.author_id into series_authors as lead authors
*/

CREATE TABLE IF NOT EXISTS series_authors (
  series_id text NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead', 'contributor', 'editor')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (series_id, author_id)
);

ALTER TABLE series_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read series authors"
  ON series_authors FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage series authors"
  ON series_authors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can delete series authors"
  ON series_authors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can update series authors"
  ON series_authors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE INDEX IF NOT EXISTS idx_series_authors_author_id ON series_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_series_authors_series_id ON series_authors(series_id);

-- Backfill existing series.author_id into series_authors as lead
INSERT INTO series_authors (series_id, author_id, role)
SELECT id, author_id, 'lead'
FROM series
WHERE author_id IS NOT NULL
ON CONFLICT (series_id, author_id) DO NOTHING;
