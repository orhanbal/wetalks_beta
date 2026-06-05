/*
  # Hero Slides Tablosu

  ## Özet
  Ana sayfa orta panel slider'ı için hero_slides tablosu oluşturulur.
  Her slide ya bir makale ya da bir yazı dizisi olabilir.

  ## Yeni Tablo: hero_slides
  - id: UUID primary key
  - type: 'article' | 'series' — slide tipi
  - item_id: bağlantılı makale veya seri ID'si (text)
  - sort_order: gösterim sırası (0'dan başlar)
  - active: aktif/pasif toggle
  - created_at: oluşturulma zamanı

  ## Güvenlik
  - RLS aktif
  - Herkes okuyabilir (public read)
  - Sadece admin/editor yazabilir (auth.jwt app_metadata role kontrolü ile)
*/

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('article', 'series')),
  item_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hero slides"
  ON hero_slides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert hero slides"
  ON hero_slides FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authenticated users can update hero slides"
  ON hero_slides FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authenticated users can delete hero slides"
  ON hero_slides FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );
