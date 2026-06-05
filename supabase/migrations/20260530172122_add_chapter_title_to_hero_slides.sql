/*
  # hero_slides tablosuna chapter_title kolonu ekle

  ## Özet
  Yazı dizisi slide'larında sağ üst köşede gösterilecek bölüm adı için
  hero_slides tablosuna chapter_title kolonu eklenir.

  ## Değişiklikler
  - hero_slides.chapter_title (text, nullable): opsiyonel bölüm/konu adı
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'chapter_title'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN chapter_title text;
  END IF;
END $$;
