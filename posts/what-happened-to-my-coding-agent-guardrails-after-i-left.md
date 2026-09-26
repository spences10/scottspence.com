---
date: 2026-09-26
title: What Happened to My Coding Agent Guardrails After I Left
tags: ['coding-agents', 'sveltekit', 'notes']
is_private: false
---

<!-- cSpell:ignore LLMs guardrails oxlint handover monorepo UAT -->

In June I wrote about
[how I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases).
That post covered the checks I put in the repo so coding agents
couldn't quietly erode the architecture. What it couldn't cover was
whether any of it would survive without me.

I've since moved on to other projects and the codebase has been handed
over. So I went back and looked at what the guardrails have been doing
since.

## The project

This was a reinsurance underwriting platform for a client, built at an
agency. I started from a clickable prototype with no backend. For the
first two months it was just me, writing 520 of the first 523 commits.
The team joined from late June.

For a sense of scale:

| Project             | Size     |
| ------------------- | -------- |
| Apps                | 5        |
| Packages            | 14       |
| Lines of code       | ~180,000 |
| Test files          | 327      |
| Test cases          | ~2,900   |
| Database migrations | 64       |

Most of that code was written with coding agents, and I knew it would
carry on that way once other developers joined. On 9 May I wrote in a
session that "the preferred pattern should be enforced otherwise the
drift will become unmanageable". The next day I was asking whether
there were enough deterministic guardrails for the LLMs to do good
work, before anyone else had joined.

The boundary checker had gone in on 8 May. On 11 May an agent broke a
module boundary anyway, which was exactly the kind of drift it was
there for.

## What I left in place

The June post goes through these in detail, so here's the short
version:

- **A boundary checker** that parses the code rather than searching
  text. It now has 36 blocking rules: import boundaries, no domain
  logic or database calls in route files, the shape of remote-function
  modules, SQL only in the database package, and no hardcoded demo
  data in routes.
- **A lint plugin** with 4 rules, including one that needs a comment
  justifying every `$effect`.
- **A route data audit** that stops pages loading the same data twice.
- **An ownership check**: 11 capabilities, 8 tables that only one
  module may write to and 9 protected functions. Every exception has
  to cite a GitHub issue.
- **A deploy gate.** `pnpm check` had to pass before anything reached
  UAT.

All of it is code with error messages. None of it relies on an agent
reading and remembering an instruction.

## The team audited it

Later on, two of the team went through the whole setup. They counted
14 mechanisms and about 3,200 lines of enforcement code.

The verdict was that the design was sound. The two phrases I liked
were "parse rather than grep" and "exceptions modelled as debt, not
suppression".

Their main criticism was that the checks ran at deploy time rather
than when a pull request was opened. That came down to how the project
was delivered. We built it in our own repo, stripped it down, then
delivered the client's copy to a repo we didn't have the authority to
set pull request checks up in.

## It blocked deploys

Of 38 failed UAT deploys, 8 were stopped by the custom checks: 3 by
the boundary checker, 4 by the ownership check and 1 by the route data
audit. One of them was code my own agent had written.

What I was most interested in was what happened next. In every case
the team fixed the code the error message pointed at. Nobody switched
a check off to get a deploy through. One stale exception was removed
about five minutes after it failed a deploy.

## The team made them stricter

This is the bit I didn't expect. Instead of working around the
guardrails, the team added to them:

- A teammate added 3 rules to the boundary checker to stop an old
  authorisation pattern coming back.
- New protected functions were registered with no exceptions.
- The ownership check was tightened, with 11 policy edits from three
  other developers.
- Exceptions went from 43 down to 16 when I cleared them out in July,
  and the team has taken that down to 12.
- The team added the same `pnpm check` gate to production deploys.
  Before that it only gated UAT.

## It survived the handover

The client has since got its own copy of the repository. All of the
checks went with it, and they gate both UAT and production deploys
there too.

On my last check against the client's repository, the boundary checker
passed across 1,599 files, the ownership check across 1,601, the route
data audit passed, and the checks' own 25 unit tests passed.

The agent instructions, skills and the
[docs search CLI](/posts/give-coding-agents-your-project-docs-with-node-sqlite-and-fts5)
didn't go to the client. They're agency IP and were deliberately kept
out of the export. The checks still work without them, because a check
doesn't need an agent to read it first.

## The change I didn't make

More recently, the client more than doubled the maximum risk the
platform will underwrite, an eight-figure change. The team delivered
it in a week.

That was their work, not mine. What I can say is where it landed:
rules in the rules package, migrations in the database package, types
in the domain package, and the web app only displaying the results.
Every piece went where the architecture said it should. Nothing was
rebuilt, and on my last check they passed.

That's the outcome I wanted when I started adding guardrails in May. A
big commercial change, made by other people, months after I'd moved
on, that still fits the design.

## Wrapping up

The instructions I wrote for agents stayed with the agency. The checks
went with the code, and they're still doing the job: blocking bad
deploys, getting stricter, and keeping a big change inside the lines.

That's the difference I keep coming back to. An instruction only works
while someone, or something, reads it. A check with a clear error
message works for whoever is on the project next.
