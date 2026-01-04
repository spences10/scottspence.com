# 2026 Analytics Migration Plan

<!-- cspell:ignore rollups -->

Migrate from Fathom API to self-hosted analytics using
`analytics_events` table.

> **Note**: See `local-analytics.md` for detailed implementation docs
> and the Fathom Migration Status section.

## Status: Jan 4, 2026

Local analytics fully operational. 2025 Fathom data loaded into DB.

**Fathom stays for**: pageview tracking in `+layout.svelte` only.

**Fathom removal targets**:

- Popular posts (cron job) → local rollups + cached query
- Per-post analytics (modal) → local rollups
- Click events (`Fathom.trackEvent`) → new `click_events` table

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

## What's left

- [ ] Add `click_events` table + tracking function
- [ ] Migrate 7 components from `Fathom.trackEvent` to local
- [ ] Switch popular posts to local (cached query for today, rollups
      for month/year)
- [ ] Switch per-post analytics modal to local rollups
- [ ] Delete `update_stats` ingest task (dead code)
- [ ] Delete `update_popular_posts` ingest task
- [ ] Remove Fathom API client (`src/lib/fathom/`)
- [ ] Remove `FATHOM_API_KEY` env var (keep `PUBLIC_FATHOM_ID` for
      tracker)

---

## Click Events Migration

### Components using `Fathom.trackEvent`

| Component                              | Event                         |
| -------------------------------------- | ----------------------------- |
| `newsletter-signup/signup-form.svelte` | `newsletter signup click`     |
| `popular-posts.svelte`                 | `popular post click: {title}` |
| `banner.svelte`                        | `{event_name}`                |
| `landing-hero.svelte`                  | `contact button click`        |
| `footer.svelte`                        | `{link.slug}`                 |
| `related-posts.svelte`                 | `related post click: {title}` |
| `posts/[slug]/+page.svelte`            | `analytics click: {path}`     |

### New `click_events` table

```sql
CREATE TABLE click_events (
  id INTEGER PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_context TEXT,      -- JSON for flexible metadata
  visitor_hash TEXT,
  path TEXT,               -- page where click happened
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_clicks_event ON click_events(event_name, created_at);
CREATE INDEX idx_clicks_path ON click_events(path, created_at);
```

### Tracking function

```ts
// src/lib/analytics/track-click.remote.ts
export const track_click = command(
	async ({
		event_name,
		context,
	}: {
		event_name: string
		context?: Record<string, unknown>
	}) => {
		// Add to same write queue as pageviews, or separate queue
		click_queue.push({
			event_name,
			event_context: context ? JSON.stringify(context) : null,
			visitor_hash: get_visitor_hash(event),
			path: event.url.pathname,
			created_at: Date.now(),
		})
	},
)
```

---

## Popular Posts Migration

### Current (Fathom)

- `update_popular_posts` cron runs hourly
- Fetches day/month/year from Fathom API
- Writes to `popular_posts` table

### New approach

**Today**: Cached query with 15-min TTL (no cron needed)

```ts
export const get_popular_today = () => {
	return get_cached(
		'popular_today',
		async () => {
			return sqlite_client.execute(
				`
      SELECT path, COUNT(*) as views,
             COUNT(DISTINCT visitor_hash) as uniques
      FROM analytics_events
      WHERE created_at >= ? AND is_bot = 0
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `,
				[today_start_timestamp],
			)
		},
		15 * 60 * 1000,
	) // 15 min cache
}
```

**Month/Year**: Query rollup tables directly

```ts
export const get_popular_month = () => {
	return get_cached(
		'popular_month',
		async () => {
			return sqlite_client.execute(
				`
      SELECT path, SUM(views) as views, SUM(uniques) as uniques
      FROM analytics_monthly
      WHERE month = ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `,
				[current_month],
			)
		},
		60 * 60 * 1000,
	) // 1 hour cache
}
```

**Benefits**:

- No cron job for popular posts
- Lazy evaluation (only queries when needed)
- Safe from lock contention (cached, infrequent DB hits)
- Today's data is fresh within 15 min

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
