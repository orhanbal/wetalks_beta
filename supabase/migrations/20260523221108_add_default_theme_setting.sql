/*
  # Add default_theme to site_settings

  Inserts a default value of 'system' for the default_theme key if it doesn't exist yet.
  This controls the initial theme shown to visitors before they make a personal selection.
*/

INSERT INTO site_settings (key, value)
VALUES ('default_theme', 'system')
ON CONFLICT (key) DO NOTHING;
