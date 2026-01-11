---
date: 2026-01-11
title: Migrating Off Of Fathom Analytics
tags: ['sveltekit', 'sql', 'sqlite', 'analytics']
is_private: false
---

<!-- cspell:ignore scraperbot adblocker adblockers rollups -->

This is the follow-up to
[Local Analytics with SQLite and SvelteKit](/posts/local-analytics-with-sqlite-and-sveltekit).
That post covered the infrastructure - batched writes, heartbeat-based
live visitors, the production meltdown and rebuild. This one's about
actually removing the Fathom API dependency and what I discovered
along the way. So, just to be clear here, I still use Fathom analytics
on this site, but the local analytics gives me much more control of
the visitors information going through here. With the local analytics
I'm no longer needing to call out to the Fathom API, the ✨ View stats
for this post ✨ button called out to that for on demand analytics, no
it's a local db call.

From the get go I'll say that ~40% of my traffic is bots, so, if
you're a human reading this, hi. 👋

## Where I started

After the rebuild, I had two analytics systems running in parallel:

- **Fathom** - still calling their API for popular posts and per-post
  stats
- **Local** - tracking pageviews, but not using the data for much yet

So, stop calling Fathom's API, use local data instead. Keep the Fathom
JavaScript tracker for pageview tracking (useful for comparing against
adblocker-blocked traffic), but that's it.

## Click events

Fathom has `Fathom.trackEvent()` for tracking clicks. I had it in 7
components:

```typescript
// Old approach - Fathom
import * as Fathom from 'fathom-client'
Fathom.trackEvent('newsletter signup click')
```

Created a new `click_events` table and a remote function:

```typescript
// New approach - local
import { track_click } from '$lib/analytics/track-click.remote'
track_click({ event_name: 'newsletter signup click' })
```

The clicks go into the same batched queue as pageviews - one DB write
every 5 seconds instead of per-click. Migrated all 7 components:
newsletter signup, popular posts, banner clicks, contact button,
footer links, related posts, and the per-post analytics modal.

## Popular posts caching pattern

The old approach called Fathom's API hourly to populate a
`popular_posts` table. New approach is query the rollup tables
directly with caching.

```typescript
export const get_popular_today = () => {
	return get_cached(
		'popular_today',
		async () => {
			return sqlite_client.execute(
				`
      SELECT path, COUNT(*) as views
      FROM analytics_events
      WHERE created_at >= ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `,
				[today_start],
			)
		},
		15 * 60 * 1000,
	) // 15 min cache
}
```

One DB hit per 15 minutes, rest served from cache. No cron job, no
external API. Month and year queries hit the rollup tables with 1-hour
cache.

## Then the numbers looked wrong

I checked "Views today" in the popular posts component. One post was
showing 10,000+ views. Fathom said ~200.

Right, so either Fathom was massively under-counting or I had a bot
problem. Time to look at the data.

## 42% bots

I asked Claude to analyse the `analytics_events` table. 109k events
over 2.5 days:

| Hit range | Visitors | Total views | % of traffic |
| --------- | -------- | ----------- | ------------ |
| 1 hit     | 6,679    | 6,679       | 14.5%        |
| 2-5       | 3,005    | 7,780       | 16.9%        |
| 6-10      | 340      | 2,541       | 5.5%         |
| 11-50     | 272      | 6,477       | 14.1%        |
| 51-100    | 44       | 3,105       | 6.8%         |
| **100+**  | **47**   | **19,410**  | **42.2%**    |

47 "visitors" generating 42% of all views. Classic scraper behaviour.

The top offenders were Firefox UAs on Mac, hitting the same page
thousands of times:

- `2b541b33...`: 5,066 hits to 1 page
- `556ae857...`: 2,544 hits to 1 page
- `e9ad616a...`: 1,533 hits to 1 page

They were targeting my MCP/Claude Code posts specifically. Apparently
scrapers like AI content.

## Human behaviour patterns

To set proper thresholds, I needed to know what actual humans do:

| Hits/page | Visitors | % of total | What it means         |
| --------- | -------- | ---------- | --------------------- |
| 1-2       | 9,721    | 93.6%      | Normal humans         |
| 3-5       | 407      | 3.9%       | Engaged readers       |
| 6-10      | 76       | 0.7%       | Bit suspicious        |
| 11-20     | 53       | 0.5%       | Very suspicious       |
| **20+**   | **130**  | **1.3%**   | Almost certainly bots |

93.6% of visitors hit a page 1-2 times. Anyone hitting the same page
20+ times is almost certainly a bot.

## Threshold tuning

The existing bot detection ran during the nightly rollup job. But for
"today" queries, that data hasn't been flagged yet. Needed inline
filtering.

Added a CTE (Common Table Expression) to the "today" query:

```sql
WITH bad_visitors AS (
  SELECT DISTINCT visitor_hash
  FROM analytics_events
  WHERE created_at >= ?
  GROUP BY visitor_hash, path
  HAVING COUNT(*) > 20
  UNION
  SELECT visitor_hash
  FROM analytics_events
  WHERE created_at >= ?
  GROUP BY visitor_hash
  HAVING COUNT(*) > 100
)
SELECT path, COUNT(*) as views
FROM analytics_events
WHERE created_at >= ?
  AND visitor_hash NOT IN (SELECT visitor_hash FROM bad_visitors)
GROUP BY path
ORDER BY views DESC
```

Excludes anyone with >20 hits to the same page or >100 hits total.
Aligned the thresholds with the nightly rollup job so they're
consistent.

## Fathom comparison

