/*
  # Add TTS OpenAI settings

  1. New site_settings entries
    - `tts_provider`: 'browser' (default) or 'openai'
    - `tts_voice`: OpenAI voice ID, defaults to 'alloy'
    - `tts_model`: OpenAI TTS model, defaults to 'tts-1'
    - `openai_api_key`: Stores the OpenAI API key securely in site_settings (admin-only)

  2. Notes
    - Existing `feature_tts` toggle still controls whether TTS UI is shown at all
    - These new keys control which provider is used when TTS is enabled
    - `openai_api_key` is only readable server-side (edge functions use service role)
*/

INSERT INTO site_settings (key, value)
VALUES
  ('tts_provider', 'browser'),
  ('tts_voice', 'alloy'),
  ('tts_model', 'tts-1'),
  ('openai_api_key', '')
ON CONFLICT (key) DO NOTHING;
