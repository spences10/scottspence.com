---
name: scott-newsletter
# prettier-ignore
description: "Drafts or improves scottspence.com monthly newsletters in Scott's voice. Use when creating newsletter/YYYY-MM-DD.md, summarising recent posts, GitHub activity, talks, tools, or preparing monthly email copy."
---

# Scott Newsletter

<!-- cspell:ignore nopeek rollups omnirecall -->

Use this skill for monthly `scottspence.com` newsletter emails.

## Quick Start

Build evidence first, draft into `newsletter/YYYY-MM-DD.md`, keep it
personal and conversational, then validate with Prettier and cspell.
Never send the newsletter unless Scott explicitly asks.

## Workflow

1. Read recent newsletters in `newsletter/` to match structure and
   voice.
2. Pull fresh production data when needed using `nopeek` for
   `INGEST_TOKEN`; never read `.env` directly.
3. Update production rollups before downloading the DB when current
   stats matter: `update_posts`, `update_embeddings`,
   `update_related_posts`, optionally `rollup_analytics`, then
   `backup_database`.
4. Back up local `data/site-data.db`, remove WAL/SHM files, then
   download production DB via `/api/ingest/download`.
5. Query `data/site-data.db` with `mcp-sqlite-tools` for recent posts,
   GitHub commits/PRs/releases/issues, subscriber counts, and sent
   newsletters.
6. Use `pnpx omnirecall` to find work across coding agent sessions,
   alongside repo history and nearby posts. Follow the session
   evidence workflow below before making claims.
7. Draft the newsletter with sections for the month’s main story,
   posts, open source, talks/client work when relevant, and a short
   sign-off.
8. Validate with `pnpm exec prettier --check <file>` and
   `pnpm exec cspell <file> --config cspell.json --wordsOnly`.

## Session evidence

Use `omnirecall` alongside posts and GitHub activity. Sessions can
explain decisions, trade-offs, and work that has not become a post.

1. Run `pnpx omnirecall sync --json`, then
   `pnpx omnirecall sources --json`. Check coverage, last sync times,
   partial status, and issue counts. Retrieval does not sync for you.
2. Search the newsletter period with
   `pnpx omnirecall recall "<topic>" --after YYYY-MM-DD --before YYYY-MM-DD --json`.
   Use the day after the previous issue through the draft date. Search
   across projects first so work outside this site is not missed.
3. Read relevant result refs with
   `pnpx omnirecall read "<ref>" --context 2 --json`. Follow
   pagination when needed. Keep source refs with research notes.
4. Verify shipped work against public commits, releases, or posts.
   Session plans and agent claims are not proof of delivery. Anonymise
   private work, omit secrets, and ask Scott before including
   sensitive details. Report missing sources instead of assuming full
   coverage.

## Voice rules

- Scott-like, informal, blunt, technical, and reflective.
- en-GB spelling. No em dashes.
- Prefer concrete details: repo names, PRs, posts, talks, numbers,
  shipped tools, and trade-offs.
- It is fine to say “Right, so,” “vibes,” “waffling,” “dogfooding,” or
  similar when it fits naturally.
- Avoid generic marketing copy, corporate polish, and fake neutrality.
- Keep private/client work anonymised unless already public.

## Newsletter shape

Use frontmatter:

```yaml
---
title: 'Short Human Title - Month YYYY'
date: YYYY-MM-DD
published: true
---
```

Default structure: hook, one or more main sections, Blog Posts, Open
Source or related project updates, Fin. Add
`<!-- cspell:ignore ... -->` for project/tool names rather than
changing prose.

## Safety

- Do not read, print, grep, or paste secret files or secret values.
- Use `pnpx nopeek load .env --only INGEST_TOKEN` when production
  ingest access is needed.
- Do not send via `newsletter_send` or production APIs unless Scott
  explicitly asks to send.
