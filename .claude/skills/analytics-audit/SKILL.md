---
name: analytics-audit
# prettier-ignore
description: Audit local analytics for bot traffic, referrer spam, and data quality. Use when investigating discrepancies between Fathom and local stats.
allowed-tools: mcp__mcp-sqlite-tools__*, Read, Grep
---

# Analytics Audit

Comprehensive analytics investigation: bot detection, traffic
insights, content performance, and Fathom comparison.

## Quick Start

Open `data/site-data.db` with MCP sqlite tools, then run queries from
references.

## Investigations

1. **Bot Detection** - Homepage-heavy traffic, outdated UAs, null UA
2. **Traffic Trends** - Daily/weekly patterns, growth, peak times
3. **Content Performance** - Top posts, engagement depth, entry pages
4. **Audience** - Geography, devices, browsers
5. **Referrer Quality** - Real traffic sources vs spam
6. **Fathom Comparison** - Local vs Fathom discrepancies

## Quick Checks

- Homepage >95% = bot
- iOS 13.x or below = bot
- Chrome < 100 = bot
- null user_agent = bot

## References

- [Queries](references/queries.md) - SQL for all investigations
- [Bot Patterns](references/bot-patterns.md) - Known signatures
- [Metrics Guide](references/metrics.md) - What to look for
