# 2026 Analytics Migration Plan

<!-- cspell:ignore rollups -->

Migrate from Fathom API to self-hosted analytics using
`analytics_events` table.

> **Note**: See `local-analytics.md` for detailed implementation docs
> and the Fathom Migration Status section.

## Status: Jan 6, 2026

**Completed:**

- [x] Click events migration (`Fathom.trackEvent` → `click_events`
      table)
- [x] Popular posts migration (local rollups + cached queries)

**Remaining:**

- [ ] Fix bot detection for "today" queries (see below)
- [ ] Per-post analytics modal → local rollups
- [ ] Delete dead code (`update_stats`, `update_popular_posts`)
- [ ] Remove Fathom API client

**Fathom stays for**: pageview tracking in `+layout.svelte` only.

---

## Bot Detection Issue (Jan 6, 2026)

### Problem

"Today" popular posts shows 10k+ views vs Fathom's ~200 views.

### Root cause

Behaviour-based bot detection (`flag_bot_behaviour.ts`) only runs
during daily rollup at 03:05. For "today" queries on
`analytics_events`, only UA-based detection applies - missing
sophisticated bots.

### Analysis (prod data)

| Hit range | Visitors | Total views | % of traffic |
| --------- | -------- | ----------- | ------------ |
| 1 hit     | 1,563    | 1,563       | 6%           |
| 2-5       | 928      | 2,429       | 9%           |
| 6-10      | 121      | 889         | 3%           |
| 11-50     | 79       | 1,733       | 7%           |
| 51-100    | 33       | 2,480       | 10%          |
| **100+**  | **44**   | **19,078**  | **74%**      |

**44 "visitors" = 74% of today's views.** Pattern: Firefox UA, single
page, thousands of hits = scrapers with realistic UA.

### Proposed fixes

1. **Inline filtering** - exclude visitors with >50 hits from today's
   query
2. **More frequent bot flagging** - run behaviour detection every
   15-30 min
3. **Better UA patterns** - catch more bots at write time

### Quick fix for `fetch_popular_today`

```sql
SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as uniques
FROM analytics_events e
WHERE created_at >= ?
  AND is_bot = 0
  AND visitor_hash NOT IN (
    SELECT visitor_hash FROM analytics_events
    WHERE created_at >= ?
    GROUP BY visitor_hash
    HAVING COUNT(*) > 50
  )
GROUP BY path
ORDER BY views DESC
LIMIT 20
```

Or simpler: show unique visitors instead of total views for "today".

---

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
- [x] 2025 Fathom data imported
- [x] Click events table + tracking function
- [x] 7 components migrated from `Fathom.trackEvent`
- [x] Popular posts using local rollups (cached queries)

## What's left

- [ ] Fix bot detection for "today" popular posts
- [ ] Switch per-post analytics modal to local rollups
- [ ] Delete `update_stats` ingest task (dead code)
- [ ] Delete `update_popular_posts` ingest task
- [ ] Remove Fathom API client (`src/lib/fathom/`)
- [ ] Remove `FATHOM_API_KEY` env var (keep `PUBLIC_FATHOM_ID` for
      tracker)

---

## Click Events Migration ✅

### Components migrated

| Component                              | Event                         |
| -------------------------------------- | ----------------------------- |
| `newsletter-signup/signup-form.svelte` | `newsletter signup click`     |
| `popular-posts.svelte`                 | `popular post click: {title}` |
| `banner.svelte`                        | `{event_name}`                |
| `landing-hero.svelte`                  | `contact button click`        |
| `footer.svelte`                        | `{link.slug}`                 |
| `related-posts.svelte`                 | `related post click: {title}` |
| `posts/[slug]/+page.svelte`            | `analytics click: {path}`     |

### Files created/modified

- `migrations/005_add_click_events.sql` - table + indexes
- `src/lib/analytics/track-click.remote.ts` - remote function
- `src/lib/analytics/queue.ts` - added `click_queue` + `ClickEvent`
  type

---

## Popular Posts Migration ✅

### New approach (implemented)

- **Today**: `analytics_events` with 15-min cache
- **Month**: `analytics_monthly` rollup with 1-hour cache
- **Year**: `analytics_yearly` rollup with 1-hour cache

### Files modified

- `src/lib/data/popular-posts.helpers.ts` - new query functions
- `src/lib/data/popular-posts.remote.ts` - per-period caching
- `src/lib/cache/server-cache.ts` - added cache durations

### Benefits

- No cron job for popular posts
- Lazy evaluation (only queries when needed)
- No Fathom API dependency

---

## Per-Post Analytics Modal

Currently uses `post-analytics.remote.ts` → Fathom API.

### New approach

Query local rollup tables filtered by pathname:

```ts
export const get_post_analytics = query(async (pathname: string) => {
	const [daily, monthly, yearly] = await Promise.all([
		sqlite_client.execute(
			'SELECT date, views, uniques FROM analytics_daily WHERE path = ? ORDER BY date DESC LIMIT 30',
			[pathname],
		),
		sqlite_client.execute(
			'SELECT month, views, uniques FROM analytics_monthly WHERE path = ? ORDER BY month DESC LIMIT 12',
			[pathname],
		),
		sqlite_client.execute(
			'SELECT year, views, uniques FROM analytics_yearly WHERE path = ? ORDER BY year DESC',
			[pathname],
		),
	])
	return { daily, monthly, yearly }
})
```

---

## Dead code to delete

| File                                            | Action  |
| ----------------------------------------------- | ------- |
| `src/routes/api/ingest/update-stats.ts`         | Delete  |
| `src/routes/api/ingest/update-stats.test.ts`    | Delete  |
| `src/routes/api/ingest/update-popular-posts.ts` | Delete  |
| `src/lib/fathom/`                               | Delete  |
| `src/lib/data/post-analytics.remote.ts`         | Rewrite |
| `src/lib/state/post-analytics.svelte.ts`        | Rewrite |

---

## Cron schedule (after migration)

| Task                | Schedule    | Purpose                          |
| ------------------- | ----------- | -------------------------------- |
| `rollup_analytics`  | Daily 03:05 | Flag bots + aggregate to rollups |
| `cleanup_analytics` | Daily 03:15 | Delete events >2 days + VACUUM   |

`update_popular_posts` removed - replaced by cached queries.

---

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

---

## Data we lose from Fathom

- `avg_duration` (time on page)
- `bounce_rate`

These require session tracking which adds complexity. Decision: accept
this limitation - views + uniques sufficient for our needs.
