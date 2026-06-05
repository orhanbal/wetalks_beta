/*
  # polls tablosuna image_url ve description sütunları ekleme

  1. Değişiklikler
    - `polls` tablosuna `image_url` (text, nullable) — anket görseli URL'si
    - `polls` tablosuna `description` (text, nullable) — anket açıklaması

  2. Notlar
    - Mevcut veriler etkilenmez; yeni sütunlar NULL olabilir
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polls' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE polls ADD COLUMN image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polls' AND column_name = 'description'
  ) THEN
    ALTER TABLE polls ADD COLUMN description text;
  END IF;
END $$;
