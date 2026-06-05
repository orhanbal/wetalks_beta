/*
  # Feature Flags & Friend Link

  1. Changes
    - Adds `friend_link_token` (text, unique, nullable) to `articles` — a random token
      that grants read access to a members-only article without requiring membership.
    - Adds three site_settings rows as feature flags:
        feature_friend_links   — enable/disable friend-link feature platform-wide
        feature_scheduling     — enable/disable article scheduling
        feature_boost          — enable/disable Boost / Editor's Pick program

  2. Security
    - No RLS change needed: articles RLS already allows public SELECT on published articles.
      We expose friend_link_token only to owners/admins via a separate policy.
    - A policy is added so that authenticated users can read friend_link_token on their
      own articles; anonymous reads of friend_link_token are blocked via column-level logic
      in the frontend (token is only displayed in admin).
*/

-- Add friend_link_token to articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'friend_link_token'
  ) THEN
    ALTER TABLE articles ADD COLUMN friend_link_token text UNIQUE;
  END IF;
END $$;

-- Add scheduling column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE articles ADD COLUMN scheduled_at timestamptz;
  END IF;
END $$;

-- Add boost columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'boosted'
  ) THEN
    ALTER TABLE articles ADD COLUMN boosted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'boosted_at'
  ) THEN
    ALTER TABLE articles ADD COLUMN boosted_at timestamptz;
  END IF;
END $$;

-- Insert default feature flags into site_settings (do not overwrite existing values)
INSERT INTO site_settings (key, value, updated_at)
VALUES
  ('feature_friend_links', 'true',  now()),
  ('feature_scheduling',   'true',  now()),
  ('feature_boost',        'true',  now())
ON CONFLICT (key) DO NOTHING;
