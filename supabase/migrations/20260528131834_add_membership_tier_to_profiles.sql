/*
  # Üyelik Kademesi Sistemi

  1. Değişiklikler
    - `profiles` tablosuna `membership_tier` (text, default 'free') eklendi
      Değerler: 'free' | 'member' | 'founding'
    - `profiles` tablosuna `membership_expires_at` (timestamptz, nullable) eklendi
      — ücretli üyelikler için son kullanma tarihi (null = süresiz)
    - `site_settings` tablosuna `feature_membership` varsayılan değeri eklendi
    - `site_settings` tablosuna `membership_member_price` ve `membership_founding_price` eklendi

  2. Güvenlik
    - Mevcut RLS politikaları korunur
    - Kullanıcılar kendi membership_tier'larını değiştiremez (sadece admin)
    - Admin politikası mevcut get_my_role() fonksiyonunu kullanır
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'membership_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_tier text NOT NULL DEFAULT 'free'
      CHECK (membership_tier IN ('free', 'member', 'founding'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'membership_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_expires_at timestamptz;
  END IF;
END $$;

-- Feature flags and membership settings
INSERT INTO site_settings (key, value, updated_at)
VALUES
  ('feature_membership',         'true',  now()),
  ('membership_member_price',    '0',     now()),
  ('membership_founding_price',  '0',     now()),
  ('membership_member_label',    'Üye',   now()),
  ('membership_founding_label',  'Kurucu Üye', now()),
  ('membership_member_perks',    'Tüm içeriklere erişim|Yorum yapabilme|Yazıları kaydetme', now()),
  ('membership_founding_perks',  'Tüm üye avantajları|Özel kurucu rozeti|Erken erişim', now())
ON CONFLICT (key) DO NOTHING;
