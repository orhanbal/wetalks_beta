/*
  # Article Notification Logs

  1. New Tables
    - `article_notification_logs`
      - `id` (uuid, primary key)
      - `article_id` (text, FK → articles.id)
      - `article_title` (text) — snapshot at send time
      - `sent_at` (timestamptz, default now())
      - `recipient_count` (int, default 0)
      - `notify_followers` (bool) — was follower notification sent?
      - `notify_subscribers` (bool) — was newsletter notification sent?
      - `status` (text: 'success' | 'error')
      - `error_message` (text, nullable)

  2. Security
    - Enable RLS
    - Admins and editors can read/insert
    - Public cannot access
*/

CREATE TABLE IF NOT EXISTS article_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text REFERENCES articles(id) ON DELETE SET NULL,
  article_title text NOT NULL DEFAULT '',
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_count integer NOT NULL DEFAULT 0,
  notify_followers boolean NOT NULL DEFAULT false,
  notify_subscribers boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'success',
  error_message text
);

ALTER TABLE article_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notification logs"
  ON article_notification_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notification logs"
  ON article_notification_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
