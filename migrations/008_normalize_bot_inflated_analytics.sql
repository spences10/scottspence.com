-- Normalize bot-inflated analytics from Dec 28th 2025 attack
-- 104,506 views with only 2,302 unique visitors (45:1 ratio vs normal ~2:1)
-- Strategy: entries with ratio > 10 get normalized to views = unique_visitors * 3

-- Step 1: Create temp table with corrections for Dec 28th
CREATE TEMP TABLE corrections AS
SELECT
  pathname,
  views as old_views,
  unique_visitors,
  (unique_visitors * 3) as new_views,
  (views - (unique_visitors * 3)) as reduction
FROM analytics_daily
WHERE date = '2025-12-28'
  AND unique_visitors > 0
  AND (CAST(views AS FLOAT) / unique_visitors) > 10;

-- Step 2: Update analytics_daily for Dec 28th
UPDATE analytics_daily
SET views = (
  SELECT new_views FROM corrections c
  WHERE c.pathname = analytics_daily.pathname
)
WHERE date = '2025-12-28'
  AND pathname IN (SELECT pathname FROM corrections);

-- Step 3: Update analytics_all_time - subtract the reduction
UPDATE analytics_all_time
SET views = views - (
  SELECT reduction FROM corrections c
  WHERE c.pathname = analytics_all_time.pathname
)
WHERE pathname IN (SELECT pathname FROM corrections);

-- Step 4: Update analytics_monthly for Dec 2025
UPDATE analytics_monthly
SET views = views - (
  SELECT reduction FROM corrections c
  WHERE c.pathname = analytics_monthly.pathname
)
WHERE year_month = '2025-12'
  AND pathname IN (SELECT pathname FROM corrections);

-- Step 5: Update analytics_yearly for 2025
UPDATE analytics_yearly
SET views = views - (
  SELECT reduction FROM corrections c
  WHERE c.pathname = analytics_yearly.pathname
)
WHERE year = '2025'
  AND pathname IN (SELECT pathname FROM corrections);

-- Cleanup
DROP TABLE corrections;
