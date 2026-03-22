---
date: 2026-03-22
title: McPick - Manage MCP Servers and Plugins in Claude Code
tags: ['mcp', 'claude-code', 'tools', 'cli', 'guide']
published: true
---

<!-- cSpell:ignore mcpick mcpServers pnpx spences10 modelcontextprotocol omnisearch -->

I saw a Reddit post the other day that called setting up MCP servers
in Claude Code "a tech ritual for the quietly desperate." 😅

That tracks! The comments were full of people saying things like "took
me 30 minutes to figure out where the config lives" and "3 months
later and it's still a PITA." I've even seen people ask Claude which
config file to edit and get multiple wrong answers back.

Currently one of the most read posts on this site is the
[configuring MCP tools in Claude Code](/posts/configuring-mcp-tools-in-claude-code)
post, because it's painful using the Claude Code CLI to go through
these options and editing the file in place is simpler and less prone
to Claude messing it up!

That's one of the reasons I built
[McPick](https://github.com/spences10/mcpick). It started as a way to
toggle MCP servers on and off — I was concerned about context bloat
from having too many servers active. Anthropic have since resolved
that (unused servers don't eat into your context until they're
activated), but McPick's grown into something more since then.

## What McPick does

McPick is a CLI for managing MCP servers **and** Claude Code
marketplace plugins. Run `npx mcpick` and you get a friendly TUI
that's way simpler than the built-in Claude Code configuration flow.
Or have Claude manage manage it for you. Either way, no manual JSON
editing.

```bash
npx mcpick@latest
```

I'm using `npx` throughout this post as it's the lowest common
denominator — most people will have it. I personally use `bunx` or
`pnpx` because they're faster, so swap in whichever you prefer.

That gives you an interactive menu where you can:

- **Enable/disable MCP servers** — toggle them on and off without
  touching JSON
- **Manage plugins** — install, uninstall, enable, disable marketplace
  plugins
- **Manage plugin cache** — detect stale plugins, clear caches,
  refresh from git
- **Backup/restore** — automatic backups before changes, restore when
  things go sideways
- **Profiles** — save server and plugin sets for different tasks,
  switch between them

## Let Claude manage your MCP servers

Here's the thing — you don't even need to use the interactive menu.
Every command works as a CLI subcommand too, which means **Claude can
use it for you**, Claude loves a CLI. Yes, I now build tools for my
tools to use!

Example! I asked Claude "find the Anthropic frontend design plugin and
add it for me." It ran `npx mcpick plugins list`, saw the naming
pattern, then ran `npx mcpick plugins install frontend-design`. Done
in two commands, no TUI, no me touching anything.

```bash
# Claude can run these directly
npx mcpick plugins list
npx mcpick plugins install frontend-design
npx mcpick enable my-server
npx mcpick disable my-server
```

That's the whole point. McPick isn't just a tool for _you_ to manage
MCP servers — it's a tool for _Claude_ to manage them for you. Every
subcommand supports `--json` for machine-readable output, so Claude
can chain commands together without parsing terminal formatting.

## Server management

Three scopes for server configuration:

- **Local** — project-specific (`settings.local.json`)
- **Project** — shared with the team (`.mcp.json`)
- **User** — global (`~/.claude.json`)

```bash
# List all servers with their status
npx mcpick list

# Toggle servers
npx mcpick enable omnisearch
npx mcpick disable sequential-thinking

# Add a new server
npx mcpick add --name my-server --command npx --args my-mcp-server

# Remove a server
npx mcpick remove my-server
```

Each command supports `--scope` to target the right config level.
Handy if you're scripting or letting Claude chain commands together.

One thing I found during testing — HTTP servers with auth headers
(like bearer tokens) were getting their headers wiped when you
disabled then re-enabled them. The config would go from having an
`Authorization` header to just... not having one. 😅 Took three
separate fixes to nail that one: passing `-H` flags properly, syncing
the live config back to the registry before disabling, and making sure
the registry doesn't overwrite fresh config with stale data.

## Plugin management

Claude Code has a marketplace for plugins now, and managing them
manually was a ballache. I added plugin management to McPick so you
can install, uninstall, enable, disable, and update — all from one
place.

```bash
# See what's available
npx mcpick plugins list

# Install and manage
npx mcpick plugins install frontend-design
npx mcpick plugins enable frontend-design
npx mcpick plugins disable frontend-design
npx mcpick plugins uninstall frontend-design

# Update to latest
npx mcpick plugins update frontend-design
```

The TUI has the same options too — "Enable / Disable plugins" in the
interactive menu reads `enabledPlugins` from your
`~/.claude/settings.json` and gives you a multiselect to toggle them.

## Cache management (the one that saved me hours)

This is the feature that came from real pain. I'm iterating on a
marketplace for a client, their team needs specific skills for Claude
to use. I make a change, ask a colleague to try it. Nothing changes.
The cached plugin is still there. Every. Time. 😂

I'd been through this cycle enough times that I wrote a PRD for it,
had Claude assess it, then built the whole thing in one session. The
cache lives in `~/.claude/plugins/cache/` and without a way to inspect
it, you're just guessing whether you're running old code.

```bash
# What's stale?
npx mcpick cache status

# Nuclear option — clear everything
npx mcpick cache clear --all

# Clear a specific plugin
npx mcpick cache clear frontend-design

# Pull latest from git
npx mcpick cache refresh

# Clean up orphaned version directories
npx mcpick cache clean-orphaned
```

`npx mcpick cache status` tells you exactly what's stale.
`npx mcpick cache refresh` pulls the latest from git. That's it. No
more "did it actually update?" uncertainty.

Fun fact — while building this I discovered that Claude Code has a
built-in `/reload-plugins` command that refreshes plugins from the
marketplace. Handy if you don't need the full cache management, but it
doesn't give you the granular control that `npx mcpick cache` does.

## Profiles for context switching

Different projects need different MCP servers. I don't want my SQLite
tools loaded when I'm working on a frontend-only project, and I don't
need my search tools when I'm doing database work.

```bash
# Save current setup as a profile
npx mcpick profile save frontend-work

# Load it later
npx mcpick profile load frontend-work

# See what you've got
npx mcpick profile list
```

I wrote about the
[context bloat problem](/posts/optimising-mcp-server-context-usage-in-claude-code)
before — profiles were originally how I managed that. They now cover
both MCP servers and plugin configurations, so you can switch your
entire tooling context in one command.

## Safety first

McPick keeps the last 10 backups of your config automatically. Every
time you make a change, it snapshots the current state first. It also
uses atomic writes when updating `~/.claude.json` — it writes to a
temp file first, then renames it into place. This means if Claude
edits the config at the same time, you won't end up with a corrupted
file.

```bash
# Create a manual backup
npx mcpick backup

# Restore the latest
npx mcpick restore

# Restore a specific backup
npx mcpick restore ~/.claude/mcpick/backups/backup-2026-03-22.json
```

It only touches the `mcpServers` section of your config — everything
else stays untouched.

## Try it

```bash
npx mcpick@latest
```

That's literally it. No global install needed, no config, no setup. Or
if you want Claude to manage your MCP servers for you, just tell it to
use mcpick. It'll figure out the rest.

Have you been struggling with MCP server config? Or found a workflow
that works for you? Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10) — I'd love to hear your
thoughts or war stories.
