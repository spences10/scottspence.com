# SvelteKit Remote Functions Migration Plan

## Executive Summary

This document outlines a comprehensive plan to migrate scottspence.com
from traditional SvelteKit data loading patterns to the new
experimental Remote Functions approach. Based on our analysis of the
recent database performance issues (1.3 billion row reads), this
migration aims to achieve:

- **60-80% reduction** in database queries through component-level
  data loading
- **Improved caching efficiency** with granular invalidation
- **Enhanced user experience** with progressive loading and real-time
  updates
- **Simplified architecture** by reducing API endpoint complexity

## Current State Analysis

### Performance Issues Identified

- **Database reads**: 1.27 billion rows from 742k queries (5x expected
  traffic)
- **Query patterns**: Recently optimized CTE to window functions (95%
  improvement)
- **Cache misses**: In-memory caches invalidated frequently due to
  deployments
- **N+1 queries**: Reaction counts loaded individually per post
- **Global loading**: Layout loads popular posts for all pages
  regardless of need

### Current Architecture

```
src/routes/
├── api/                    # 8 API endpoints
├── +layout.server.ts       # Global popular posts loading
├── posts/[slug]/           # Individual post loading
└── stats/                  # Complex analytics aggregation

src/lib/
├── turso/                  # Database client and queries
├── redis/                  # Rate limiting cache
└── posts.ts               # In-memory post caching (24h TTL)
```

## Target Architecture with Remote Functions

### New Structure

```
src/routes/
├── analytics.remote.ts     # Background analytics processing
├── posts.remote.ts         # Global post operations
├── +layout.svelte         # Lightweight layout without heavy data
├── posts/
│   ├── [slug]/
│   │   ├── reactions.remote.ts    # Post-specific reactions
│   │   ├── related.remote.ts      # Related posts loading
│   │   └── +page.svelte          # Component with remote functions
└── stats/
    ├── analytics.remote.ts       # Real-time stats streaming
    └── +page.svelte             # Stats dashboard
```

## Implementation Plan

### Phase 1: Environment Setup and Configuration (Week 1)

#### 1.1 Dependency Updates

```bash
# Install experimental versions
pnpm add https://pkg.pr.new/svelte@async
pnpm add https://pkg.pr.new/@sveltejs/kit@remote-functions
pnpm add zod@^4.0.0  # Required for schema validation
```

#### 1.2 Configuration Changes

**svelte.config.js**:

```javascript
import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { mdsvexConfig } from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true, // Enable remote functions
		},
	},
	compilerOptions: {
		experimental: {
			async: true, // Enable async Svelte components
		},
	},
}

export default config
```

**package.json updates**:

```json
{
	"dependencies": {
		"svelte": "https://pkg.pr.new/svelte@async",
		"@sveltejs/kit": "https://pkg.pr.new/@sveltejs/kit@remote-functions",
		"zod": "^4.0.0"
	}
}
```

#### 1.3 TypeScript Configuration

Update `app.d.ts` to include remote function types:

```typescript
// app.d.ts
declare global {
	namespace App {
		interface RemoteFunctionContext {
			// Add custom context if needed
		}
	}
}
```

### Phase 2: Core Remote Functions Implementation (Week 2-3)

#### 2.1 Popular Posts Remote Function

**src/routes/popular-posts.remote.ts**:

