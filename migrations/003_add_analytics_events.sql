-- Migration: Add analytics_events table for batched local analytics
-- Date: 2025-12-27
-- Purpose: Store raw page view events for daily rollup into summary tables

-- Raw events table (write-heavy, short retention)
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY,
  visitor_hash TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'page_view',
  event_name TEXT,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  browser TEXT,
  device_type TEXT,
  os TEXT,
  is_bot INTEGER DEFAULT 0,
  props TEXT,
  created_at INTEGER NOT NULL
);

-- Composite index for rollup queries (date range + path grouping + bot filtering)
CREATE INDEX IF NOT EXISTS idx_events_rollup
  ON analytics_events(created_at, path, is_bot);

-- Daily rollup table (read-heavy, permanent)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pathname TEXT NOT NULL,
  date TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (pathname, date)
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_date ON analytics_daily(date);
