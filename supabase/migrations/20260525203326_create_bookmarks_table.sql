/*
  # Bookmarks tablosu

  Kullanıcıların makale ve yazı dizilerini kaydedebilmesi için bookmark sistemi.

  1. Yeni Tablo: `bookmarks`
     - `id` (uuid, pk)
     - `user_id` (uuid, auth.users FK)
     - `content_type` ('article' | 'series')
     - `content_id` (text) — article veya series id'si
     - `created_at` (timestamptz)

  2. Güvenlik
     - RLS aktif
     - Kullanıcı sadece kendi bookmark'larını görebilir/ekleyebilir/silebilir
     - (user_id, content_type, content_id) unique — çift kayıt önlenir
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('article', 'series')),
  content_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_content_idx ON bookmarks(content_type, content_id);
