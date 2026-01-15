-- Fix overcorrected analytics from migration 008
-- The previous migration subtracted inflated values from aggregates,
-- but the aggregates didn't contain those inflated values, resulting in negatives.
-- Strategy: Recalculate monthly/yearly/all_time from daily data for affected pathnames.

-- Step 1: Fix analytics_monthly for Dec 2025
-- Set views to match the sum of daily data for affected pathnames
UPDATE analytics_monthly
SET views = (
  SELECT COALESCE(SUM(d.views), 0)
  FROM analytics_daily d
  WHERE d.pathname = analytics_monthly.pathname
    AND d.date LIKE '2025-12%'
),
unique_visitors = (
  SELECT COALESCE(SUM(d.unique_visitors), 0)
  FROM analytics_daily d
  WHERE d.pathname = analytics_monthly.pathname
    AND d.date LIKE '2025-12%'
),
last_updated = CURRENT_TIMESTAMP
WHERE year_month = '2025-12'
  AND views < 0;

-- Step 2: Fix analytics_yearly for 2025
-- Recalculate from monthly data for affected pathnames
UPDATE analytics_yearly
SET views = (
  SELECT COALESCE(SUM(m.views), 0)
  FROM analytics_monthly m
  WHERE m.pathname = analytics_yearly.pathname
    AND m.year_month LIKE '2025-%'
),
unique_visitors = (
  SELECT COALESCE(SUM(m.unique_visitors), 0)
  FROM analytics_monthly m
  WHERE m.pathname = analytics_yearly.pathname
    AND m.year_month LIKE '2025-%'
),
last_updated = CURRENT_TIMESTAMP
WHERE year = '2025'
  AND views < 0;

-- Step 3: Fix analytics_all_time for affected pathnames
-- Recalculate from yearly data
UPDATE analytics_all_time
SET views = (
  SELECT COALESCE(SUM(y.views), 0)
  FROM analytics_yearly y
  WHERE y.pathname = analytics_all_time.pathname
),
unique_visitors = (
  SELECT COALESCE(SUM(y.unique_visitors), 0)
  FROM analytics_yearly y
  WHERE y.pathname = analytics_all_time.pathname
),
last_updated = CURRENT_TIMESTAMP
WHERE pathname IN (
  SELECT DISTINCT pathname
  FROM analytics_monthly
  WHERE year_month = '2025-12'
    AND pathname IN (
      '/posts/configuring-mcp-tools-in-claude-code',
      '/posts/how-to-make-claude-code-skills-activate-reliably',
      '/posts/claude-code-skills-dont-auto-activate',
      '/posts/cursor-setup-for-wsl',
      '/posts/using-the-svelte-use-action-for-animations',
      '/posts/my-updated-zsh-config-2025',
      '/posts/speeding-up-my-zsh-shell',
      '/posts/testing-with-vitest-browser-svelte-guide',
      '/posts/data-binding-in-svelte',
      '/posts/windsurf-setup-for-wsl',
      '/posts/claude-code-skills-not-recognised'
    )
);
