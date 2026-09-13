---
date: 2026-04-03
updated: 2026-09-13
title: nopeek - Keep Your Secrets Out of Claude Code
tags: ['claude', 'claude-code', 'security', 'cli', 'guide']
published: true
---

<script>
	import { Bluesky } from 'sveltekit-embed'
</script>

<!-- cSpell:ignore nopeek pnpx spences10 hcloud kubectl doctl gcloud mcpick omnisearch ccrecall AKIA nlvjelw pddq qoglleko -->

So, here's the situation. I use Claude Code with cloud CLIs daily,
AWS, Hetzner, that sort of thing. Claude Code is genuinely the
ultimate cheat code for bash though! Need to query an API, parse some
JSON, chain a few commands together? Claude does it faster than I ever
could manually.

The problem? Every single piece of bash output goes straight to
Anthropic's servers. Including your secrets if you let Claude have
access to your `.env` files.

You _can_ lock this down. You can add deny rules in
`~/.claude/settings.json` to block Claude from reading `.env` files
entirely. You can add `PreToolUse` hooks that intercept bash commands
and block anything touching sensitive files. But then Claude can't
actually _use_ those secrets either, and that's the whole point of
having them. You end up in this annoying loop of "I need you to use
this API key but I also need you to never see it." Because...

## The actual problem

