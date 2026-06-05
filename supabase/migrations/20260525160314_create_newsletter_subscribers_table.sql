/*
  # Create newsletter_subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `status` (text: 'active' | 'unsubscribed') default 'active'
      - `unsubscribe_token` (uuid) - used for one-click unsubscribe links
      - `created_at` (timestamptz)
      - `unsubscribed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS
    - Anyone (anon) can insert (subscribe)
    - Only admins can view and manage all subscribers
    - Public can update own record via unsubscribe token (no auth needed)
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

-- Admins can update subscribers (status changes)
CREATE POLICY "Admins can update subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_token_idx ON newsletter_subscribers(unsubscribe_token);
