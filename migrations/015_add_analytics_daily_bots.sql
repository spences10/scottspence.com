-- Migration: Add daily bot totals
-- Date: 2026-10-14
-- Purpose: Raw events are only kept for 2 days, so the bot count on
-- /stats for 7 days, 30 days and 12 months only covered the last day
-- or two. One row per day keeps the total for longer periods.

CREATE TABLE IF NOT EXISTS analytics_daily_bots (
  date TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0
);
