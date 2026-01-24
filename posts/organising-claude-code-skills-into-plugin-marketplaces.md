---
date: 2026-01-18
title: Organising Claude Code Skills Into Plugin Marketplaces
tags: ['claude', 'claude-code', 'guide', 'notes']
is_private: false
---

<!-- cspell:ignore cclog -->

So, I've been building Claude Code skills and tools for a while now,
and I hit a point where I genuinely couldn't remember where anything
was. 😅

"Where's that skill for SvelteKit effect?" _checks three repos_

"Did I update the forced-eval hook in the skills repo or the CLI
repo?" _checks four repos_

"Where's the analytics query for token usage?" _gives up, rewrites it_

Classic chaos. I had skills scattered across `svelte-claude-skills`,
hooks in `claude-skills-cli`, utilities in random project folders, and
half-finished experiments everywhere. Every time I wanted to use
something, I'd spend more time hunting for it than actually using it.

So I did what any reasonable dev would do: I spent a weekend
reorganising everything into two plugin marketplaces.

## Why two marketplaces?

The obvious question is "why not just one?" and honestly, I considered
it. But as I started grouping things, a natural split emerged:

**General AI coding productivity** vs **domain-specific skills**.

Some tools are useful regardless of what framework you're using -
performance optimisations, analytics, the forced-eval hook that makes
skills actually activate. Others are hyper-specific to Svelte and
SvelteKit development.

Bundling everything together would mean Svelte devs downloading a
bunch of stuff they don't need, and non-Svelte devs getting confused
by runes documentation. Separation of concerns, innit?

## claude-code-toolkit

This is the general productivity toolkit. If you're using Claude Code
for any project, these tools help.

**What's in it:**

- **toolkit-skills** - The forced-eval hook (84% skill activation vs
  20% without it), plus ecosystem guidance and research patterns
- **performance** - SQLite FTS5 indexing that dropped file search from
  28ms to 3ms with BM25 ranking
- **mcp-essentials** - Setup guide for my recommended MCP servers
- **analytics** - Query your Claude Code usage from cclog's database

The performance plugin is the one I'm most chuffed about. I've got
130k+ files across my projects, and `@`-ing a file used to be
painfully slow. Now it's instant. The trick? SQLite FTS5 with
intelligent ranking - files you use more often bubble to the top.

```bash
# In Claude Code
/plugin marketplace add spences10/claude-code-toolkit
/plugin install toolkit-skills
/plugin install performance
```

## svelte-skills-kit

This is where all my Svelte and SvelteKit knowledge lives. If you're
building with Svelte 5, this is the stuff I wish I'd had when I
started.

**What's in it:**

- **svelte-runes** - `$state`, `$derived`, `$effect`, `$props`,
  `$bindable` and migration from Svelte 4
- **sveltekit-data-flow** - Load functions, form actions, `fail()`,
  `redirect()`, serialisation rules
- **sveltekit-structure** - Routing, layouts, error boundaries, SSR
- **sveltekit-remote-functions** - `command()`, `query()`, `form()`
  patterns
- **layerchart-svelte5** - Chart patterns with Svelte 5 snippets
- **svelte-components** - Bits UI, Ark UI, Melt UI patterns

These skills get loaded when Claude detects you're working on
something relevant. Ask about form actions? `sveltekit-data-flow`
activates. Working with `$state`? `svelte-runes` kicks in.

```bash
# In Claude Code
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-skills
```

## The SQLite thread

I've been reflecting on my tooling lately, and SQLite has become my
go-to for nearly everything AI-related.

The performance plugin uses SQLite FTS5. The analytics plugin queries
SQLite. My conversation logging (cclog) stores everything in SQLite -
I've got a 186MB database tracking 2,555 AI sessions, 70k messages,
and 19M tokens. 😅

Why SQLite for AI work?

1. **Zero config** - No server, just a file
2. **Portable** - Copy it anywhere, query it with any tool
3. **Fast** - FTS5 queries in 3ms, bulk inserts in 96ms for 5k records
4. **Queryable** - SQL is the universal language for data exploration
5. **Everywhere** - Python, Node, Bash, even MCP servers can use it

The pattern I keep seeing: AI tools generate tons of structured data
(tokens, costs, tool calls, file operations). SQLite makes it trivial
to store, query, and analyse.

## The ecosystem

These marketplaces are part of a broader set of tools I've built:

| Tool             | What it does                           |
| ---------------- | -------------------------------------- |
| mcp-omnisearch   | Unified search (Tavily, Kagi, GitHub)  |
| mcp-sqlite-tools | Safe SQLite operations via MCP         |
| mcpick           | Toggle MCP servers on/off dynamically  |
| cclog            | Sync Claude Code transcripts to SQLite |

They all work together. Use `cclog` to sync your transcripts, query
them with `mcp-sqlite-tools`, search the web with `mcp-omnisearch`,
and manage which MCPs are active with `mcpick`.

## Getting started

If you want to try these:

**For general productivity:**

```bash
/plugin marketplace add spences10/claude-code-toolkit
/plugin install toolkit-skills
```

**For Svelte development:**

```bash
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-skills
```

**Pro tip:** Install `toolkit-skills` alongside `svelte-skills`. The
forced-eval hook in toolkit-skills makes the Svelte skills actually
activate when they should (84% vs 20% without it - I tested this
extensively, see my
[post on skill activation](/posts/how-to-make-claude-code-skills-activate-reliably)).

## What's next

I'm still iterating on these. The `reflect` skill in toolkit-skills is
something I'm particularly excited about - it analyses your session
for corrections and discoveries, then persists them back to skills.
Solving the "memory zero" problem where Claude forgets everything
between sessions.

If you've got suggestions or find bugs, the repos are at:

- [claude-code-toolkit](https://github.com/spences10/claude-code-toolkit)
- [svelte-skills-kit](https://github.com/spences10/svelte-skills-kit)

Hit me up on [Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10) - I'd love to hear what tools
you're building for your Claude Code workflow!