```typescript
import { query } from '$app/server'
import { z } from 'zod'
import { client } from '$lib/turso/client.js'

// Schema for popular posts
const PopularPostSchema = z.object({
	period: z.enum(['day', 'month', 'year']),
	id: z.number(),
	pathname: z.string(),
	title: z.string(),
	pageviews: z.number(),
	visits: z.number(),
	date_grouping: z.string(),
	last_updated: z.string(),
})

const PopularPostsResponseSchema = z.array(PopularPostSchema)

export const getPopularPosts = query(
	z.enum(['day', 'month', 'year']).optional(),
	async (period) => {
		const whereClause = period
			? 'WHERE pp.date_grouping = ?'
			: "WHERE pp.date_grouping IN ('day', 'month', 'year')"

		const args = period ? [period] : []

		const result = await client.execute({
			sql: `
        SELECT
          pp.date_grouping AS period,
          pp.id,
          pp.pathname,
          p.title,
          pp.pageviews,
          pp.visits,
          pp.date_grouping,
          pp.last_updated,
          ROW_NUMBER() OVER (PARTITION BY pp.date_grouping ORDER BY pp.pageviews DESC) as rn
        FROM popular_posts pp
        JOIN posts p ON pp.pathname = '/posts/' || p.slug
        ${whereClause}
        ORDER BY pp.date_grouping, pp.pageviews DESC
      `,
			args,
		})

		const validatedResults = PopularPostsResponseSchema.parse(
			result.rows
				.filter((row) => (row.rn as number) <= 20)
				.map((row) => ({
					period: row.period,
					id: row.id,
					pathname: row.pathname,
					title: row.title,
					pageviews: row.pageviews,
					visits: row.visits,
					date_grouping: row.date_grouping,
					last_updated: row.last_updated,
				})),
		)

		return validatedResults
	},
)

// Background update function
export const updatePopularPosts = form(async () => {
	// Move current /api/ingest/update-popular-posts logic here
	// This runs as a background task, not blocking user requests

	// 1. Fetch from Fathom API
	// 2. Process and aggregate data
	// 3. Update popular_posts table
	// 4. Refresh popular posts cache

	await getPopularPosts().refresh()
})
```

#### 2.2 Reaction System Remote Functions

**src/routes/posts/[slug]/reactions.remote.ts**:

