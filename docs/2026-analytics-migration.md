# 2026 Analytics Migration Plan

<!-- cspell:ignore rollups -->

Migrate from Fathom API to self-hosted analytics using
`analytics_events` table.

> **Note**: See `local-analytics.md` for detailed implementation docs
> and the Fathom Migration Status section.

## Status: Jan 2, 2026

Local analytics fully operational. Fathom still used for:

- Popular posts (cron job)
- Per-post analytics (modal on post pages)

Ready to cut over - see migration steps in `local-analytics.md`.

## What's done

- [x] `analytics_events` tracking with batched writes
- [x] `rollup_analytics` cron (daily 03:05) - aggregates to
      daily/monthly/yearly/all_time
- [x] `cleanup_analytics` cron (daily 03:15) - 2-day retention +
      VACUUM
- [x] Bot detection via `flag_bot_behaviour` (runs inside rollup)
- [x] Stats page using local rollup tables
- [x] Live visitors via heartbeat (in-memory)
- [x] Cron jobs running in ping-the-thing

## What's left

- [ ] Switch popular posts from Fathom API to local rollups
- [ ] Switch per-post analytics from Fathom API to local rollups
- [ ] Delete `update_stats` ingest task (dead code)
- [ ] Remove Fathom client code
- [ ] Remove `fathom-client` package

## Dead code identified

| File                                            | Status         |
| ----------------------------------------------- | -------------- |
| `src/routes/api/ingest/update-stats.ts`         | Delete         |
| `src/routes/api/ingest/update-stats.test.ts`    | Delete         |
| `src/lib/fathom/`                               | Delete (after) |
| `src/lib/data/post-analytics.remote.ts`         | Rewrite        |
| `src/lib/state/post-analytics.svelte.ts`        | Rewrite        |
| `src/routes/api/ingest/update-popular-posts.ts` | Rewrite        |

## Rollup task comparison

| Task               | Source             | Target                        | Bot filter  |
| ------------------ | ------------------ | ----------------------------- | ----------- |
| `update_stats`     | `analytics_pages`  | monthly/yearly/all_time       | ❌ None     |
| `rollup_analytics` | `analytics_events` | daily→monthly→yearly→all_time | ✅ is_bot=0 |

**`update_stats` is legacy** - reads from Fathom-populated
`analytics_pages` table. Superseded by `rollup_analytics` which reads
from local `analytics_events`.

## Data we lose from Fathom

- `avg_duration` (time on page)
- `bounce_rate`

These require session tracking which adds complexity. Decision: accept
this limitation - views + uniques sufficient for our needs.

## Historical Fathom tables

These tables contain pre-2026 data from Fathom API:

- `analytics_pages` - pageviews by path
- `analytics_countries` / `analytics_countries_summary`
- `analytics_browsers` / `analytics_browsers_summary`
- `analytics_device_types` / `analytics_device_types_summary`
- `analytics_referrers` / `analytics_referrers_summary`
- `analytics_site`
- `post_analytics` - per-post day/month/year stats
- `popular_posts` - top pages by period
- `fathom_api_calls` - API call tracking

**Decision**: Keep for historical reference. No need to delete
immediately.

## Cron schedule (ping-the-thing)

| Task                   | Schedule    | Purpose                            |
| ---------------------- | ----------- | ---------------------------------- |
| `rollup_analytics`     | Daily 03:05 | Flag bots + aggregate to rollups   |
| `cleanup_analytics`    | Daily 03:15 | Delete events >2 days + VACUUM     |
| `update_popular_posts` | Hourly      | ❌ Still using Fathom - to migrate |
