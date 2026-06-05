/*
  # Series Tablosuna logo_url Alanı Ekle

  ## Özet
  Yazı dizilerine özel bir logo görseli eklenebilmesi için series tablosuna
  logo_url kolonu eklenir. Bu alan hero slider'da sol üstte gösterilir.

  ## Değişiklikler
  - series.logo_url (text, nullable): Yazı dizisi logo görseli URL'si
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE series ADD COLUMN logo_url text;
  END IF;
END $$;
