-- Add country column to analytics_events for Cloudflare geo data
ALTER TABLE analytics_events ADD COLUMN country TEXT;

-- Add index for country queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events (country);
