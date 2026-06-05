/*
  # Create covers storage bucket

  1. Storage
    - Creates `covers` public bucket for article and series cover images
    - Max file size: 10MB
    - Allowed types: JPEG, PNG, WebP
  2. Security
    - Public read access
    - Authenticated users can upload, update, delete
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Cover images are publicly accessible'
  ) THEN
    CREATE POLICY "Cover images are publicly accessible"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'covers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload covers'
  ) THEN
    CREATE POLICY "Authenticated users can upload covers"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'covers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can update covers'
  ) THEN
    CREATE POLICY "Authenticated users can update covers"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'covers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete covers'
  ) THEN
    CREATE POLICY "Authenticated users can delete covers"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'covers');
  END IF;
END $$;