According to
[Anthropic's own documentation](https://code.claude.com/docs/en/data-usage),
Claude Code "sends data over the network" and "this data includes all
user prompts and model outputs." That means every bash tool result,
including the output of your `aws sts get-caller-identity` or
`hcloud server list`, is sent to Anthropic.

The retention depends on your account type:

- **Consumer (Free/Pro/Max) with training opt-in:** 5-year retention
- **Consumer with training opt-out:** 30-day retention
- **Commercial (Team/Enterprise/API):** 30-day standard
- **`/feedback` transcripts:** 5 years regardless

You can opt out of training data at
[claude.ai/settings](https://claude.ai/settings/data-privacy-controls),
which drops retention from 5 years to 30 days. I've done that. But
your secrets are still stored for those 30 days either way. Opting out
of training doesn't mean opting out of retention.

Nothing more frustrating to know you have to go roll your credentials
again when you see them scrolling by in Claude's output!

## What I built

[nopeek](https://github.com/spences10/nopeek) is a CLI built for
coding agents to use. You still need to be deliberate about it, Claude
doesn't magically know nopeek exists. When I first wrote this, I used
`bunx nopeek load .env` with session injection. I now prefer `run` for
a single command, especially when each tool call starts a fresh shell.
The agent can refer to `$DATABASE_URL` without printing the connection
string first. The child command still receives the value, so its
output needs care too.

Before nopeek, if I needed Claude to work with a secret I'd have to
`export SECRET_KEY=...` in the terminal _before_ starting the session.
If I forgot one, I'd have to kill the session, export it, and start
again. Now I can say something like "use `bunx nopeek` to load the
`ANTHROPIC_API_KEY` and test it's working with a simple curl" and
Claude does it inline, mid-session. No stopping and starting. There's
still some forethought needed on my part though. If I just say "use
nopeek" without the explicit `bunx nopeek` command, Claude has no
context for what nopeek is and starts searching for packages, running
`which nopeek`, grepping the codebase for it. You have to be specific.
But that's still a lot less friction than before.

## How it works

These are the commands covered here:

| Command  | What it does                                 |
| -------- | -------------------------------------------- |
| `init`   | Scans for cloud CLIs, configures secure auth |
| `load`   | Loads .env secrets for a supported session   |
| `run`    | Runs one child command with selected secrets |
| `set`    | Stores a secret key in nopeek config         |
| `list`   | Shows available keys (no values)             |
| `remove` | Removes a stored key                         |
| `status` | Shows current configuration state            |
| `audit`  | Scans for exposed secrets in .env files      |

## Loading secrets

### One command at a time

**Update, 13 September 2026:** For separate agent tool shells, use
`run` so loading and execution happen together:

```bash
pnpx nopeek run .env --only DATABASE_URL -- \
  sh -c 'psql "$DATABASE_URL" -c "select 1"'
```

Only `DATABASE_URL` is selected from the file. The single quotes keep
the outer shell from expanding it before nopeek starts the child
shell. This example checks the database connection without printing
the connection string.

`run` does not make the variable available to the next tool call.
That's the point: the selected secrets go to this child process, not
a whole sequence of later commands. The child can still print them,
so avoid environment dumps, shell tracing and verbose authentication
output. The [threat model](https://github.com/spences10/nopeek#threat-model-and-non-goals)
sets out what nopeek does and doesn't protect against.

### Persistent session loading

Use `load` when your harness supports persistent env-file injection.
You can load everything from an `.env` file or pick specific keys:

```bash
# Load everything from .env
npx nopeek load .env

# Or just specific keys
npx nopeek load .env --only DATABASE_URL,API_KEY
```

When the harness provides persistent env-file injection, nopeek can
make the variables available to later commands. Check `nopeek status`
rather than assuming every tool shell supports this.

The structured `load` result reports the method used. `env_file`
means session injection; `source_file` gives a path to source in the
shell that needs the variables. Receiving that path in one tool call
does not load anything into an unrelated shell in the next call. If
there's no persistent injection, use `run` instead.

Structured output shows key names, not their values. Don't request
shell assignment output in an agent conversation: that mode is meant
for a trusted shell and explicitly exposes values.

## Storing keys permanently

If you have secrets you want available in every Claude Code session,
you can store them in nopeek's config:

```bash
npx nopeek set STRIPE_KEY --from-env
npx nopeek set MY_API_KEY --value "sk_live_..."
```

These get stored in `~/.config/nopeek/config.json` with `0600`
permissions (owner read/write only). They auto-load on every Claude
Code session via a `SessionStart` hook.

## Cloud CLI detection

nopeek can scan for installed cloud CLIs and configure profile-based
auth:

```bash
npx nopeek init
```

This detects installed cloud CLIs (currently AWS and hcloud) and
configures profile-based auth where possible. Rather than credentials
being embedded in environment variables, nopeek uses named profiles
(`AWS_PROFILE`, `HCLOUD_CONTEXT`) so the auth happens at the CLI
level.

## The redaction layer

On top of the environment variable approach, nopeek has a `PreToolUse`
hook that intercepts cloud CLI commands before Claude sees the output.
It wraps commands through a sed filter that catches common secret
patterns:

- AWS access keys (`AKIA...`)
- Bearer tokens
- Stripe keys (`sk_live_...`, `sk_test_...`)
- Private key headers
- Connection strings with embedded passwords
- Hex tokens (64-char)

So if a cloud CLI command _does_ print something sensitive, it gets
replaced with `[REDACTED]` before it hits Claude's context.

## Limitations

I'm not going to pretend this is bulletproof.

- Claude can still `echo $API_SECRET` if it really wants to. nopeek
  raises the bar, it doesn't make it impossible.
- The redaction is regex-based. It catches known patterns but can't
  catch _every_ possible secret format.
- Commands with pipes or redirections aren't wrapped by the redaction
  hook, too risky to modify complex command semantics.
- The redact hook requires `jq` installed.
- There's an
  [open issue](https://github.com/anthropics/claude-code/issues/39882)
  for `PreApiCall`/`PostApiCall` hooks that would enable full payload
  redaction before data leaves your machine. That would be the proper
  solution.

The way I think about it: nopeek is a seatbelt, not an armoured car.
The primary defence is loading secrets via environment variables so
they never appear in output at all. The redaction layer is the backup
for when something slips through.

I also wrote up how I
[test redaction with synthetic secrets](/posts/hardening-redaction-in-my-pi).
That's about a separate redaction layer in my-pi, not proof that
nopeek can catch everything a child command prints.

## The ecosystem

All my time now seems to be writing convenience tools for Claude Code
to use! I've been busy!

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3mho7hi46kc2y"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

nopeek is part of a broader set of tools I've built for working with
Claude Code:

- [**nopeek**](https://github.com/spences10/nopeek) - the secrets CLI
- [**claude-code-toolkit**](https://github.com/spences10/claude-code-toolkit) -
  plugin marketplace with skills and hooks (nopeek's hooks live here)
- [**mcpick**](https://github.com/spences10/mcpick) - toggle MCP
  servers and manage plugins
- [**claude-skills-cli**](https://github.com/spences10/claude-skills-cli) -
  create and validate Claude Code skills
- [**svelte-skills-kit**](https://github.com/spences10/svelte-skills-kit) -
  Svelte/SvelteKit-specific skills
- [**mcp-omnisearch**](https://github.com/spences10/mcp-omnisearch) -
  unified web search across multiple providers
- [**mcp-sqlite-tools**](https://github.com/spences10/mcp-sqlite-tools) -
  safe SQLite operations
- [**ccrecall**](https://github.com/spences10/ccrecall) - sync Claude
  Code transcripts to SQLite for analytics

The nopeek CLI handles the scanning, loading, and storing. The nopeek
_plugin_ in claude-code-toolkit provides the hooks that auto-load
secrets on session start and redact cloud CLI output.

## Getting started

To get the full setup (CLI + hooks), add the claude-code-toolkit
marketplace and install the nopeek plugin:

```bash
# Add the marketplace
claude plugin marketplace add https://github.com/spences10/claude-code-toolkit

# Install the nopeek plugin (includes SessionStart + PreToolUse hooks)
claude plugin install nopeek@claude-code-toolkit

# Scan your cloud CLIs
npx nopeek init

# Run a database check with only the key it needs
npx nopeek run .env --only DATABASE_URL -- \
  sh -c 'psql "$DATABASE_URL" -c "select 1"'

# Check what's configured
npx nopeek status
```

That's about it. If you're using cloud CLIs through Claude Code and
you'd rather your credentials didn't end up on Anthropic's servers for
the next 30 days (or 5 years), give it a go.
