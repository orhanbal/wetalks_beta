/*
  # CMS Tables for Orhan Balcı Website

  1. New Tables
    - `series`
      - id (text, primary key) - slug-style ID
      - title (text)
      - tagline (text)
      - description (text)
      - concept_description (text, nullable)
      - topics (text[], nullable)
      - article_count (int, computed/managed manually)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    - `articles`
      - id (text, primary key) - slug-style ID
      - title (text)
      - category (text)
      - series_id (text, nullable, fk -> series.id)
      - series_title (text, nullable)
      - date (date)
      - excerpt (text)
      - reading_time (int)
      - content (text)
      - published (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    - `site_settings`
      - key (text, primary key)
      - value (text)
      - updated_at (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Public read access for published articles and all series/settings
    - Authenticated write access (admin)
*/

-- Series table
CREATE TABLE IF NOT EXISTS series (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  concept_description text,
  topics text[],
  article_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read series"
  ON series FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert series"
  ON series FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update series"
  ON series FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete series"
  ON series FOR DELETE
  TO authenticated
  USING (true);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Ticaret',
  series_id text REFERENCES series(id) ON DELETE SET NULL,
  series_title text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  excerpt text NOT NULL DEFAULT '',
  reading_time int NOT NULL DEFAULT 5,
  content text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Authenticated can read all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_series_id_idx ON articles(series_id);
CREATE INDEX IF NOT EXISTS articles_date_idx ON articles(date DESC);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
