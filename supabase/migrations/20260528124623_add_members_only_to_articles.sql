/*
  # Üye-only İçerik Bayrağı

  1. Değişiklik
    - `articles` tablosuna `members_only` (boolean, default false) kolonu eklenir
    - Giriş yapmamış kullanıcılar bu makalelerde içeriğin yalnızca ilk bölümünü görür
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'members_only'
  ) THEN
    ALTER TABLE articles ADD COLUMN members_only boolean NOT NULL DEFAULT false;
  END IF;
END $$;
