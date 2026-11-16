-- WeTalks latest self-hosted schema additions
-- Target: existing PostgreSQL schema exposed at /data/wetalks
-- Safe to run repeatedly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wetalks.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'BookOpen',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wetalks.calendar_events (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  end_date date,
  duration_days integer,
  time text,
  location text,
  organizer text,
  source_url text,
  is_ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wetalks.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wetalks.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wetalks.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wetalks.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON wetalks.categories;
CREATE POLICY "categories_public_read"
  ON wetalks.categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "categories_admin_write" ON wetalks.categories;
CREATE POLICY "categories_admin_write"
  ON wetalks.categories FOR ALL
  TO authenticated
  USING (wetalks.get_my_role() = 'admin')
  WITH CHECK (wetalks.get_my_role() = 'admin');

DROP POLICY IF EXISTS "calendar_events_public_read" ON wetalks.calendar_events;
CREATE POLICY "calendar_events_public_read"
  ON wetalks.calendar_events FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "calendar_events_editor_write" ON wetalks.calendar_events;
CREATE POLICY "calendar_events_editor_write"
  ON wetalks.calendar_events FOR ALL
  TO authenticated
  USING (wetalks.get_my_role() IN ('admin', 'editor'))
  WITH CHECK (wetalks.get_my_role() IN ('admin', 'editor'));

DROP POLICY IF EXISTS "contact_messages_public_insert" ON wetalks.contact_messages;
CREATE POLICY "contact_messages_public_insert"
  ON wetalks.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 2 AND 160
    AND position('@' in email) > 1
    AND length(trim(message)) BETWEEN 3 AND 10000
    AND status = 'unread'
  );

DROP POLICY IF EXISTS "contact_messages_admin_read" ON wetalks.contact_messages;
CREATE POLICY "contact_messages_admin_read"
  ON wetalks.contact_messages FOR SELECT
  TO authenticated
  USING (wetalks.get_my_role() = 'admin');

DROP POLICY IF EXISTS "contact_messages_admin_update" ON wetalks.contact_messages;
CREATE POLICY "contact_messages_admin_update"
  ON wetalks.contact_messages FOR UPDATE
  TO authenticated
  USING (wetalks.get_my_role() = 'admin')
  WITH CHECK (wetalks.get_my_role() = 'admin');

DROP POLICY IF EXISTS "contact_messages_admin_delete" ON wetalks.contact_messages;
CREATE POLICY "contact_messages_admin_delete"
  ON wetalks.contact_messages FOR DELETE
  TO authenticated
  USING (wetalks.get_my_role() = 'admin');

GRANT SELECT ON wetalks.categories, wetalks.calendar_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON wetalks.categories, wetalks.calendar_events TO authenticated;

GRANT INSERT ON wetalks.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON wetalks.contact_messages TO authenticated;

NOTIFY pgrst, 'reload schema';
