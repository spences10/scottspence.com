-- Flag aggregate bot patterns in historical data
-- Based on Jan 2026 analysis: uptime monitors, scrapers, malformed UAs
-- See flag-bot-behaviour.ts for equivalent daily logic

-- Rule 1: Homepage monitors
-- High homepage % (>75%) + high direct % (>75%) + many unique IPs (>20)
UPDATE analytics_events
SET is_bot = 1
WHERE is_bot = 0
AND user_agent IN (
  SELECT user_agent
  FROM analytics_events
  WHERE is_bot = 0
  GROUP BY user_agent
  HAVING
    COUNT(DISTINCT visitor_hash) > 20
    AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > 75
    AND 100.0 * SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) / COUNT(*) > 75
);

-- Rule 2: Direct-only scrapers
-- 100% direct traffic + many unique IPs (>15) + >50% homepage
-- (homepage requirement excludes legitimate app users who visit posts)
UPDATE analytics_events
SET is_bot = 1
WHERE is_bot = 0
AND user_agent IN (
  SELECT user_agent
  FROM analytics_events
  WHERE is_bot = 0
  GROUP BY user_agent
  HAVING
    COUNT(DISTINCT visitor_hash) > 15
    AND SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) = COUNT(*)
    AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > 50
);

-- Rule 3: Malformed UA (quotes around user agent string)
-- Indicates buggy bot implementation
UPDATE analytics_events
SET is_bot = 1
WHERE is_bot = 0
AND (user_agent LIKE '"%' OR user_agent LIKE '%"');
