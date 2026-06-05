/*
  # Add thank_you_description to polls

  Adds a `thank_you_description` column to the `polls` table.
  This text replaces the regular description shown on the poll card
  after the user has cast their vote.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polls' AND column_name = 'thank_you_description'
  ) THEN
    ALTER TABLE polls ADD COLUMN thank_you_description text DEFAULT NULL;
  END IF;
END $$;
