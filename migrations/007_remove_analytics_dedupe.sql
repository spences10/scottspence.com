-- Remove UPSERT deduplication - no longer needed
-- Simple INSERT model: uniqueness via COUNT(DISTINCT visitor_hash) in queries
-- Rollup uses COUNT(*) for views instead of SUM(hit_count)

-- Drop the conditional unique index (performance killer)
DROP INDEX IF EXISTS idx_analytics_events_dedupe;

-- Drop unused columns (SQLite 3.35+ required)
-- These columns are no longer used - window_id was for UPSERT conflict detection
-- hit_count was for counting deduplicated hits
ALTER TABLE analytics_events DROP COLUMN window_id;
ALTER TABLE analytics_events DROP COLUMN hit_count;
