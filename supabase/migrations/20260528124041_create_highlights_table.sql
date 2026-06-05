/*
  # Metin Vurgulama (Highlight) Sistemi

  1. Yeni Tablo
    - `highlights`
      - `id` (uuid, primary key)
      - `article_id` (text, articles.id)
      - `user_id` (uuid, auth.users)
      - `selected_text` (text, vurgulanan metin — max 1000 karakter)
      - `color` (text, vurgu rengi: yellow/green/blue/pink)
      - `created_at` (timestamptz)
    - Bir kullanıcı aynı makaleye max 50 vurgu ekleyebilir (uygulama katmanında kontrol edilir)

  2. Güvenlik
    - RLS aktif
    - Kullanıcı yalnızca kendi vurgularını görebilir ve yönetebilir
*/

CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_text text NOT NULL CHECK (char_length(selected_text) >= 1 AND char_length(selected_text) <= 1000),
  color text NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'pink')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own highlights"
  ON highlights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON highlights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON highlights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS highlights_article_user_idx ON highlights(article_id, user_id);
