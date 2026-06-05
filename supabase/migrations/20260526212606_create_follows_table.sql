/*
  # Create follows table

  ## Summary
  Authenticated users can follow authors. Each row represents a follower → following relationship.

  ## New Tables
  - `follows`
    - `id` (uuid, primary key)
    - `follower_id` (uuid, FK → profiles.id) — the user who follows
    - `following_id` (uuid, FK → profiles.id) — the author being followed
    - `created_at` (timestamptz)
    - UNIQUE constraint on (follower_id, following_id)

  ## Security
  - RLS enabled
  - SELECT: authenticated users can read all follows (needed for follower counts and status checks)
  - INSERT: authenticated users can only insert rows where follower_id = auth.uid()
  - DELETE: authenticated users can only delete rows where follower_id = auth.uid()
*/

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
