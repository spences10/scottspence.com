---
date: 2026-02-07
title: Enable Team Mode in Claude Code
tags: ['claude', 'claude-code', 'guide', 'orchestration']
is_private: false
---

<!--
cspell:ignore sneakpeek realmikekelly kieranklaassen teammateMode ccrecall agentic Klaassen Ghostty respawned
-->

Right, so, remember when I wrote about
[unlocking swarm mode with claude-sneakpeek](/posts/unlock-swarm-mode-in-claude-code)?
And then
[using Daytona sandboxes](/posts/claude-code-swarm-daytona-sandboxes)
with it? Well, I said at the end of that first post that this would be
short lived and I'd be switching once Anthropic shipped it officially.
That happened. Opus 4.6 dropped on Feb 5th and agent teams are now a
first-class feature in Claude Code.

I've already switched off claude-sneakpeek and back to vanilla Claude
Code. It's not enabled by default! Here's how to enable it.

## Enable agent teams

Two things to do. First, set the environment variable in
`~/.claude/settings.json`:

```json
{
	"env": {
		"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
	}
}
```

That's the flag that unlocks the TeamCreate, TaskCreate, TaskUpdate,
TaskList, SendMessage tools. The same ones that were hidden behind
obfuscated checks in the minified JS that Mike Kelly patched out for
sneakpeek. Now you just... set a flag.

## Configure teammate mode

Open Claude Code and go to the settings menu (type `/config` or hit
the settings shortcut). These are the relevant options:

```
Default permission mode    Default
Teammate mode              auto
```

## Teammate mode

This controls how teammates render in the terminal. Three options:

| Mode         | What it does                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| `auto`       | Split panes in tmux, in-process otherwise                                      |
| `in-process` | All teammates in the main terminal. `Shift+Up/Down` to select, `Enter` to view |
| `tmux`       | Each teammate gets its own pane. Requires tmux or iTerm2                       |

I use `auto` which defaults to in-process on my setup (Ghostty doesn't
support tmux pane splitting). Works fine. It can also be set in
`settings.json`:

```json
{
	"teammateMode": "in-process"
}
```

## Permission mode

I initially tried the **Delegate Mode** but was getting permission
issues, if you don't live your life in YOLO mode
(`--dangerously-skip-permissions`) then this will happen.

My initial reaction when reading about delegate mode was let's use
that now! Why? because it restricts the lead to coordination-only
tools, forcing it to break work down and assign it to teammates. In
theory that's the whole point of orchestration.

In practice, delegate mode passes its restrictions to the teammates
too. They inherit the lead's permission mode and end up unable to read
files, run commands, or do any actual work. I tested this with the
same prompt in both modes — delegate mode failed with agents stuck
requesting file access, default mode worked first time.

I was still having issues however because I have quite a restrictive
set of permissions for Claude Code so I had to give up some!

Here's what I use now:

```json
{
	"permissions": {
		"allow": [
			"Bash(bun:*)",
			"Bash(npx:*)",
			"Bash(node:*)",
			"Bash(git add:*)",
			"Bash(git commit:*)",
			"Bash(git status:*)",
			"Bash(git diff:*)",
			"Bash(git log:*)",
			"Bash(git branch:*)",
			"Bash(git checkout:*)",
			"Bash(git push origin:*)",
			"Bash(gh:*)",
			"Bash(mkdir:*)",
			"Bash(ls:*)",
			"Bash(grep:*)",
			"Edit(*)",
			"Write(*)",
			"WebFetch",
			"Skill(*)"
		],
		"deny": [
			"Bash(git push origin main*)",
			"Bash(git push --force:*)",
			"Bash(git reset --hard:*)"
		]
	}
}
```

The `allow` list pre-approves common tools so teammates don't stall on
permission prompts. The `deny` list prevents the things I actually
care about - force pushes, pushing to main, destructive resets.

## How it works

The lead creates a team, populates a shared task list, and spawns
teammates. Each teammate is a full Claude Code instance that can claim
tasks, do work, message other teammates, and mark tasks complete. The
lead coordinates and synthesises results.

The tools:

| Tool          | Purpose                               |
| ------------- | ------------------------------------- |
| `TeamCreate`  | Create a team with shared task list   |
| `TaskCreate`  | Create tasks with dependencies        |
| `TaskUpdate`  | Claim, complete, or modify tasks      |
| `TaskList`    | List available and blocked tasks      |
| `TaskGet`     | Get full task details                 |
| `SendMessage` | DM teammates, broadcast, or shut down |
| `TeamDelete`  | Clean up team resources when done     |

## Quick start

Once the settings are sorted, just ask Claude to form a team:

```
Create a team to work on these three issues:
- #42 fix the broken auth flow
- #43 update the API client
- #44 add tests for the new endpoint
```

Claude will:

1. Call `TeamCreate` to set up the team
2. Call `TaskCreate` for each piece of work (with dependencies if
   needed)
3. Spawn teammates with appropriate models
4. Teammates claim tasks, do the work, mark complete
5. Lead synthesises and reports back

I can watch it all happen in the terminal. With `in-process` mode
`Shift+Up/Down` cycles through teammates to see what they're up to.

## Conclusion

If you were holding off on sneakpeek because it was a patched binary,
fair enough. No excuse now though. Set the flag, configure
permissions, and let Claude Code do what it was clearly built to do.
The permissions bit is the one I missed initially — without allowlists
teammates stall on permission prompts with nobody to approve them.

## Links

- [Official docs: Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Opus 4.6 announcement](https://www.anthropic.com/news/claude-opus-4-6)
- [claude-sneakpeek](https://github.com/mikekelly/claude-sneakpeek)
  (the OG, still worth reading Mike's orchestration skill docs)
- [Experimental flags gist](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f)
- [ccrecall](https://github.com/spences10/ccrecall) - search across
  Claude Code session transcripts
- [My previous post: Unlock Swarm Mode](/posts/unlock-swarm-mode-in-claude-code)
- [My previous post: Swarm with Daytona](/posts/claude-code-swarm-daytona-sandboxes)
