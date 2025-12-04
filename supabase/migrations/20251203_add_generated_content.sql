-- Add generated content columns to saved_items table
-- Run this in your Supabase SQL Editor

-- Add columns for AI-generated video concepts
ALTER TABLE saved_items
ADD COLUMN IF NOT EXISTS generated_title TEXT,
ADD COLUMN IF NOT EXISTS generated_hook TEXT,
ADD COLUMN IF NOT EXISTS generated_outline TEXT[],
ADD COLUMN IF NOT EXISTS suggested_format TEXT,  -- 'short' or 'long'
ADD COLUMN IF NOT EXISTS suggested_platform TEXT; -- 'tiktok', 'youtube', 'instagram', 'reels'

-- Add comment for documentation
COMMENT ON COLUMN saved_items.generated_title IS 'AI-generated video title';
COMMENT ON COLUMN saved_items.generated_hook IS 'AI-generated opening hook for the video';
COMMENT ON COLUMN saved_items.generated_outline IS 'AI-generated key points/outline as array';
COMMENT ON COLUMN saved_items.suggested_format IS 'AI suggestion: short (< 60s) or long (> 60s)';
COMMENT ON COLUMN saved_items.suggested_platform IS 'AI-suggested platform based on content type';
