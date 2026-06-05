/*
  # Homepage Magazine Layout Settings

  Adds site_settings rows for homepage magazine layout controls.
  All toggles are admin-configurable from the Settings panel.

  New setting keys:
  - homepage_layout: 'magazine' | 'classic' (default: 'magazine')
  - show_featured_hero: 'true' | 'false' - big hero + 4 mini cards
  - show_latest_section: 'true' | 'false' - latest articles section
  - show_tag_sections: 'true' | 'false' - tag-based article groups
  - tag_sections_list: JSON array of tag names to show as sections
  - show_series_section: 'true' | 'false' - series section
  - show_authors_section: 'true' | 'false' - suggested authors

  No destructive changes. Uses INSERT ... ON CONFLICT DO NOTHING.
*/

INSERT INTO site_settings (key, value) VALUES
  ('homepage_layout', 'magazine'),
  ('show_featured_hero', 'true'),
  ('show_latest_section', 'true'),
  ('show_tag_sections', 'false'),
  ('tag_sections_list', '[]'),
  ('show_series_section', 'true'),
  ('show_authors_section', 'true')
ON CONFLICT (key) DO NOTHING;
