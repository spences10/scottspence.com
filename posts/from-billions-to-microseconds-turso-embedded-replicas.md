---
date: 2025-07-25
title: From Billions to Microseconds - Turso Embedded Replicas
tags: ['turso', 'database', 'sveltekit']
is_private: false
---

So there I was, feeling proper chuffed about fixing my database
disasters from the last two posts. CTEs optimized, subqueries from
hell eliminated, indexes added - job done, right?

Wrong. Dead wrong. Again. 😅

Because here's the thing - I'd been treating the symptoms, not the
disease. Sure, I'd gone from 11.5 million reads per batch down to ~450
reads. That's brilliant optimization! But every single one of those
reads was still going over the network to Turso's edge locations.
Microseconds add up, and with a read-heavy blog like mine, those
network round trips were still the bottleneck.

Time for the nuclear option: **Turso embedded replicas**.

## The Lightbulb Moment

After all that query optimization work, I had this nagging feeling
that I was still missing something fundamental. My site _felt_ fast to
me, but that's because I'm usually the only one hitting the cache.
What about everyone else?

Every page load was doing multiple database reads:

- Popular posts for the sidebar
- Related posts for each blog post
- Reaction counts for engagement
- Post analytics for the stats

Even with all my optimizations, that's still 4-6 network round trips
per page. With Turso's edge network, we're talking maybe 50-100ms
total, but it adds up. And God forbid the cache expires during high
traffic - then everyone's hitting the database directly.

The solution was staring me in the face: **what if the database was
local?**

## Embedded Replicas: The Game Changer

Turso's embedded replicas are bloody brilliant. Here's how they work:

1. **Local SQLite file** on your server with all your data
2. **Automatic sync** with your remote Turso database
3. **Reads from local** (microsecond latency)
4. **Writes to remote** (then sync back locally)

It's like having a CDN for your database. All the benefits of local
SQLite performance with the reliability and sync capabilities of
Turso.

## The Implementation Journey

The beauty of embedded replicas is how simple they are to implement. I
just had to update my Turso client:

```typescript
const LOCAL_DB_PATH = dev
	? './local-dev-replica.db'
	: '/app/data/turso-replica.db'

const client = createClient({
	url: `file:${LOCAL_DB_PATH}`, // Local replica file
	syncUrl: remote_url, // Remote Turso database
	authToken: auth_token,
	syncInterval: dev ? 60 : 300, // Sync every 5 minutes in prod
})
```

**Development**: Local replica syncs every minute for faster feedback
**Production**: Local replica syncs every 5 minutes for efficiency

## The Deployment Setup

For production on Coolify, I needed persistent storage for the local
database file:

**Storage Configuration:**

- **Type**: Volume Mount (Docker managed)
- **Destination Path**: `/app/data`
- **File**: `turso-replica.db` gets created automatically

No source path needed - Coolify's Docker volumes handle the
persistence. The local database survives container restarts and
redeploys.

## The Results Are Mental

The difference is immediately obvious in the logs:

```
2025-07-25T10:46:42.943549679Z Turso replica synced successfully
```

That's it. One sync on startup, then periodic syncs every 5 minutes.
All my reads are now served from the local SQLite file with
**microsecond latency** instead of network round trips.

**Before (Network Reads):**

- Popular posts query: ~50ms network latency
- Related posts lookup: ~30ms network latency
- Reaction counts: ~20ms network latency
- **Total per page**: ~100ms in database time

**After (Local Reads):**

- Popular posts query: ~0.1ms local read
- Related posts lookup: ~0.05ms local read
- Reaction counts: ~0.02ms local read
- **Total per page**: ~0.2ms in database time

That's a **500x improvement** in database response times!

## The Pricing Sweet Spot

Here's where it gets properly interesting. My Turso pricing changed
dramatically:

**Old Model (Network Reads):**

- Every page view = 4-6 database reads
- High traffic = millions of row reads per month
- Paying for every single query

