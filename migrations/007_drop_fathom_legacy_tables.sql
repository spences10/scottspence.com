-- Drop legacy Fathom tables no longer in use
-- These were hourly imports from Fathom API, replaced by local analytics rollups
-- Saves ~141 MB (68% reduction)

DROP TABLE IF EXISTS fathom_api_calls;
DROP TABLE IF EXISTS analytics_pages;
DROP TABLE IF EXISTS analytics_countries;
DROP TABLE IF EXISTS analytics_referrers;
DROP TABLE IF EXISTS analytics_browsers;
DROP TABLE IF EXISTS analytics_site;
DROP TABLE IF EXISTS analytics_device_types;
DROP TABLE IF EXISTS analytics_browsers_summary;
DROP TABLE IF EXISTS analytics_countries_summary;
DROP TABLE IF EXISTS analytics_device_types_summary;
DROP TABLE IF EXISTS analytics_referrers_summary;
DROP TABLE IF EXISTS popular_posts;
DROP TABLE IF EXISTS post_analytics;

-- Drop index for removed table
DROP INDEX IF EXISTS idx_popular_posts_date_grouping_pageviews;
