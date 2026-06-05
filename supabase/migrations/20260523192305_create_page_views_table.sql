/*
  # Create page_views table for analytics

  1. New Tables
    - `page_views`
      - `id` (uuid, primary key)
      - `page` (text) — URL path e.g. "/makaleler/slug"
      - `article_id` (text, nullable) — article slug if on article page
      - `referrer` (text, nullable) — referring URL
      - `user_agent` (text, nullable) — browser user agent
      - `language` (text, nullable) — browser language
      - `screen_width` (int, nullable)
      - `visited_at` (timestamptz) — when the visit occurred
      - `session_id` (text, nullable) — random per-session ID for deduplication

  2. Security
    - Enable RLS
    - Public INSERT (anyone can log a page view)
    - Only authenticated users can SELECT (admin reads analytics)

  3. Indexes
    - visited_at for time-range queries
    - article_id for per-article stats
    - page for per-page stats
*/

CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL DEFAULT '',
  article_id text,
  referrer text,
  user_agent text,
  language text,
  screen_width integer,
  session_id text,
  visited_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS page_views_visited_at_idx ON page_views (visited_at DESC);
CREATE INDEX IF NOT EXISTS page_views_article_id_idx ON page_views (article_id);
CREATE INDEX IF NOT EXISTS page_views_page_idx ON page_views (page);
