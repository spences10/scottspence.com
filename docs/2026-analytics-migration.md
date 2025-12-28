# 2026 Analytics Migration Plan

<!-- cspell:ignore rollups -->

Migrate from Fathom API to self-hosted analytics using
`analytics_events` table.

> **Note**: See `local-analytics.md` for learnings from v1
> implementation and requirements for v2.

## Timeline

- **End of 2025**: Export Fathom 2025 data, update analytics\_\*
  tables
- **Jan 1 2026**: Start using local analytics exclusively, daily
  rollups

## Current State

### Tables populated from Fathom

- `analytics_countries` / `analytics_countries_summary`
- `analytics_pages`
- `analytics_browsers` / `analytics_browsers_summary`
- `analytics_device_types` / `analytics_device_types_summary`
- `analytics_referrers` / `analytics_referrers_summary`
- `analytics_site`

### Tables populated from analytics_events (via rollup)

- `analytics_monthly`
- `analytics_yearly`
- `analytics_all_time`

## Tasks

### 1. Extend rollup_analytics.ts

Add rollups for tables currently populated by Fathom:

```sql
-- Countries rollup
INSERT OR REPLACE INTO analytics_countries_summary (country, pageviews, visits, year_month)
SELECT country, SUM(hit_count), COUNT(DISTINCT visitor_hash), strftime('%Y-%m', ...)
FROM analytics_events WHERE is_bot = 0
GROUP BY country, year_month

-- Browsers rollup
-- Device types rollup
-- Referrers rollup
-- Site totals rollup
```

### 2. Bot filtering in rollups

- Exclude `is_bot = 1` from human stats
- Consider separate bot stats table?

### 3. Schema updates

Consider adding to summary tables:

- `bot_views` column for tracking bot traffic separately?
- Or keep simple: just exclude bots from rollups

### 4. Remove Fathom API

Files to update/remove:

- [ ] `src/lib/fathom/` - API client code
- [ ] `fathom_api_calls` table - tracking table
- [ ] Any routes/components using Fathom API
- [ ] Environment variables (FATHOM_API_KEY, etc.)

### 5. Update stats UI

- [ ] `/stats` page - use local tables instead of Fathom
- [ ] Any components showing analytics data

### 6. Fathom 2025 export

- Export format compatibility with local tables
- One-time import script to merge 2025 data

### 7. Cron schedule for 2026

Daily tasks (in order):

1. `rollup_analytics` - aggregate events into summary tables
2. `flag_bot_behaviour` - mark scrapers
3. `cleanup_analytics` - delete events >7 days (includes VACUUM)

## Open Questions

1. Keep Fathom as backup/comparison, or fully remove?
2. Bot stats: separate tables or just exclude from human stats?
3. Historical data: keep analytics_pages etc. or migrate to new
   schema?

## Migrations Cleanup

Once prod is stable and all migrations have run:

1. Delete all files in `migrations/`
2. Clear migrations table: `DELETE FROM migrations`
3. `schema.sql` becomes single source of truth
4. Only add new migrations for future schema changes

This simplifies the codebase - no more "fresh install" noise in logs.