**New Model (Embedded Replica):**

- Page views = 0 network reads (served locally)
- Only sync operations count toward quota
- **Monthly Syncs**: Way less than previous row reads

The math works out brilliantly. Instead of millions of individual row
reads, I'm now doing periodic bulk syncs. Much more efficient and
cost-effective.

## Local Development Win

The embedded replica approach also solved my local development
headache. Before, I had two options:

1. **SQLite dump**: Fast but missing libSQL features like
   `vector_distance_cos`
2. **Remote database**: Full features but network latency and quota
   usage

Now I get the best of both worlds:

- **Local embedded replica** with full libSQL features
- **Vector search** works perfectly locally
- **No network latency** during development
- **No quota impact** for local dev work

## The Cache Strategy Evolution

With embedded replicas, my caching strategy needed a rethink. Before,
caching was crucial to avoid expensive network calls. Now, with
microsecond local reads, caching is more about reducing CPU load than
database latency.

I kept the multi-layer caching but adjusted the logic:

```typescript
export const BYPASS_DB_READS = {
	posts: false, // Enable - local reads are fast
	popular_posts: false, // Enable - local reads are fast
	analytics: false, // Enable - local reads are fast
	reactions: false, // Enable - local reads are fast
	// ...
}
```

The bypass flags are now more about feature toggles than performance
optimization. If something breaks, I can quickly disable database
reads for that feature without touching the code.

## Sync Strategy and Consistency

The 5-minute sync interval strikes a good balance:

- **Real-time enough** for blog content (comments, reactions)
- **Efficient enough** to not hammer the network
- **Fresh enough** for analytics and popular posts

For writes (reactions, analytics ingestion), they still go directly to
the remote database then sync back automatically. The "read your own
writes" guarantee means users see their reactions immediately, even
before the next sync.

## Lessons Learned (For Real This Time)

This whole database optimization saga taught me some fundamental
truths:

**Optimize the right thing**. I spent weeks optimizing queries when
the real bottleneck was network latency. Sometimes architectural
changes trump micro-optimizations.

**Local is still king**. No amount of edge computing beats having the
data right there on your server. Physics wins every time.

**Embedded replicas are the future** for read-heavy apps. The
combination of local performance with cloud reliability is
game-changing.

**Measure end-to-end impact**. Query optimization reduced database
load by 99%, but embedded replicas reduced end-user latency by 500x.
Both matter, but user experience wins.

**Simple solutions often work best**. Instead of complex caching
strategies and query gymnastics, just put the database where you need
it.

## What's Next?

With embedded replicas running smoothly, I'm finally confident my
database architecture can handle whatever traffic comes its way. The
combination of:

- **Optimized queries** (99% fewer row reads)
- **Strategic indexes** (fast lookups)
- **Local embedded replica** (microsecond reads)
- **Smart caching** (reduced CPU load)

...should scale way beyond my current needs.

I'm also thinking about monitoring and observability. Now that
database performance isn't a concern, I can focus on application
metrics and user experience monitoring.

## The Real Test

The proof will be in the Turso analytics over the next few weeks. I'm
expecting:

- **Massive drop in "Monthly Rows Read"** (most reads are now local)
- **New "Monthly Syncs" usage** (but much lower than previous reads)
- **Improved application response times** across the board

If you're running a read-heavy SvelteKit app with Turso, definitely
consider embedded replicas. The setup is dead simple, and the
performance improvement is immediately noticeable.

## Want to Check the Sauce?

The embedded replica setup is all in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).
Key files:

- `/src/lib/turso/client.ts` - Embedded replica configuration
- `/src/hooks.server.ts` - Startup sync logic
- `/.gitignore` - Local replica file exclusions

The implementation is surprisingly straightforward - most of the
complexity is in understanding when to use it, not how to implement
it.

Cool! Have you tried embedded replicas with Turso? Or got any other
database performance war stories? Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) - I'd love to hear
how you're handling read-heavy workloads!
