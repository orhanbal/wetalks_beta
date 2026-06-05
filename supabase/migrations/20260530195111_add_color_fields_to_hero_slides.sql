/*
  # Hero Slides Renk Alanları

  ## Özet
  hero_slides tablosuna progress bar ve alt bar için renk seçeneği eklenir.

  ## Değişiklikler
  ### hero_slides tablosu
  - `progress_bar_color` (text, nullable): Progress bar rengi (CSS renk değeri, örn. #e8c97e). Null ise varsayılan kullanılır.
  - `bottom_bar_color` (text, nullable): Alt bilgi barı arka plan rengi (CSS renk değeri). Null ise varsayılan kullanılır.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'progress_bar_color'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN progress_bar_color text DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'bottom_bar_color'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN bottom_bar_color text DEFAULT NULL;
  END IF;
END $$;
