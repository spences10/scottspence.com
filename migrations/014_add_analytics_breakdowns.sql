-- Migration: Add daily breakdown rollups for referrers, countries, browsers and devices
-- Date: 2026-10-14
-- Purpose: Raw events are only kept for 2 days, so /stats could only
-- show these breakdowns for the last day or two. These tables keep
-- them per day, humans only, like analytics_daily.

-- Site-wide counts per dimension value per day
-- dimension: 'referrer' (normalised source, or 'Direct'), 'country',
-- 'browser' or 'device'
CREATE TABLE IF NOT EXISTS analytics_daily_breakdown (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (
    dimension IN ('referrer', 'country', 'browser', 'device')
  ),
  value TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  UNIQUE (date, dimension, value)
);

CREATE INDEX IF NOT EXISTS idx_breakdown_dimension_date
  ON analytics_daily_breakdown (dimension, date);

-- Referrers per post per day, for "where did readers come from"
CREATE TABLE IF NOT EXISTS analytics_daily_referrers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  pathname TEXT NOT NULL,
  referrer TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  UNIQUE (date, pathname, referrer)
);

CREATE INDEX IF NOT EXISTS idx_daily_referrers_path
  ON analytics_daily_referrers (pathname, date);
