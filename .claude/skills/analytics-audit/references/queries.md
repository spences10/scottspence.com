# Analytics Queries

## Bot Detection

### Overall bot vs human

```sql
SELECT is_bot, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_events GROUP BY is_bot
```

### Homepage-heavy traffic (bot indicator)

```sql
SELECT user_agent, COUNT(*) as total_visits,
  SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) as homepage_visits,
  ROUND(100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*), 1) as homepage_pct
FROM analytics_events WHERE is_bot = 0
GROUP BY user_agent HAVING total_visits > 20
ORDER BY homepage_pct DESC LIMIT 15
```

### Null user agents

```sql
SELECT path, COUNT(*) as visits, country
FROM analytics_events WHERE user_agent IS NULL
GROUP BY path, country ORDER BY visits DESC LIMIT 10
```

## Traffic Trends

### Daily traffic (last 30 days)

```sql
SELECT date, SUM(views) as views, SUM(unique_visitors) as visitors
FROM analytics_daily
WHERE date >= date('now', '-30 days')
GROUP BY date ORDER BY date DESC
```

### Monthly traffic

```sql
SELECT year_month, SUM(views) as views, SUM(unique_visitors) as visitors
FROM analytics_monthly
GROUP BY year_month ORDER BY year_month DESC LIMIT 12
```

### Traffic by hour (peak times)

```sql
SELECT strftime('%H', datetime(created_at/1000, 'unixepoch')) as hour,
  COUNT(*) as visits
FROM analytics_events WHERE is_bot = 0
GROUP BY hour ORDER BY hour
```

### Traffic by day of week

```sql
SELECT CASE strftime('%w', datetime(created_at/1000, 'unixepoch'))
  WHEN '0' THEN 'Sun' WHEN '1' THEN 'Mon' WHEN '2' THEN 'Tue'
  WHEN '3' THEN 'Wed' WHEN '4' THEN 'Thu' WHEN '5' THEN 'Fri'
  WHEN '6' THEN 'Sat' END as day,
  COUNT(*) as visits
FROM analytics_events WHERE is_bot = 0
GROUP BY strftime('%w', datetime(created_at/1000, 'unixepoch'))
ORDER BY strftime('%w', datetime(created_at/1000, 'unixepoch'))
```

## Content Performance

### Top posts (all time)

```sql
SELECT pathname, views, unique_visitors
FROM analytics_all_time
WHERE pathname LIKE '/posts/%'
ORDER BY views DESC LIMIT 20
```

### Top posts (last 7 days)

```sql
SELECT pathname, SUM(views) as views, SUM(unique_visitors) as visitors
FROM analytics_daily
WHERE pathname LIKE '/posts/%'
  AND date >= date('now', '-7 days')
GROUP BY pathname ORDER BY views DESC LIMIT 20
```

### Engagement depth (pages per visitor)

```sql
SELECT visitor_hash, COUNT(*) as pages_visited,
  COUNT(DISTINCT path) as unique_pages
FROM analytics_events WHERE is_bot = 0
GROUP BY visitor_hash
ORDER BY pages_visited DESC LIMIT 20
```

### Entry pages (first page visited)

```sql
SELECT path, COUNT(*) as entries
FROM (
  SELECT visitor_hash, path,
    ROW_NUMBER() OVER (PARTITION BY visitor_hash ORDER BY created_at) as rn
  FROM analytics_events WHERE is_bot = 0
) WHERE rn = 1
GROUP BY path ORDER BY entries DESC LIMIT 15
```

## Audience

### Geographic breakdown

```sql
SELECT country, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_events WHERE is_bot = 0
GROUP BY country ORDER BY visits DESC LIMIT 20
```

### Device types

```sql
SELECT device_type, COUNT(*) as visits,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM analytics_events WHERE is_bot = 0), 1) as pct
FROM analytics_events WHERE is_bot = 0
GROUP BY device_type ORDER BY visits DESC
```

### Browsers

```sql
SELECT browser, COUNT(*) as visits
FROM analytics_events WHERE is_bot = 0
GROUP BY browser ORDER BY visits DESC LIMIT 10
```

### Operating systems

```sql
SELECT os, COUNT(*) as visits
FROM analytics_events WHERE is_bot = 0
GROUP BY os ORDER BY visits DESC LIMIT 10
```

## Referrer Analysis

### Top referrers (external only)

```sql
SELECT referrer, COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as unique_visitors
FROM analytics_events
WHERE is_bot = 0 AND referrer IS NOT NULL
  AND referrer NOT LIKE '%scottspence%'
  AND referrer NOT LIKE '%ss10%'
GROUP BY referrer ORDER BY visits DESC LIMIT 20
```

### Referrer quality (pages per session)

```sql
SELECT
  CASE
    WHEN referrer LIKE '%google%' THEN 'Google'
    WHEN referrer LIKE '%bing%' THEN 'Bing'
    WHEN referrer LIKE '%github%' THEN 'GitHub'
    WHEN referrer LIKE '%reddit%' THEN 'Reddit'
    WHEN referrer IS NULL THEN 'Direct'
    ELSE 'Other'
  END as source,
  COUNT(*) as visits,
  COUNT(DISTINCT visitor_hash) as visitors,
  ROUND(1.0 * COUNT(*) / COUNT(DISTINCT visitor_hash), 2) as pages_per_visitor
FROM analytics_events WHERE is_bot = 0
GROUP BY source ORDER BY visits DESC
```

### Single-visit referrers (potential spam)

```sql
SELECT referrer, COUNT(*) as visits
FROM analytics_events
WHERE referrer IS NOT NULL AND referrer NOT LIKE '%scottspence%'
GROUP BY referrer HAVING visits = 1
ORDER BY referrer LIMIT 30
```

### Blocked referrer domains

```sql
SELECT domain, reason FROM blocked_referrer_domains
```

## Specific Investigations

### Check specific user agent

```sql
SELECT path, referrer, country, COUNT(*) as visits
FROM analytics_events WHERE user_agent = 'YOUR_UA_HERE'
GROUP BY path, referrer, country ORDER BY visits DESC
```

### Visitor journey

```sql
SELECT path, datetime(created_at/1000, 'unixepoch') as time
FROM analytics_events WHERE visitor_hash = 'HASH_HERE'
ORDER BY created_at
```
