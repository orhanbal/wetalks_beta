/*
  # Add outline to series table

  ## Summary
  Adds a `outline` JSONB column to the `series` table.
  The outline stores the content plan for a series as an ordered list of items.

  ## New Columns
  - `series.outline` (jsonb, nullable)
    Each item in the array: { id: string, title: string, order: number, article_id?: string }
    - id: unique identifier for the outline item
    - title: the planned chapter/section title
    - order: display order (1-based)
    - article_id: links to a published article when that chapter is written (optional)

  ## No breaking changes
  - Existing rows get NULL for outline (treated as empty plan)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series' AND column_name = 'outline'
  ) THEN
    ALTER TABLE series ADD COLUMN outline jsonb;
  END IF;
END $$;
