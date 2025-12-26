-- Composite index for live visitor queries
-- Fixes lockups caused by MULTI-INDEX OR scans on 143k+ row table
-- Queries filter on created_at > ? AND is_bot status every 5 seconds

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_bot
ON analytics_events (created_at DESC, is_bot);