With filtering in place, I compared the numbers:

| Source         | Views  | Visitors | Ratio vs Fathom |
| -------------- | ------ | -------- | --------------- |
| Fathom         | ~1,400 | 547      | 1x              |
| Local raw      | 25,758 | 2,105    | **18x views**   |
| Local filtered | 3,884  | 2,015    | **2.8x views**  |

Before filtering: 18x more views than Fathom. After filtering: 2.8x.

That 2.8x gap is expected. Server-side tracking catches everyone -
including the 30-40% of users running adblockers who never load
Fathom's JavaScript. Fathom also does additional filtering (datacenter
IPs, headless browsers) that I don't.

This actually validates the local analytics approach. I'm seeing real
traffic that Fathom misses because of adblockers.

## Per-post analytics

The modal that shows stats for individual posts was still hitting
Fathom's API. Switched it to query the local rollup tables:

```typescript
export const get_post_analytics = query(async (pathname: string) => {
	const [daily, monthly, yearly] = await Promise.all([
		sqlite_client.execute(
			`SELECT date, views, uniques FROM analytics_daily
       WHERE path = ? ORDER BY date DESC LIMIT 30`,
			[pathname],
		),
		sqlite_client.execute(
			`SELECT month, views, uniques FROM analytics_monthly
       WHERE path = ? ORDER BY month DESC LIMIT 12`,
			[pathname],
		),
		sqlite_client.execute(
			`SELECT year, views, uniques FROM analytics_yearly
       WHERE path = ? ORDER BY year DESC`,
			[pathname],
		),
	])
	return { daily, monthly, yearly }
})
```

Three parallel queries, all hitting indexed rollup tables. Fast.

## Cleaning up

With everything migrated, deleted the dead code:

- `src/lib/fathom/` - the API client
- `src/routes/api/ingest/update-stats.ts` - old Fathom-based cron
- `src/routes/api/ingest/update-popular-posts.ts` - old Fathom-based
  cron
- Removed the cron job from ping-the-thing config

Kept `fathom-client` package and `Fathom.load()` in `+layout.svelte` -
still useful for the pageview comparison.

## Database cleanup

So, with the migration done, I had a look at what was actually taking
up space in the database. Turns out I'd been hoarding data from when I
was using the Fathom API for reporting. 😅

| Table               | Size   | What it was                 |
| ------------------- | ------ | --------------------------- |
| fathom_api_calls    | 80 MB  | API debug logs (229k rows!) |
| analytics_pages     | 34 MB  | Bulk Fathom data export     |
| analytics_countries | 15 MB  | Bulk Fathom data export     |
| analytics_referrers | 8 MB   | Bulk Fathom data export     |
| popular_posts       | 0.1 MB | Old cron job output         |

The `fathom_api_calls` table was logging every single API call I made
to Fathom - 229,571 of them going back to November 2023. This started
when I was experimenting with Fathom's real-time `current_visitors`
endpoint, then grew with all the `fetch_post_analytics_*` and
`fetch_popular_posts_*` calls. Absolutely no value, just debug cruft
taking up 38% of my database.

The other `analytics_*` tables were where I'd imported my Fathom data
from exports. The new local analytics uses different tables
(`analytics_monthly`, `analytics_yearly`, `analytics_all_time`) that
get populated from the daily rollup job.

Dropped the lot:

```sql
DROP TABLE IF EXISTS fathom_api_calls;
DROP TABLE IF EXISTS analytics_pages;
DROP TABLE IF EXISTS analytics_countries;
DROP TABLE IF EXISTS analytics_referrers;
-- ... and 9 more
VACUUM;
```

**Result: 208 MB > 67 MB** (68% reduction). The historical data I
actually care about - yearly stats going back to 2020 - is still there
in the rollup tables. Just got rid of the unused Fathom imports.

For future reference, here's what stays and what the retention looks
like:

| Table             | Retention | Growth       |
| ----------------- | --------- | ------------ |
| analytics_events  | 2 days    | Pruned daily |
| analytics_daily   | Permanent | ~8 MB/year   |
| analytics_monthly | Permanent | ~130 KB/year |
| analytics_yearly  | Permanent | ~23 KB/year  |

At current rates, the permanent rollup tables will hit maybe 100 MB in
50 years. I think I'm good.

## What I learned

**Server-side tracking is more accurate than client-side** for actual
visitor counts. Adblockers don't affect it. The trade-off is you have
to handle a lot filtering yourself.

**Bots target content about AI**. My MCP and Claude Code posts got
hammered by scrapers. They're probably training datasets.

**Threshold tuning needs real data**. The default thresholds (50 hits
per path, 200 total) were too generous. Real humans rarely exceed 2
hits per page.

**CTEs are fine**. I'd been burned by them before, but for filtering a
small dataset (today's events only), they work well.

**The numbers will never match exactly**. 2.8x more traffic than
Fathom reports isn't a bug - it's the adblocker delta plus different
filtering approaches. Both are "correct" for what they measure.

## Current state

The migration's done:

- Click events > local `click_events` table
- Popular posts > local rollups with cached queries
- Per-post stats > local rollup tables
- Bot detection > inline CTE + nightly rollup
- Fathom API > deleted

## Links

The implementation's in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).
Key files:

- `src/lib/analytics/bot-thresholds.ts` - centralised threshold config
- `src/lib/data/popular-posts.helpers.ts` - cached queries with CTE
  filtering
- `src/lib/analytics/track-click.remote.ts` - click event tracking
- `docs/2026-analytics-migration.md` - full migration documentation
