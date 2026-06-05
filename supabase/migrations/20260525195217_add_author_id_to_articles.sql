/*
  # Add author_id to articles

  1. Changes
    - `articles` tablosuna `author_id` kolonu eklendi (profiles tablosuna FK)
    - Mevcut makalelerin author_id'si boş bırakıldı (nullable)
*/

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
