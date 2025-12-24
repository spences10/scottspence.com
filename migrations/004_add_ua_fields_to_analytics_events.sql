-- Add browser, device_type, os, is_bot columns for user agent parsing
ALTER TABLE analytics_events ADD COLUMN browser TEXT;
ALTER TABLE analytics_events ADD COLUMN device_type TEXT;
ALTER TABLE analytics_events ADD COLUMN os TEXT;
ALTER TABLE analytics_events ADD COLUMN is_bot INTEGER DEFAULT 0;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_browser ON analytics_events (browser);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device ON analytics_events (device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_is_bot ON analytics_events (is_bot);
