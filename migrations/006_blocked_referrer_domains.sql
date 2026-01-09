-- Blocked referrer domains table
-- Stores domain patterns to filter from analytics (spam, etc.)
-- Patterns are matched with LIKE '%domain%' against referrer URLs

CREATE TABLE IF NOT EXISTS blocked_referrer_domains (
  domain TEXT PRIMARY KEY,
  reason TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
