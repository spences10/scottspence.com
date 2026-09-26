---
date: 2026-08-29
updated: 2026-09-26
title: 'What my prompts say about how I work with AI'
tags:
  ['ai', 'llms', 'coding-agents', 'prompting', 'developer-experience']
published: false
---

<!-- cspell:ignore LLMs pirecall ccrecall omnirecall omnisearch my-pi twinkleplop -->

September 2023 is when I started getting paid to work with AI.
Features had to work, bugs had to be fixed and pull requests had to
survive review, in a large private client codebase where a plausible
answer wasn't the same as a correct one.

The way I prompt has changed a lot since then. I went back through my
session history to find real prompts from then and now, and the change
is simple to describe. I used to do the research part of every task by
hand, in the prompt. Now most of it is built into the tools around the
agent, and the prompt just points at them.

## How I used to prompt

In January 2025 I gave a
[talk about staying current with Svelte using AI tools](/speaking#svelte-society-london---january-2025).
Models were poor at current Svelte. Svelte 5 had recently changed
event handlers from `on:click` to `onclick`, and the older syntax
dominated the training data. Search inside AI products wasn't good
either.

So I'd start with the problem, get the model to gather current
information about it, then decide what to do. Research, plan,
implement. The research step was how I gave the model a reality to
work from. Without it I'd watch it fail spectacularly because it
didn't have the same current context I had.

The catch was that I had to spell out the research every time. This is
from November 2025, working on SvelteKit auth:

> my plan, first check the auth, is there a user lookup each time? can
> this be moved to remote functions? (research remote functions) then,
> each load function doesn't need to do the auth check, right? go
> research the auth remote functions pattern from official sources and
> GitHub of SvelteKit maintainers

Where to look, who to trust and what order to do it in, all typed out
by me.

Keeping the phases apart was on me too. From January 2026:

> we're gathering information to help with the smooth progress in
> researching this pattern right now, so, we're not going to implement
> anything until we're happy with the information we have, got it?

And from February:

> have a research team go through this issue. no coding, we're
> planning this out first

When the research didn't happen, I found out after the fact:

> You didn't research though did you? Didn't check official
> documentation.

I wrote about this period in
[working with Claude Code: the honest version](/posts/working-with-claude-code-the-honest-version).
I was the source of truth, the drift detector and the emergency brake,
in every session. The model was useful and I was shipping more than I
could without it. But everything it needed to know had to come through
me.

## What changed

Over the last year, the steps I kept typing out turned into tools.

**Web search.** Instead of hoping a model knew the current way to do
something, I built
[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch) to
search across providers and read the actual source. It's one of the
[two MCP tools I still use](/posts/i-built-21-mcp-tools-and-still-use-2).

**Past sessions.** A lot of context I needed was in earlier
conversations. [ccrecall](https://github.com/spences10/ccrecall) syncs
Claude Code sessions to SQLite, pirecall does the same for Pi, and
[omnirecall](/posts/omnirecall-search-claude-code-codex-and-pi-sessions)
now puts them all in one searchable archive.

**Project docs.** On a client project with hundreds of documents, a
[docs search CLI](/posts/give-coding-agents-your-project-docs-with-node-sqlite-and-fts5)
meant agents could find the right spec section without me pointing at
it.

**Rules that used to be reminders.** I used to tell agents over and
over not to reach for `$effect`. In May I added a guardrail to my-pi
that blocks the pattern before it's written to a `.svelte` file. Now
it's a check, not something I have to remember to say. More on that in
[how I stop LLMs drifting](/posts/how-i-stop-llms-drifting-in-production-codebases).

**The harness itself.** Moving most of my work to
[my-pi](/posts/building-my-pi-claude-code-alternative-with-pi) meant I
could change the environment when something frustrated me, instead of
working around it in every prompt.

I've always tried to ground the model in reality. What changed is
where that grounding comes from.

## How I prompt now

My prompts now tell the agent where the context is, not how to go and
get it. From May, building with shadcn-svelte:

> did you check the available primitives on
> https://shadcn-svelte.com/docs/components? mcp-omnisearch for web
> search if you need it

Also from May:

> can you websearch for the canonical on this

From August:

> there's also all of pirecall to search through, use the pirecall CLI
> for fuzzy searching and the mcp-sqlite-tools for narrow searches

From September:

> get all the context you need with pnpx omnirecall and assess the
> situation, please, report back to me when you have done your
> analysis

The pattern is the task, plus a pointer to where the context lives. A
CLI for past sessions, web search for anything current, and the
project's own docs. The agent works out the rest.

## The same kind of task, then and now

Here's the November prompt again, next to one from September. Both are
SvelteKit work that needed research before any code changed.

November 2025:

> my plan, first check the auth, is there a user lookup each time? can
> this be moved to remote functions? (research remote functions) then,
> each load function doesn't need to do the auth check, right? go
> research the auth remote functions pattern from official sources and
> GitHub of SvelteKit maintainers

September 2026:

> I want to make sure the https://twinkleplop.pngwn.at integration is
> working as expected, could you research twinkleplop for me,
> understand the current integration and correct/improve where
> possible

The second one doesn't say where to look or what order to do things
in. The agent read the twinkleplop docs and source, compared them with
what was in the repo, fixed what was wrong and reported back. It
grounded itself, without me spelling out any of the steps.

That work turned into
[copy buttons and line numbers for this blog](/posts/copy-buttons-and-line-numbers-in-mdsvex-with-twinkleplop).

## From a line to a loop

Research, plan, implement was the first shape my grounding took. It
was a line I ran once at the start of every task, with me checking the
output at the end.

It isn't a line any more. Loop and graph engineering is the new
hotness right now, and looking at how I actually work, it's closer to
a loop.

### Ground

Establish what's real before anything else: the repo, the tests,
earlier sessions and primary docs. It's not only the first step now.
Recall, search and docs are there the whole way through, so an agent
can re-ground mid-task without me.

### Shape

Plan only as much as the task needs. A one-file fix gets one sentence.
A risky change gets a written contract. Agents making an industry out
of small tasks is one of my current frustrations, so the plan has to
match the risk.

### Build narrowly

Change what the task needs and nothing else.

### Verify

Checks, tests and guardrails, not me reading every line. This is the
step RPI never had. In RPI, verification was me.

### Re-ground

When a check fails or something feels off, go back to what's real
instead of pushing on. A failure tells me something the agent didn't
know.

### Encoding the loop

I'm refining this in my-pi. `pi-harness` builds a throwaway harness
for a task: a contract, a task brief, a validation script and a review
script. `pi-factory`, still experimental and off by default, runs one
executor against that contract, validates the result, then hands the
diff to an independent reviewer.

It's not settled. On 7 September I asked a session "at what point does
a better harness become too much harness?", and a few days later I
turned it off for a piece of work. The loop is what I'm aiming for.
How much machinery each task deserves is what I'm still working out.

## What I still do myself

The tools gather context. They don't decide whether the work is going
the right way.

That part is hard to describe. After seeing enough features built,
I've got a sense for what the work needs. When a model suddenly takes
an unexpected course, something feels off, and I stop it and ask why
it's doing that before I let it carry on. "Vibes" sounds unserious,
but those vibes come from a lot of bitter experience.

I can't turn that into a guardrail. The guardrails can hold a line
after I've drawn it. Deciding where the line goes is still my job.

## Wrapping up

**Before: research, plan, implement.** Here's the problem, go and
research it from these sources in this order, don't write any code
until I say so.

1. **Research:** I typed out where to look and who to trust, every
   time.
2. **Plan:** I held the phases apart myself: "no coding, we're
   planning this out first".
3. **Implement:** the agent wrote the code, and I checked it by
   reading it.

**After: a loop.** Here's the problem, here's where the context is.

1. **Ground:** establish what's real from the repo, tests, earlier
   sessions and primary docs, at any point in the task.
2. **Shape:** plan only as much as the risk needs.
3. **Build narrowly:** change what the task needs and nothing else.
4. **Verify:** checks, tests and guardrails, not me reading every
   line.
5. **Re-ground:** when something fails or feels off, go back to what's
   real instead of pushing on.

The difference isn't better prompting. It's that the research, the
reminders and the rules I used to type out every time now live in the
tools.
