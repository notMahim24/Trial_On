-- Run this in your Supabase SQL Editor to add the new metadata columns for hybrid search

ALTER TABLE products
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS fabric TEXT,
ADD COLUMN IF NOT EXISTS type TEXT;

-- Verify columns were added successfully
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'products';
