# Analytics Audit Queries

## Bot vs Human Traffic

### Overall breakdown

```sql
SELECT is_bot, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_events
GROUP BY is_bot
```

### By path

```sql
SELECT path, is_bot, COUNT(*) as visits
FROM analytics_events
GROUP BY path, is_bot
ORDER BY visits DESC LIMIT 20
```

## Suspicious User Agents

### Homepage-heavy traffic (bot indicator)

```sql
SELECT user_agent, COUNT(*) as total_visits,
  SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) as homepage_visits,
  ROUND(100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*), 1) as homepage_pct
FROM analytics_events WHERE is_bot = 0
GROUP BY user_agent HAVING total_visits > 20
ORDER BY homepage_pct DESC LIMIT 15
```

### Low page diversity (single-page bots)

```sql
SELECT user_agent, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors,
  COUNT(DISTINCT path) as unique_pages,
  ROUND(1.0 * COUNT(*) / COUNT(DISTINCT path), 1) as visits_per_page
FROM analytics_events WHERE is_bot = 0
GROUP BY user_agent HAVING visits > 20
ORDER BY visits_per_page DESC LIMIT 15
```

### Null user agents

```sql
SELECT path, COUNT(*) as visits, country
FROM analytics_events
WHERE user_agent IS NULL
GROUP BY path, country
ORDER BY visits DESC LIMIT 20
```

## Referrer Analysis

### External referrers (excluding own domains)

```sql
SELECT referrer, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_events
WHERE referrer IS NOT NULL
  AND referrer NOT LIKE '%scottspence%'
  AND referrer NOT LIKE '%ss10%'
  AND referrer NOT LIKE '%spences10%'
GROUP BY referrer ORDER BY visits DESC LIMIT 30
```

### Single-visit referrers (potential spam)

```sql
SELECT referrer, COUNT(*) as visits
FROM analytics_events
WHERE referrer IS NOT NULL
  AND referrer NOT LIKE '%scottspence%'
  AND referrer NOT LIKE '%google%'
GROUP BY referrer HAVING visits = 1
ORDER BY referrer LIMIT 30
```

### Already blocked domains

```sql
SELECT domain, reason FROM blocked_referrer_domains
```

## Specific Investigations

### Check a specific user agent

```sql
SELECT path, referrer, country, COUNT(*) as visits
FROM analytics_events
WHERE user_agent = 'YOUR_UA_HERE'
GROUP BY path, referrer, country
ORDER BY visits DESC
```

### Check a specific referrer

```sql
SELECT path, user_agent, country, is_bot, COUNT(*) as visits
FROM analytics_events
WHERE referrer LIKE '%domain.com%'
GROUP BY path, user_agent, country, is_bot
```

### Visitor behaviour for specific hash

```sql
SELECT path, referrer, created_at,
  datetime(created_at/1000, 'unixepoch') as date
FROM analytics_events
WHERE visitor_hash = 'HASH_HERE'
ORDER BY created_at
```
