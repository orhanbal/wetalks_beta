/*
  # Anket Sistemi (Polls)

  1. Yeni Tablolar
    - `polls`
      - `id` (uuid, primary key)
      - `question` (text) — anket sorusu
      - `options` (jsonb) — seçenekler dizisi [{id, text}]
      - `is_active` (boolean) — yayında mı?
      - `ends_at` (timestamptz) — bitiş tarihi (opsiyonel)
      - `created_by` (uuid, fk → profiles)
      - `created_at` (timestamptz)
    - `poll_votes`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, fk → polls)
      - `option_id` (text) — seçenek id'si
      - `user_id` (uuid, nullable, fk → profiles) — giriş yapmış kullanıcı
      - `session_id` (text) — anonim oy takibi
      - `created_at` (timestamptz)

  2. Güvenlik
    - RLS aktif
    - Herkes aktif anketi okuyabilir
    - Herkes oy kullanabilir (session_id ile tekrar engeli)
    - Sadece admin poll oluşturabilir/düzenleyebilir
*/

CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL DEFAULT '',
  options jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT false,
  ends_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, session_id)
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: herkes okuyabilir
CREATE POLICY "Anyone can read polls"
  ON polls FOR SELECT
  TO anon, authenticated
  USING (true);

-- Polls: sadece admin oluşturabilir
CREATE POLICY "Admins can insert polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Polls: sadece admin güncelleyebilir
CREATE POLICY "Admins can update polls"
  ON polls FOR UPDATE
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

-- Polls: sadece admin silebilir
CREATE POLICY "Admins can delete polls"
  ON polls FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Poll votes: herkes okuyabilir (sonuç gösterimi için)
CREATE POLICY "Anyone can read poll votes"
  ON poll_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Poll votes: herkes oy verebilir
CREATE POLICY "Anyone can insert poll votes"
  ON poll_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
