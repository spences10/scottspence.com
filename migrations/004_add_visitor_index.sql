-- Migration: Add visitor_hash index for behaviour-based bot filtering
-- Date: 2025-12-31
-- Purpose: Enable efficient query-time bot detection by visitor hash

-- Index for behaviour-based bot detection queries
-- Used to identify visitors exceeding hit thresholds (200+/day)
CREATE INDEX IF NOT EXISTS idx_events_visitor
  ON analytics_events(created_at, visitor_hash);
