---
name: analytics-audit
# prettier-ignore
description: Audit local analytics for bot traffic, referrer spam, and data quality. Use when investigating discrepancies between Fathom and local stats.
allowed-tools: mcp__mcp-sqlite-tools__*, Read, Grep
---

# Analytics Audit

Investigate local analytics for bot traffic, referrer spam, and
suspicious patterns.

## Quick Start

Open the database at `data/site-data.db` using the MCP sqlite tools,
then run queries from the references.

## Key Investigations

1. **Bot detection gaps** - Find "non-bot" traffic with >95% homepage
   visits
2. **Referrer spam** - High-profile domains with no page path,
   single-visit referrers
3. **Suspicious UAs** - Outdated OS/browser, malformed Chrome UAs, null
   UA

## Red Flags

- Homepage visits >95% of total = bot
- iOS 13.x or below = bot (2019)
- Chrome < 100 = bot (pre-2022)
- `Chrome/120.0.0.0` without Safari suffix = malformed bot UA
- null user_agent = bot

## References

- [Common Queries](references/queries.md) - SQL for all investigations
- [Bot Patterns](references/bot-patterns.md) - Known signatures
