/*
  # Create newsletter_send_logs table

  Tracks every newsletter send attempt for admin audit trail.

  1. New Tables
    - `newsletter_send_logs`
      - `id` (uuid, primary key)
      - `sent_at` (timestamptz)
      - `subject` (text)
      - `recipient_count` (int)
      - `status` (text: 'success' | 'error')
      - `error_message` (text, nullable)
*/

CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at timestamptz DEFAULT now(),
  subject text NOT NULL DEFAULT '',
  recipient_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message text
);

ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view send logs"
  ON newsletter_send_logs FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

CREATE POLICY "Service role can insert send logs"
  ON newsletter_send_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
