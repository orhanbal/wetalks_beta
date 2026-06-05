/*
  # Create Agenda Tables

  Personal workspace for managing tasks, writing plans, and content calendar.

  ## New Tables

  ### agenda_tasks
  - Daily/weekly task items with status, priority, due date
  - Linked optionally to articles or series
  - `id` (uuid, pk)
  - `user_id` (uuid, fk auth.users)
  - `title` (text)
  - `description` (text, nullable)
  - `status` (text: todo | in_progress | done)
  - `priority` (text: low | medium | high)
  - `due_date` (date, nullable)
  - `article_id` (text, nullable) — linked article slug
  - `series_id` (text, nullable) — linked series slug
  - `tags` (text[], nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### agenda_content_plans
  - Content plan notes/outlines per article or series
  - `id` (uuid, pk)
  - `user_id` (uuid, fk auth.users)
  - `title` (text)
  - `body` (text) — markdown content
  - `article_id` (text, nullable)
  - `series_id` (text, nullable)
  - `planned_date` (date, nullable)
  - `status` (text: draft | ready | published)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Only authenticated owners can CRUD their own rows
*/

CREATE TABLE IF NOT EXISTS agenda_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  article_id text,
  series_id text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agenda_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own tasks"
  ON agenda_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert own tasks"
  ON agenda_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update own tasks"
  ON agenda_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete own tasks"
  ON agenda_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS agenda_tasks_user_id_idx ON agenda_tasks(user_id);
CREATE INDEX IF NOT EXISTS agenda_tasks_due_date_idx ON agenda_tasks(due_date);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agenda_content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  article_id text,
  series_id text,
  planned_date date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agenda_content_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own plans"
  ON agenda_content_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert own plans"
  ON agenda_content_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update own plans"
  ON agenda_content_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete own plans"
  ON agenda_content_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS agenda_content_plans_user_id_idx ON agenda_content_plans(user_id);
CREATE INDEX IF NOT EXISTS agenda_content_plans_planned_date_idx ON agenda_content_plans(planned_date);
