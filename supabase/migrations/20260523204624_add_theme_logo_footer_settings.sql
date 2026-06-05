/*
  # Seed default theme, logo and footer site settings

  Inserts default values for:
  - accent_color: The primary accent/CTA color (default lime green #c8f542)
  - logo_url: Optional logo image URL (empty = text logo)
  - footer_copyright: Copyright line shown at the bottom of the site
  - footer_tagline: Short description shown in the footer brand column
*/

INSERT INTO site_settings (key, value, updated_at) VALUES
  ('accent_color',    '#c8f542',                                                          now()),
  ('logo_url',        '',                                                                  now()),
  ('footer_copyright','© 2026 Orhan Balcı. Tüm hakları saklıdır.',                        now()),
  ('footer_tagline',  'Türkiye''de ticaret, e-ticaret, markalaşma, teknoloji ve girişimcilik üzerine sahadan notlar.', now())
ON CONFLICT (key) DO NOTHING;
