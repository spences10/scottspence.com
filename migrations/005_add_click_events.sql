-- Migration: Add click_events table for tracking user interactions
-- Date: 2026-01-05
-- Purpose: Replace Fathom.trackEvent() with local click tracking

CREATE TABLE IF NOT EXISTS click_events (
  id INTEGER PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_context TEXT,
  visitor_hash TEXT,
  path TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Index for event-based queries (e.g. "how many newsletter signups this month")
CREATE INDEX IF NOT EXISTS idx_clicks_event
  ON click_events(event_name, created_at);

-- Index for path-based queries (e.g. "what clicks happened on this post")
CREATE INDEX IF NOT EXISTS idx_clicks_path
  ON click_events(path, created_at);
