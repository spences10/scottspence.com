# Known Bot Patterns

## User Agent Signatures

### Currently detected (in utils.ts BOT_PATTERNS)

- Search engines: googlebot, bingbot, yandex, baidu, duckduckbot
- AI crawlers: chatgpt, gptbot, claudebot, perplexity
- SEO tools: semrush, ahrefs, mj12bot
- HTTP clients: curl, wget, go-http-client, python-requests

### Gaps - should be flagged

| Pattern                                               | Reason                              |
| ----------------------------------------------------- | ----------------------------------- |
| `null` user agent                                     | Real browsers always send UA        |
| `iPhone; CPU iPhone OS 13_2_3`                        | iOS from 2019, commonly spoofed     |
| `Chrome/120.0.0.0` (no Safari)                        | Malformed UA, missing WebKit suffix |
| `Android 11; CPH2185` Chrome/91                       | Outdated combo from 2021            |
| Chrome < 100                                          | Version from 2022 or earlier        |
| `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/78` | Chrome 78 from 2019                 |

## Behavioural Patterns

### Homepage hammering

Bots often hit homepage only:

- > 95% homepage visits = almost certainly bot
- Real users browse multiple pages

### Redirect domain checking

Bots checking if redirects work:

- Referrer from ss10.me, spences10.dev, scottspence.co.uk etc.
- Usually homepage only
- Often same visitor hash hitting multiple redirect domains

### Low page diversity

- Many visits but only 1-3 unique pages
- Real engaged users visit 5+ pages

## Referrer Spam Patterns

### Red flags

- High-profile domains with no page path (e.g., `https://bbc.co.uk/`)
- Raw IP addresses as referrer
- Domains with suspicious TLDs
- Single-visit from unusual domains

### Currently blocked (blocked_referrer_domains table)

- supjav.com
- binance.com
- Raw IP addresses (104.21.x.x, 172.67.x.x)
- Various .biz domains

## Detection Thresholds (bot-thresholds.ts)

| Threshold                  | Value | Purpose                        |
| -------------------------- | ----- | ------------------------------ |
| MAX_HITS_PER_PATH_PER_DAY  | 20    | Same page repeatedly           |
| MAX_HITS_TOTAL_PER_DAY     | 100   | Too many pages in one day      |
| MAX_HITS_PER_PATH_PER_HOUR | 10    | Burst detection (not yet used) |
