---
name: scott-post-review
# prettier-ignore
description: "Critically reviews scottspence.com posts before Scott approves them. Use after drafting with scott-blog-post, when editing a post in posts/, or when asked whether a post is any good."
---

# Scott Post Review

scottspence.com is Scott's personal blog. Its readers are developers,
and they reward candour and receipts and punish hype. A true post can
still be a weak one, so checking the facts are true and judging the
post are separate jobs. `scott-blog-post` writes; this skill judges.

A verified fact proves nothing about the story. A post built from
verified metrics can still turn a bug Scott shipped into a win, and
that's the failure this review exists to catch.

This repository is public. Never quote client names, private figures
or private file contents in the post, in review notes committed here,
or in this skill.

## Workflow

1. Read the post in full and list every claim: numbers, dates, star or
   download counts, who did what, how a tool behaves.
2. Trace each claim to git history, the referenced repos, or session
   history: `pnpx omnirecall recall "<topic>" --compact --json` for
   recent work, and
   `pnpx ccrecall search "<term>" --db ~/Documents/ccrecall.db` for
   the archive from earlier employment (never `sync` against it).
3. Run every [test](#tests). Quote the exact sentence for each
   finding.
4. Check `data/site-data.db` and `posts/` for posts that already tell
   the same story.
5. Report back, then stop. Do not edit, flip `is_private`, commit or
   push. Scott works through the post before approving it.

## Tests

- **Source.** Is Scott's own experience or opinion behind it, or is it
  a list of metrics? Without a point of view, flag it as needing
  Scott's input.
- **Honesty about cause.** A post about Scott's own mistake can be the
  best post here, but only if it says so. Fail any post that blames
  "the data", "nobody", or the tooling for something Scott built.
- **Mechanism.** The fix described must explain the result. A
  developer will do the arithmetic.
- **Receipts are current.** Star counts, downloads, versions and
  benchmarks go stale. Re-check them or cut them.
- **Headline.** The title and description must match what the post
  shows. SEO picks the slug; it doesn't get to oversell the body.
- **Code.** Samples must run and match how Scott works now (Svelte 5
  runes, remote functions, browser-mode Vitest).
- **Voice.** Check against the voice rules in `scott-blog-post`. Flag
  AI tells, corporate polish, em dashes, "In today's...". Also flag
  snark that punches at readers rather than at the problem.
- **Precision.** Exact figures in prose read as pulled from a
  database. Round to what Scott would say out loud ("nearly 14,000",
  "over a thousand", "about half"), never in the direction that
  flatters the claim, and keep the exact value in the source comment.
  Keep small countable numbers, dates, versions and the one figure a
  post hangs on exact. Never stack several exact numbers in one
  sentence.
- **Overreach and vanity.** One run, one repo or one anecdote doesn't
  make "always" or "teams report". Commit counts and lines deleted
  aren't proof.
- **Cluster.** This site owns coding agents and MCP. A Svelte
  consulting pitch belongs on svelteconsulting.dev, and a client
  outcome on oestechnology.co.uk.
- **Confidentiality.** Client work stays anonymised: no names, no
  copied client code, no private figures.

If a claim can't be traced, it's a finding, not something to soften.

## Report

- **Verdict:** keep, fix, rewrite with Scott's input, or cut.
- **Findings:** test name, quoted sentence, why it fails, the fix or
  the question for Scott.
- **Unverified:** claims you couldn't trace.

Most severe first. Say plainly when a post holds up.
