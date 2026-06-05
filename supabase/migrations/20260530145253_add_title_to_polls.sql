/*
  # polls tablosuna title sütunu ekleme

  1. Değişiklikler
    - `polls` tablosuna `title` (text, nullable) — ankette gösterilecek başlık
      Ana sayfadaki poll kartında soru yerine bu başlık görünür.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polls' AND column_name = 'title'
  ) THEN
    ALTER TABLE polls ADD COLUMN title text;
  END IF;
END $$;
