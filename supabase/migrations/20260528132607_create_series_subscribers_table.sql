/*
  # Create series_subscribers table

  1. New Tables
    - `series_subscribers` — stores per-series email subscriptions
      - `id` (uuid, primary key)
      - `series_id` (text, FK to series.id — series.id is text type)
      - `email` (text)
      - `user_id` (uuid, nullable, FK to profiles)
      - `unsubscribe_token` (uuid, unique per row)
      - `status` (text) — 'active' | 'unsubscribed'
      - `created_at` (timestamptz)

    - `series_notification_logs` — audit log for sent chapter notifications

  2. Security
    - RLS enabled on both tables
    - Anyone can subscribe (INSERT)
    - Authenticated users can view/delete their own rows
    - Admins/editors can read notification logs

  3. Site Settings
    - Adds `feature_series_newsletter = 'true'` default
*/

CREATE TABLE IF NOT EXISTS series_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id text NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (series_id, email)
);

ALTER TABLE series_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to a series"
  ON series_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own series subscriptions"
  ON series_subscribers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can unsubscribe themselves"
  ON series_subscribers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own series subscriptions"
  ON series_subscribers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_series_subscribers_series_id ON series_subscribers(series_id);
CREATE INDEX IF NOT EXISTS idx_series_subscribers_email ON series_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_series_subscribers_token ON series_subscribers(unsubscribe_token);

-- Series notification log
CREATE TABLE IF NOT EXISTS series_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id text NOT NULL,
  series_title text,
  article_id text,
  article_title text,
  recipient_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE series_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read series notification logs"
  ON series_notification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Service role can insert series notification logs"
  ON series_notification_logs FOR INSERT
  WITH CHECK (true);

-- Feature flag
INSERT INTO site_settings (key, value) VALUES ('feature_series_newsletter', 'true')
ON CONFLICT (key) DO NOTHING;
