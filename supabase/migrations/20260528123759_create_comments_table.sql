/*
  # Yorumlar Sistemi

  1. Yeni Tablo
    - `comments`
      - `id` (uuid, primary key)
      - `article_id` (text, articles.id foreign key)
      - `user_id` (uuid, auth.users foreign key)
      - `body` (text, yorum içeriği — max 2000 karakter)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Güvenlik
    - RLS aktif
    - Herkes yorumları okuyabilir
    - Giriş yapmış kullanıcılar kendi yorumunu yazabilir
    - Kullanıcı kendi yorumunu güncelleyebilir
    - Kullanıcı ve adminler silebilir
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 2000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS comments_article_id_idx ON comments(article_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
