-- Add image_url column to materials table
ALTER TABLE materials ADD COLUMN IF NOT EXISTS image_url text;
