/*
  # Create role_requests table

  1. New Tables
    - `role_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to profiles)
      - `requested_role` (text: 'author' | 'editor')
      - `message` (text, optional motivation message)
      - `status` (text: 'pending' | 'approved' | 'rejected')
      - `reviewed_by` (uuid, FK to profiles, nullable)
      - `reviewed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can insert and view their own requests
    - Admins can view all requests and update status
*/

CREATE TABLE IF NOT EXISTS role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('author', 'editor')),
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own role requests"
  ON role_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own requests (only if no pending request exists for same role)
CREATE POLICY "Users can create role requests"
  ON role_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all role requests"
  ON role_requests FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

-- Admins can update request status
CREATE POLICY "Admins can update role requests"
  ON role_requests FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS role_requests_user_id_idx ON role_requests(user_id);
CREATE INDEX IF NOT EXISTS role_requests_status_idx ON role_requests(status);
