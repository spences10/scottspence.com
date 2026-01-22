-- Fix analytics_all_time to aggregate from analytics_yearly instead of analytics_daily
--
-- Root cause: analytics_daily only has data from 2025-12-28 onwards (~153k views)
-- but analytics_yearly has full historical data back to 2020 (~1.25M views)
-- The daily rollup was incorrectly recalculating all_time from daily data only

-- Clear and repopulate analytics_all_time from analytics_yearly
DELETE FROM analytics_all_time;

INSERT INTO analytics_all_time (pathname, views, unique_visitors, last_updated)
SELECT
  pathname,
  SUM(views) as views,
  SUM(unique_visitors) as unique_visitors,
  CURRENT_TIMESTAMP as last_updated
FROM analytics_yearly
GROUP BY pathname;
