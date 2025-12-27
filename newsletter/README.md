# Newsletter Content Sources PRD

## Overview

Monthly automated newsletter generation using multiple data sources
aggregated and curated by Claude AI. The system transforms raw
development activity into a cohesive, conversational narrative for
subscribers.

## Data Sources

### 1. GitHub Activity (`github-activity.ts`)

- **Public repositories**: All commits, PRs, releases from
  `@spences10` public repos
- **Private repositories**: Commits and PRs from private repos,
  anonymised by AI to protect client work
- **Scope**: Last 30 days of activity
- **Output**: Structured list of activity with repo name, type
  (commit/PR/release), message, date

### 2. Recent Blog Posts (`recent-posts.ts`)

- **Source**: SQLite posts table, ordered by date DESC
- **Scope**: Posts published in last 30 days
- **Output**: Title, slug, date, excerpt

### 3. Bluesky Posts (`bluesky-posts.ts`)

- **Account**: @scottspence.dev
- **Scope**: Last 30 days of posts
- **Filter**: Posts with engagement (replies/likes) or substantive
  technical content
- **Output**: Post text, engagement metrics, date, link

### 4. Svelte Community Highlights (`svelte-feed.ts`)

- **Source**: Bluesky posts tagged/discussing Svelte
- **Scope**: Last 30 days, curated for quality and relevance
- **Curation**: Interesting releases, discussions, tools, ecosystem
  updates
- **Output**: Post text, author, context, link

## Anonymisation Layer (`anonymiser.ts`)

Private repo activity is processed through Claude to anonymise whilst
preserving technical value:

- Removes/replaces: repo names, client names, project identifiers
- Preserves: technical approach, challenges solved, patterns
  discovered, learnings
- Output: Anonymised activity suitable for newsletter inclusion

Example:

- Input: "client-x-api/commit: Implemented custom caching layer with
  SQLite to reduce DB queries by 60%"
- Output: "Implemented custom caching layer in database-heavy project,
  reducing queries by 60%"

## Data Flow

```
GitHub (public + private) ──┐
Recent Posts ───────────────┤
Bluesky Posts ──────────────┼──> Generator ──> Newsletter
Svelte Highlights ──────────┼     (Claude)    (monthly)
                            │
                Anonymiser ──┘
                (for private repos)
```

## Integration Points

- **Generator**: `src/lib/newsletter/generator.ts` receives aggregated
  data from all sources
- **Execution**: Monthly via
  `.github/workflows/generate-newsletter-draft.yml`
- **Output**: Markdown file in `newsletter/YYYY-MM.md` with
  frontmatter

## Success Criteria

- Accurate fetching of all data sources
- Reliable anonymisation of private repo activity
- Structured data format compatible with existing Claude agent
- No missing or corrupted data on fetch failure (graceful degradation)
- Monthly generation completes without manual intervention
