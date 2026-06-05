/*
  # Add default menu_items setting

  Inserts a default nav menu configuration into site_settings.
  The value is a JSON array of { label, path } objects matching the
  current hardcoded navLinks in Header.tsx.
*/

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'menu_items',
  '[{"label":"Anasayfa","path":"home"},{"label":"Ayna Ticaret","path":"etiket/ayna-ticaret"},{"label":"Operasyon","path":"etiket/operasyon"},{"label":"Yapay Zeka","path":"etiket/yapay-zeka"},{"label":"Bana Dair","path":"hakkimda"}]',
  now()
)
ON CONFLICT (key) DO NOTHING;
