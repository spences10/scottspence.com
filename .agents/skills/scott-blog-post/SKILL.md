---
name: scott-blog-post
# prettier-ignore
description: "Writes or improves scottspence.com blog posts in Scott's voice. Use when drafting posts, editing articles, choosing SEO titles/slugs, or turning repo/session history into a published post."
---

# Scott Blog Post

Use this skill for `scottspence.com` posts.

## Quick Start

Build evidence first, choose a high-intent slug/title, draft into
`posts/<slug>.md`, then validate with Prettier, cspell, and preferably
`pnpm build`.

## Workflow

1. Read nearby/relevant posts from `posts/`.
2. Query `data/site-data.db` with `mcp-sqlite-tools` for recent slugs,
   titles, tags, and positioning.
3. Inspect referenced repos/files and recent git churn before making
   claims.
4. Use `pirecall`/`ccrecall` or `mcp-sqlite-tools` when the story
   comes from session history.
5. Keep the prose evidence-led, personal, useful, and free of generic
   AI-blog framing.

## Voice rules

- Conversational, blunt, technical, reflective.
- Use Scott-like phrasing naturally: “Right, so,” “the bit I care
  about,” “vibes,” “dog shite,” when it fits.
- Prefer concrete receipts: stats, commits, files, session excerpts,
  eval results.
- en-GB spelling. No em dashes.
- SEO is for slug/title/search intent; the body must not read like SEO
  sludge.
- Avoid corporate polish, fake neutrality, and “In today's
  fast-paced...” intros.

## Post shape

Use existing frontmatter: `date`, quoted `title`, `tags`,
`published: true`.

Default structure: hook, context, why it mattered, what changed,
evidence, trade-offs, practical takeaway, references.

When useful, load `references/post-brief-template.md` for the reusable
prompt template.
