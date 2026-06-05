/*
  # Alkış (Clap) Sistemi

  1. Yeni Tablo
    - `claps`
      - `id` (uuid, primary key)
      - `article_id` (text, articles.id foreign key — articles tablosu text id kullanıyor)
      - `user_id` (uuid, auth.users foreign key)
      - `count` (int, 1-50 arası)
      - `created_at` / `updated_at` (timestamptz)
    - UNIQUE (article_id, user_id)

  2. Güvenlik
    - RLS aktif
    - Herkes okuyabilir (alkış sayıları public)
    - Giriş yapmış kullanıcılar kendi alkışlarını yönetebilir
*/

CREATE TABLE IF NOT EXISTS claps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 1 AND count <= 50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (article_id, user_id)
);

ALTER TABLE claps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read claps"
  ON claps FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own claps"
  ON claps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claps"
  ON claps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own claps"
  ON claps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS claps_article_id_idx ON claps(article_id);
CREATE INDEX IF NOT EXISTS claps_user_id_idx ON claps(user_id);
