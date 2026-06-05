/*
  # Writer Platform: Stats & Content Ownership

  ## Summary
  This migration prepares the database for the multi-author writer platform by:

  1. **Writer Stats View**
     - Creates a `writer_stats` view that aggregates per-author metrics:
       article count, total page views (reads), published article count, draft count.
     - Used by the WriterDashboard to display badges and stats.

  2. **Content Ownership RLS Hardening**
     - Adds INSERT policy: authors can only create articles assigned to themselves.
     - Adds UPDATE policy: authors can only update their own articles; editors/admins can update any.
     - Adds DELETE policy: only admins can delete articles.
     - Same ownership rules applied to series table.

  3. **Auto-set author_id on insert**
     - Creates a trigger `set_article_author_id` that automatically sets `author_id = auth.uid()`
       when a new article is inserted without an explicit author_id.
     - Same trigger added for series.

  ## Notes
  - `get_my_role()` security-definer function already exists from previous migration.
  - All new policies use `auth.uid()` not `current_user`.
  - The writer_stats view is accessible to the authenticated user for their own row only (via RLS on page_views).
*/

-- ─── AUTO-SET author_id ON INSERT ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_author_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_article_author_id ON articles;
CREATE TRIGGER set_article_author_id
  BEFORE INSERT ON articles
  FOR EACH ROW EXECUTE FUNCTION set_author_id_on_insert();

DROP TRIGGER IF EXISTS set_series_author_id ON series;
CREATE TRIGGER set_series_author_id
  BEFORE INSERT ON series
  FOR EACH ROW EXECUTE FUNCTION set_author_id_on_insert();

-- ─── ARTICLES RLS: OWNERSHIP POLICIES ──────────────────────────────────────

-- Authors can insert articles (author_id will be set to their uid by trigger)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Authors can insert own articles'
  ) THEN
    CREATE POLICY "Authors can insert own articles"
      ON articles FOR INSERT
      TO authenticated
      WITH CHECK (
        get_my_role() IN ('author', 'editor', 'admin')
      );
  END IF;
END $$;

-- Authors can update their own articles; editors/admins can update any
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Authors can update own articles'
  ) THEN
    CREATE POLICY "Authors can update own articles"
      ON articles FOR UPDATE
      TO authenticated
      USING (
        author_id = auth.uid()
        OR get_my_role() IN ('editor', 'admin')
      )
      WITH CHECK (
        author_id = auth.uid()
        OR get_my_role() IN ('editor', 'admin')
      );
  END IF;
END $$;

-- Only admins can delete articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Admins can delete articles'
  ) THEN
    CREATE POLICY "Admins can delete articles"
      ON articles FOR DELETE
      TO authenticated
      USING (get_my_role() = 'admin');
  END IF;
END $$;

-- ─── SERIES RLS: OWNERSHIP POLICIES ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Authors can insert own series'
  ) THEN
    CREATE POLICY "Authors can insert own series"
      ON series FOR INSERT
      TO authenticated
      WITH CHECK (
        get_my_role() IN ('author', 'editor', 'admin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Authors can update own series'
  ) THEN
    CREATE POLICY "Authors can update own series"
      ON series FOR UPDATE
      TO authenticated
      USING (
        author_id = auth.uid()
        OR get_my_role() IN ('editor', 'admin')
      )
      WITH CHECK (
        author_id = auth.uid()
        OR get_my_role() IN ('editor', 'admin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Admins can delete series'
  ) THEN
    CREATE POLICY "Admins can delete series"
      ON series FOR DELETE
      TO authenticated
      USING (get_my_role() = 'admin');
  END IF;
END $$;

-- ─── WRITER STATS VIEW ──────────────────────────────────────────────────────

CREATE OR REPLACE VIEW writer_stats AS
SELECT
  p.id AS author_id,
  p.full_name,
  p.avatar_url,
  p.role,
  COUNT(a.id) FILTER (WHERE a.author_id = p.id) AS total_articles,
  COUNT(a.id) FILTER (WHERE a.author_id = p.id AND a.published = true) AS published_articles,
  COUNT(a.id) FILTER (WHERE a.author_id = p.id AND a.published = false) AS draft_articles,
  COALESCE(
    (SELECT COUNT(*) FROM page_views pv
     JOIN articles ar ON pv.article_id = ar.id
     WHERE ar.author_id = p.id),
    0
  ) AS total_reads
FROM profiles p
LEFT JOIN articles a ON a.author_id = p.id
WHERE p.role IN ('author', 'editor', 'admin')
GROUP BY p.id, p.full_name, p.avatar_url, p.role;
