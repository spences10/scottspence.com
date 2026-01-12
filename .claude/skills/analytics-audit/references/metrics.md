# Metrics Guide

## Key Metrics to Track

### Traffic Health

| Metric                 | Good          | Concerning    |
| ---------------------- | ------------- | ------------- |
| Bot ratio              | <30% of total | >50% of total |
| Null UA traffic        | 0             | Any           |
| Homepage-only visitors | <20%          | >50%          |

### Engagement

| Metric                    | Good | Concerning |
| ------------------------- | ---- | ---------- |
| Pages per visitor         | >1.5 | <1.2       |
| Bounce rate (single page) | <60% | >80%       |
| Return visitors           | >10% | <5%        |

### Content Performance

| Metric          | Healthy                | Action needed     |
| --------------- | ---------------------- | ----------------- |
| Top post views  | Growing week-over-week | Declining         |
| Entry diversity | Multiple entry points  | 80%+ via homepage |
| Post engagement | >1 page after landing  | Immediate exit    |

## Fathom vs Local Comparison

When comparing local stats to Fathom:

**Expected differences:**

- Fathom filters bots more aggressively
- Local catches more edge cases
- 10-20% variance is normal

**Red flags:**

- Local 2x+ higher than Fathom → bot leakage
- Specific paths inflated locally → targeted bot traffic
- Homepage massively inflated → uptime bots or crawlers

## Referrer Quality Indicators

### High quality referrers

- Search engines with actual queries
- GitHub with specific repo/issue paths
- Reddit/HN with thread context
- Other dev blogs linking to specific posts

### Low quality / spam indicators

- High-profile domains with no path (bbc.co.uk/)
- Raw IP addresses
- Single-visit from unusual TLDs
- Redirect domain self-referrals

## Seasonal Patterns

Tech blog traffic typically:

- **Weekdays > weekends** (developers at work)
- **Mornings/afternoons** peak (work hours)
- **Dips on holidays**
- **Spikes on HN/Reddit mentions**

## Action Thresholds

| Issue               | Threshold      | Action                          |
| ------------------- | -------------- | ------------------------------- |
| New bot UA pattern  | >50 visits     | Add to BOT_PATTERNS             |
| Referrer spam       | >10 visits     | Add to blocked_referrer_domains |
| Homepage bot flood  | >100/day       | Investigate source, add pattern |
| Content not ranking | <10 views/week | Review SEO, promote             |
