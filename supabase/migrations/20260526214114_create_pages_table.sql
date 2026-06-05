/*
  # Create pages table

  ## Summary
  Ghost CMS tarzı özel sayfalar sistemi. Her sayfa bir slug (URL), başlık ve blok tabanlı içerikten oluşur.
  Mevcut "Hakkımda" sayfası da bu sistem üzerinden yönetilebilir.

  ## New Tables
  - `pages`
    - `id` (uuid, primary key)
    - `title` (text) — sayfa başlığı
    - `slug` (text, unique) — URL yolu, örn: "hakkimda", "ekip", "gizlilik"
    - `content` (jsonb) — blok tabanlı içerik (BlockEditor formatı)
    - `excerpt` (text) — kısa özet / meta description
    - `og_image` (text) — sosyal medya görseli URL
    - `published` (boolean) — yayın durumu
    - `show_in_nav` (boolean) — navigasyonda göster
    - `nav_label` (text) — navigasyon etiketi (boşsa title kullanılır)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `author_id` (uuid, FK → profiles.id)

  ## Security
  - RLS enabled
  - SELECT: published sayfalar herkese açık; taslaklar sadece admin/editor'a
  - INSERT/UPDATE/DELETE: sadece admin rolüne sahip kullanıcılar
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL,
  content jsonb DEFAULT '[]',
  excerpt text DEFAULT '',
  og_image text DEFAULT '',
  published boolean DEFAULT false,
  show_in_nav boolean DEFAULT false,
  nav_label text DEFAULT '',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Published pages are publicly readable"
  ON pages FOR SELECT
  USING (published = true);

-- Admins and editors can read all pages (including drafts)
CREATE POLICY "Admins and editors can read all pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Only admins can insert pages
CREATE POLICY "Admins can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update pages
CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete pages
CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_published_idx ON pages(published);
