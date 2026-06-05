/*
  # Add thank_you_image_url to polls

  Adds a `thank_you_image_url` column to the `polls` table.
  This image replaces the regular cover image shown on the poll card
  after the user has cast their vote.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polls' AND column_name = 'thank_you_image_url'
  ) THEN
    ALTER TABLE polls ADD COLUMN thank_you_image_url text DEFAULT NULL;
  END IF;
END $$;
