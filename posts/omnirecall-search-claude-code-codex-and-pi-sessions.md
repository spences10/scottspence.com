---
date: 2026-09-24
title:
  omnirecall - Search Your Claude Code, Codex and Pi Sessions in One
  Place
tags: ['claude-code', 'pi', 'tools', 'cli']
is_private: false
---

<!-- cSpell:ignore omnirecall ccrecall pirecall ocrecall pnpx spences10 twinkleplop mdsvex migrat endeavouros -->

Claude Code keeps your sessions on disk, for 30 days by default. Each
one is a JSONL file in `~/.claude/projects`, one folder per project:
every prompt, every response and every tool call.

When I found that out, it gave me an idea. If I want to search my past
sessions, make a CLI that syncs those files into SQLite, then tell the
LLM to use the CLI to search for context.

## One recall CLI per agent

That was [ccrecall](https://github.com/spences10/ccrecall). I made the
first version in December 2025, and its first sync read 7,102
transcript files from my `~/.claude` folder: 2,492 sessions and 64,825
messages.

Then it turned out the other agents do the same:

| Agent        | Sessions stored in                               | Recall CLI |
| ------------ | ------------------------------------------------ | ---------- |
| Claude Code  | `~/.claude/projects/<project>/*.jsonl`           | ccrecall   |
| Pi           | `~/.pi/agent/sessions/<project>/*.jsonl`         | pirecall   |
| OpenAI Codex | `~/.codex/sessions/<year>/<month>/<day>/*.jsonl` | ocrecall   |

`pirecall` came in April 2026 when I moved most of my work to Pi, and
`ocrecall` this month. Same idea each time: sync the sessions to
SQLite, give the agent a CLI.

Three tools for three agents meant I had to remember which agent I'd
used before I could find anything.

## omnirecall: all of them in one place

[omnirecall](https://github.com/spences10/omnirecall) groups them
together. It reads Claude Code, Pi and Codex session histories into
one local SQLite database, including Claude Code's subagent sessions.
Those three are all I use really, but I built it so I can add other
coding agents further down the line if I need to.

It's a centralised SQLite database I can give to any coding agent. I
say "use pnpx omnirecall to find X" and it goes and does it.

There's no account and nothing hosted. The archive sits on my machine,
and imported sessions stay searchable even after the agent deletes its
own copies.

## Use it from a coding agent

This is how I use it most of the time. I ask in the conversation I'm
already in:

```text
Use pnpx omnirecall to find the session where we changed the
database queries and fixed slow search. What did we change?
```

The agent runs the commands, searches the earlier sessions and reads
the relevant context without me leaving the conversation. Agents are
good with a CLI, and `--help` on each command tells them what they
need.

## Run it directly

The commands are the same when I run them myself:

```bash
pnpx omnirecall sync
pnpx omnirecall search "database migration"
pnpx omnirecall read '<ref from search>' --context 2
```

`sync` picks up new conversations. It never runs automatically, so the
archive is as fresh as the last time I synced it.

Search uses SQLite FTS5, so the query syntax is FTS5's:
`"exact phrase"`, `sqlite OR database`, `migrat*`. It searches
conversation messages by default, and `--kind all` brings in tool
calls and their output too.

`--json` gives structured results, and `recall --compact --json` is
the one I point agents at. It returns matches with the messages around
them in a compact shape that doesn't flood the context window.

## An example from this month

This month I moved my development setup
[from EndeavourOS to Ubuntu](/posts/moving-my-development-setup-from-endeavouros-to-ubuntu).
I planned the install with Codex on 8 September, then wrote the post
about it with Pi on the 16th.

One search finds both:

```bash
pnpx omnirecall search "endeavouros" --json
```

Here's the shape of what comes back, trimmed down:

```json
{
	"results": [
		{
			"agent": "codex",
			"title": "Explain Ubuntu boot options",
			"project": "/home/scott/repos/docs",
			"timestamp": "2026-09-08T14:08:55.515Z",
			"snippet": "…If you see “EndeavourOS” and an “EndeavourOS fallback” option when you restart…"
		},
		{
			"agent": "pi",
			"project": "/home/scott/repos/scottspence.com",
			"timestamp": "2026-09-16T17:51:44.919Z",
			"snippet": "…Untracked: `posts/moving-my-development-setup-from-endeavouros-to-ubuntu.md`…"
		}
	]
}
```

Each result also has a `ref`, which goes into `omnirecall read` to
pull up the conversation around the match.

Without omnirecall I'd have needed to remember the work was split
across two agents, then search each one separately. Now whichever
agent I'm in can see both.

## The bigger use

Where it really pays off is pulling evidence out of months of work.
Not "I worked on X" but actual outcomes: what shipped, what it fixed
and when.

I give a session omnirecall for fuzzy searches and
[mcp-sqlite-tools](https://github.com/spences10/mcp-sqlite-tools), one
of the
[two MCP tools I still use](/posts/i-built-21-mcp-tools-and-still-use-2),
for narrow queries against the same database. It pulls out decisions,
dates and numbers I'd long forgotten, and checks them against git
history. My memory of what I did in May is not as good as the record
of it!

## Codex plugin

There's also a plugin for Codex and the ChatGPT desktop app, which
adds a recall skill that uses the same CLI:

```bash
codex plugin marketplace add spences10/omnirecall --ref main
codex plugin add omnirecall@personal
```

The
[installation guide](https://github.com/spences10/omnirecall/blob/main/docs/plugin-installation.md)
has the desktop app steps.

## Wrapping up

One archive, three agents, and room for more. If you use more than one
coding agent and keep losing track of where a conversation happened,
give it a go:

```bash
pnpx omnirecall sync
```

It's on [GitHub](https://github.com/spences10/omnirecall) and
[npm](https://www.npmjs.com/package/omnirecall).
