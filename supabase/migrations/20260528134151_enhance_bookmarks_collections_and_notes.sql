/*
  # Enhance Bookmarks: Collections and Notes

  1. Changes to `bookmarks` table
    - Add `note` (text, nullable) — personal note on a bookmark
    - Add `collection_id` (uuid, nullable FK to bookmark_collections)

  2. New Tables
    - `bookmark_collections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to profiles)
      - `name` (text)
      - `color` (text) — hex color for visual differentiation
      - `created_at` (timestamptz)

  3. Security
    - RLS on bookmark_collections: users can only access their own
    - bookmarks table already has RLS; just need UPDATE policy for note/collection_id

  4. Site Settings
    - feature_bookmarks = 'true' default
*/

-- New collections table
CREATE TABLE IF NOT EXISTS bookmark_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookmark_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON bookmark_collections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own collections"
  ON bookmark_collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own collections"
  ON bookmark_collections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own collections"
  ON bookmark_collections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_bookmark_collections_user_id ON bookmark_collections(user_id);

-- Add note and collection_id to bookmarks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmarks' AND column_name = 'note'
  ) THEN
    ALTER TABLE bookmarks ADD COLUMN note text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmarks' AND column_name = 'collection_id'
  ) THEN
    ALTER TABLE bookmarks ADD COLUMN collection_id uuid REFERENCES bookmark_collections(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add UPDATE policy for bookmarks (for note/collection_id edits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookmarks' AND policyname = 'Users can update own bookmarks'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Users can update own bookmarks"
        ON bookmarks FOR UPDATE
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid())
    $pol$;
  END IF;
END $$;

-- Feature flag
INSERT INTO site_settings (key, value) VALUES ('feature_bookmarks', 'true')
ON CONFLICT (key) DO NOTHING;
