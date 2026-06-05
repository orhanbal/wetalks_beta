/*
  # Change pages.content column type from jsonb to text

  The BlockEditor stores content as a plain markdown/syntax string, not JSON.
  This migration converts the column to text so it can store raw string content.
*/

ALTER TABLE pages ALTER COLUMN content TYPE text USING content::text;
ALTER TABLE pages ALTER COLUMN content SET DEFAULT '';