```typescript
import { query, form } from '$app/server'
import { z } from 'zod'
import { client } from '$lib/turso/client.js'

const ReactionSchema = z.object({
	reaction_type: z.string(),
	count: z.number(),
})

const ReactionCountsSchema = z.array(ReactionSchema)

// Replace N+1 pattern with single query
export const getReactionCounts = query(
	z.string(),
	async (pathname) => {
		const result = await client.execute({
			sql: `
        SELECT 
          reaction_type,
          COUNT(*) as count
        FROM reactions 
        WHERE post_url = ?
        GROUP BY reaction_type
      `,
			args: [pathname],
		})

		return ReactionCountsSchema.parse(
			result.rows.map((row) => ({
				reaction_type: row.reaction_type as string,
				count: row.count as number,
			})),
		)
	},
)

// Optimistic reaction updates
export const addReaction = form(async (data: FormData) => {
	const pathname = data.get('pathname') as string
	const reactionType = data.get('reaction_type') as string
	const userSession = data.get('user_session') as string

	// Check if user already reacted
	const existingReaction = await client.execute({
		sql: `
      SELECT id FROM reactions 
      WHERE post_url = ? AND reaction_type = ? AND user_session = ?
    `,
		args: [pathname, reactionType, userSession],
	})

	if (existingReaction.rows.length === 0) {
		// Add new reaction
		await client.execute({
			sql: `
        INSERT INTO reactions (post_url, reaction_type, user_session, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `,
			args: [pathname, reactionType, userSession],
		})
	}

	// Refresh reaction counts
	await getReactionCounts(pathname).refresh()
})
```

#### 2.3 Analytics Streaming Remote Function

**src/routes/stats/analytics.remote.ts**:

```typescript
import { query } from '$app/server'
import { z } from 'zod'
import { client } from '$lib/turso/client.js'

const AnalyticsSchema = z.object({
	visitors: z.number(),
	pageviews: z.number(),
	bounce_rate: z.number(),
	avg_visit_duration: z.number(),
})

// Real-time analytics without constant polling
export const getLiveAnalytics = query(async () => {
	// Aggregate current analytics data
	const result = await client.execute({
		sql: `
      SELECT 
        COUNT(DISTINCT visitor_id) as visitors,
        COUNT(*) as pageviews,
        AVG(CASE WHEN pages_visited = 1 THEN 1 ELSE 0 END) as bounce_rate,
        AVG(visit_duration) as avg_visit_duration
      FROM analytics_daily
      WHERE date = date('now')
    `,
	})

	return AnalyticsSchema.parse({
		visitors: result.rows[0].visitors as number,
		pageviews: result.rows[0].pageviews as number,
		bounce_rate: result.rows[0].bounce_rate as number,
		avg_visit_duration: result.rows[0].avg_visit_duration as number,
	})
})

// Future: Implement streaming with query.stream when available
// export const streamAnalytics = query.stream(async function* () {
//   while (true) {
//     yield await getLiveAnalytics();
//     await new Promise(resolve => setTimeout(resolve, 5000));
//   }
// });
```

### Phase 3: Component Integration (Week 4)

#### 3.1 Layout Optimization

**src/routes/+layout.svelte** (Remove heavy data loading):

```svelte
<script lang="ts">
	import { page } from '$app/stores'
	import Navigation from '$lib/components/navigation.svelte'
	import Footer from '$lib/components/footer.svelte'

	// Remove popular posts loading from layout
	// Components will load their own data as needed

	let { children } = $props()
</script>

<div class="bg-base-100 min-h-screen">
	<Navigation />

	<main class="container mx-auto px-4 py-8">
		<svelte:boundary>
			{#snippet failed(error, reset)}
				<div class="alert alert-error">
					<p>Something went wrong loading data</p>
					<button class="btn btn-sm" onclick={reset}>Try again</button
					>
				</div>
			{/snippet}

			{#snippet pending()}
				<div class="loading loading-spinner loading-lg"></div>
			{/snippet}

			{@render children()}
		</svelte:boundary>
	</main>

	<Footer />
</div>
```

#### 3.2 Homepage with Remote Functions

**src/routes/+page.svelte**:

```svelte
<script lang="ts">
	import { getPopularPosts } from './popular-posts.remote.js'
	import PopularPostsCard from '$lib/components/popular-posts-card.svelte'

	// Load popular posts only when homepage is accessed
	let popularPosts = getPopularPosts()
</script>

<svelte:head>
	<title>Scott Spence - Web Developer</title>
</svelte:head>

<section
	class="hero from-primary to-secondary text-primary-content bg-gradient-to-r py-20"
>
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="mb-5 text-5xl font-bold">Scott Spence</h1>
			<p class="mb-5">
				Web developer focused on modern JavaScript and jamstack
				technologies
			</p>
		</div>
	</div>
</section>

<!-- Popular posts loaded on-demand -->
<section class="py-16">
	<div class="container mx-auto">
		<h2 class="mb-8 text-center text-3xl font-bold">Popular Posts</h2>

		{#await popularPosts}
			<div class="loading loading-dots loading-lg mx-auto"></div>
		{:then posts}
			<PopularPostsCard {posts} />
		{:catch error}
			<div class="alert alert-error">
				<p>Failed to load popular posts: {error.message}</p>
			</div>
		{/await}
	</div>
</section>
```

#### 3.3 Blog Post Page with Reactions

**src/routes/posts/[slug]/+page.svelte**:

```svelte
<script lang="ts">
	import { page } from '$app/stores'
	import {
		getReactionCounts,
		addReaction,
	} from './reactions.remote.js'
	import { getRelatedPosts } from './related.remote.js'

	let { data } = $props() // Post content from existing +page.server.ts

	// Load reactions and related posts on-demand
	let reactionCounts = getReactionCounts($page.url.pathname)
	let relatedPosts = getRelatedPosts(data.post.slug)

	// User session for reaction tracking
	let userSession = $state(crypto.randomUUID())
</script>

<article class="prose prose-lg max-w-none">
	<h1>{data.post.title}</h1>
	<div class="mb-8 text-gray-600">
		Published {data.post.date} • {data.post.readingTime}
	</div>

	{@html data.post.content}
</article>

<!-- Reaction component -->
<section class="mt-12 border-t pt-8">
	<h3 class="mb-4 text-xl font-semibold">How was this post?</h3>

	{#await reactionCounts}
		<div class="loading loading-dots"></div>
	{:then reactions}
		<div class="flex gap-4">
			{#each ['👍', '❤️', '🔥', '💯'] as emoji}
				{@const count =
					reactions.find((r) => r.reaction_type === emoji)?.count ||
					0}

				<form
					{...addReaction.enhance(async ({ data, submit }) => {
						// Optimistic update
						await submit().updates(
							getReactionCounts($page.url.pathname).withOverride(
								(current) =>
									current.map((r) =>
										r.reaction_type === emoji
											? { ...r, count: r.count + 1 }
											: r,
									),
							),
						)
					})}
				>
					<input
						type="hidden"
						name="pathname"
						value={$page.url.pathname}
					/>
					<input type="hidden" name="reaction_type" value={emoji} />
					<input
						type="hidden"
						name="user_session"
						value={userSession}
					/>

					<button type="submit" class="btn btn-outline">
						{emoji}
						{count}
					</button>
				</form>
			{/each}
		</div>
	{:catch error}
		<p class="text-error">Failed to load reactions</p>
	{/await}
</section>

<!-- Related posts -->
<section class="mt-12 border-t pt-8">
	<h3 class="mb-4 text-xl font-semibold">Related Posts</h3>

	{#await relatedPosts}
		<div class="loading loading-dots"></div>
	{:then posts}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each posts as post}
				<a
					href="/posts/{post.slug}"
					class="card bg-base-200 hover:bg-base-300 transition-colors"
				>
					<div class="card-body">
						<h4 class="card-title text-base">{post.title}</h4>
						<p class="text-sm text-gray-600">{post.excerpt}</p>
					</div>
				</a>
			{/each}
		</div>
	{:catch error}
		<p class="text-error">Failed to load related posts</p>
	{/await}
</section>
```

### Phase 4: Migration Strategy (Week 5)

#### 4.1 Gradual Migration Plan

**Step 1: Parallel Implementation**

- Keep existing API routes functional
- Implement remote functions alongside current system
- A/B test performance improvements

**Step 2: Component-by-Component Migration**

- Start with homepage popular posts
- Migrate reaction system
- Move to related posts
- Finally migrate analytics dashboard

**Step 3: API Route Deprecation**

- Monitor usage of old API endpoints
- Add deprecation warnings
- Remove unused endpoints after migration complete

#### 4.2 Rollback Strategy

**Monitoring Points**:

- Database query count via Turso dashboard
- Page load times via Fathom analytics
- Error rates via application logging

**Rollback Triggers**:

- Query count increases beyond baseline
- Page load times degrade by >20%
- Error rates exceed 1%

**Quick Rollback Process**:

```bash
# Disable experimental features
git revert <remote-functions-commit>
pnpm install  # Revert to stable versions
pnpm build && pnpm start
```

### Phase 5: Performance Optimization (Week 6)

#### 5.1 Caching Strategy Updates

**Redis Integration for Remote Functions**:

```typescript
// src/lib/cache/remote-functions-cache.ts
import { redis } from '$lib/redis/client.js'

export async function cacheRemoteFunction<T>(
	key: string,
	fn: () => Promise<T>,
	ttl: number = 300, // 5 minutes
): Promise<T> {
	const cached = await redis.get(key)
	if (cached) {
		return JSON.parse(cached)
	}

	const result = await fn()
	await redis.setex(key, ttl, JSON.stringify(result))
	return result
}
```

**Enhanced Popular Posts Caching**:

```typescript
export const getPopularPosts = query(
	z.enum(['day', 'month', 'year']).optional(),
	async (period) => {
		const cacheKey = `popular-posts:${period || 'all'}`

		return cacheRemoteFunction(
			cacheKey,
			async () => {
				// Existing query logic
				return await executeOptimizedQuery(period)
			},
			300,
		) // 5 minute cache
	},
)
```

#### 5.2 Background Processing

**Scheduled Analytics Updates**:

```typescript
// src/routes/analytics.remote.ts
export const scheduleAnalyticsUpdate = form(async () => {
	// Run every 5 minutes via cron job
	await updatePopularPosts()
	await cleanupVisitorData()
	await generateRelatedPosts()

	// Refresh caches
	await getPopularPosts().refresh()
})
```

## Testing Strategy

### Unit Testing Remote Functions

```typescript
// tests/remote-functions/popular-posts.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getPopularPosts } from '../src/routes/popular-posts.remote.js'

describe('Popular Posts Remote Function', () => {
	it('should return valid popular posts data', async () => {
		const result = await getPopularPosts()
		expect(result).toMatchSchema(PopularPostsResponseSchema)
		expect(result.length).toBeLessThanOrEqual(60) // 20 per period max
	})

	it('should filter by period correctly', async () => {
		const dayResults = await getPopularPosts('day')
		expect(dayResults.every((post) => post.period === 'day')).toBe(
			true,
		)
	})
})
```

### Integration Testing

```typescript
// tests/integration/remote-functions.test.ts
import { test, expect } from '@playwright/test'

test('remote functions load data correctly', async ({ page }) => {
	await page.goto('/')

	// Wait for popular posts to load
	await expect(
		page.locator('[data-testid="popular-posts"]'),
	).toBeVisible()

	// Check data loaded correctly
	const postCount = await page
		.locator('[data-testid="popular-post"]')
		.count()
	expect(postCount).toBeGreaterThan(0)
})
```

## Performance Monitoring

### Database Query Monitoring

- Track query count reduction via Turso dashboard
- Monitor row reads per query execution
- Set up alerts for query count increases

### Application Performance

- Page load time tracking via Fathom
- Core Web Vitals monitoring
- Error rate tracking via Sentry integration

### Expected Performance Improvements

- **Database queries**: 60-80% reduction
- **Page load times**: 20-30% improvement on data-heavy pages
- **Cache hit rates**: 40-50% improvement with granular invalidation
- **User experience**: Progressive loading reduces perceived load
  times

## Timeline and Milestones

### Week 1: Setup and Configuration

- [ ] Install experimental packages
- [ ] Update configuration files
- [ ] Set up development environment

### Week 2-3: Core Implementation

- [ ] Implement popular posts remote function
- [ ] Create reaction system remote functions
- [ ] Build analytics remote functions

### Week 4: Component Integration

- [ ] Migrate layout to lightweight version
- [ ] Update homepage with remote functions
- [ ] Migrate blog post pages

### Week 5: Migration and Testing

- [ ] Parallel testing with existing system
- [ ] Performance benchmarking
- [ ] Gradual rollout to production

### Week 6: Optimization

- [ ] Redis caching integration
- [ ] Background processing optimization
- [ ] Performance monitoring setup

## Risk Assessment

### High Risk

- **Experimental features**: API changes possible, limited
  documentation
- **Breaking changes**: Potential compatibility issues with updates
- **Production stability**: Beta features may have unexpected behavior

### Medium Risk

- **Performance regressions**: New patterns might introduce
  inefficiencies
- **Complexity increase**: Learning curve for team members
- **Debugging challenges**: Limited tooling for experimental features

### Low Risk

- **SEO impact**: Server-side rendering should remain functional
- **User experience**: Graceful degradation with error boundaries
- **Data integrity**: Database schema remains unchanged

## Success Criteria

### Primary Goals

1. **Database performance**: Reduce queries by 60-80%
2. **User experience**: Maintain or improve page load times
3. **Maintainability**: Simplify data loading architecture

### Secondary Goals

1. **Developer experience**: Improve development workflow
2. **Scalability**: Better handling of traffic spikes
3. **Real-time features**: Enable live analytics updates

## Conclusion

This migration plan represents a significant architectural improvement
for scottspence.com, leveraging the latest SvelteKit innovations to
solve real performance problems identified in production. The phased
approach ensures minimal risk while maximizing the benefits of
component-level data loading and modern reactive patterns.

The combination of optimized SQL queries (already achieving 95%
improvement) with remote functions could result in a dramatic
reduction in database load while improving user experience through
progressive loading and real-time updates.

Regular monitoring and gradual rollout will ensure the migration
succeeds while maintaining the site's reputation for performance and
reliability.
