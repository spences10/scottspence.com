-- Migration: Add analytics_js_pings table
-- Date: 2026-11-05
-- Purpose: Page views are logged on the server, so scrapers and LLM
-- fetchers that never run JavaScript count the same as browsers. The
-- heartbeat only runs in a browser, so one row per visitor and path
-- marks the matching page views as "JavaScript ran".

CREATE TABLE IF NOT EXISTS analytics_js_pings (
  visitor_hash TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (visitor_hash, path)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_js_pings_created
  ON analytics_js_pings(created_at);
