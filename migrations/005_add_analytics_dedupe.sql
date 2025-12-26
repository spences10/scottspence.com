-- Add hit_count and window_id columns for deduplication
-- Existing rows keep NULL window_id (won't conflict)
-- New rows get 30-min window_id for UPSERT deduplication

ALTER TABLE analytics_events ADD COLUMN hit_count INTEGER DEFAULT 1;
ALTER TABLE analytics_events ADD COLUMN window_id TEXT;

-- Unique index for deduplication (only applies when window_id is NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_dedupe
ON analytics_events (visitor_hash, path, window_id)
WHERE window_id IS NOT NULL;
