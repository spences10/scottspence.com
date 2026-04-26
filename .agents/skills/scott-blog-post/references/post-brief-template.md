# Post Brief Template

Use this when asking an agent to write a post for `scottspence.com`.

```text
Write a post for scottspence.com about <topic>.

Use the scott-blog-post skill.

Requirements:
- High-intent SEO slug and matching title.
- Write in my voice, not generic AI-blog voice.
- Read recent related posts from data/site-data.db and posts/.
- Inspect these repos/files before making claims: <paths>.
- Use pirecall/ccrecall if this came from session history.
- Back claims with concrete evidence: stats, commits, files, evals, session excerpts.
- Draft directly into posts/<slug>.md.
- Validate with Prettier, cspell, and pnpm build.
```

## Optional evidence checklist

- Recent related post slugs/titles/tags from `data/site-data.db`
- Existing post voice samples from `posts/`
- Repo `git status`, recent commits, changelog, package metadata
- Relevant `pirecall`/`ccrecall` sessions
- Tool-call/session stats where they strengthen the story
- Links for references section

## Title/slug examples

- `building-my-pi-claude-code-alternative-with-pi`
  - `Building my-pi: my own Claude Code alternative with Pi`
- `add-lsp-to-my-pi`
  - `Add LSP to my-pi`
- `hardening-redaction-in-my-pi`
  - `Hardening redaction in my-pi with evals and telemetry`
