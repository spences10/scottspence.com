---
date: 2026-01-30
title: Claude Code Swarm With Daytona Sandboxes
tags: ['claude', 'claude-code', 'daytona', 'orchestration', 'guide']
is_private: false
---

<script>
  import { Mermaid } from '$lib/components'

  const swarm_diagram = `
flowchart TD
    Lead["Team Lead (Local)<br/>Orchestrates tasks"]
    S1["Sandbox 1<br/>cli-fixer<br/>branch: A"]
    S2["Sandbox 2<br/>mcp-fixer<br/>branch: B"]
    S3["Sandbox 3<br/>cleanup<br/>branch: C"]
    GH["GitHub<br/>(3 PRs open)"]

    Lead --> S1
    Lead --> S2
    Lead --> S3
    S1 --> GH
    S2 --> GH
    S3 --> GH
`
</script>

Ok, so, I've been using the Claude Code swarm feature now for several
days and I'm super impressed! Like, three days in and I already can't
see myself _not_ using it in my daily workflow! Is it a token gobbling
nighmare? Yes, does it get the work done in record time with minimal
intervention? Also yes, but, (and this is the reason for this post)
what about when you have multiple issues spanning multiple files in
the codebase where many of them touch the same files?

Yes, I literally
[wrote about this yesterday](/posts/unlock-swarm-mode-in-claude-code)
where I detail Claude Code's swarm feature, which lets you spawn
teammates to work in parallel.

So, "work in parallel", what do I do about these issues? Resolve them
synchronously? like a caveman? Naw! I construct an elaborate harness
of instant isolated containers for each of the Claude Code teammates
to have their own little environment to do what they like in there!

## Daytona sandboxes

So, last weekend I was on a similar track, trying to have a Ralph loop
in it's own Daytona container, it, well, it was pretty crap! Won't go
into the details too much, but essentially if there wasn't a step by
step for everything that was required the loop would churn out
sub-optimal (at best) results. That was in
[`ralph-town`](https://github.com/spences10/ralph-town), but, rather
than abandon it I was like, "Hey Claude, can teammates use these
Daytona sandboxes?" Claude, "yah, sure!" (paraphrasing).

So, give each agent their own isolated environment. Daytona spins up
development sandboxes that each agent can SSH into and work in
independently.

The core idea is:

<Mermaid diagram={swarm_diagram} />

This is essentially Claude Code swarm mode, but each agent is
instructed to use the Daytona sandbox via SSH.

## How it works

The `ralph-town` CLI gives you these commands:

```bash
# Create a sandbox with git token for pushing/PRs
source .env
ralph-town sandbox create --env "GH_TOKEN=$GH_TOKEN" --name cli-fixer
# Returns a sandbox ID like "s4ndb0x1d"

# Get SSH credentials for a sandbox
ralph-town sandbox ssh s4ndb0x1d

# List all running sandboxes
ralph-town sandbox list

# Clean up when done
ralph-town sandbox delete s4ndb0x1d
```

**Security note**: That `GH_TOKEN` I'm passing to sandboxes where AI
agents run? I created a fine-grained PAT with access to _only_ the
ralph-town repo. Least privilege n' all that. If something goes
sideways, the blast radius is one repo, not my entire GitHub account.

Claude Code spawns a teammate that SSHs into that sandbox instead of
working locally. The teammate operates in complete isolation.
Different filesystem, different git state, different branch.

There's also an MCP server wrapper (`mcp-ralph-town`) to expose
sandbox management as tools directly to Claude. Means my team lead
agent can create and manage sandboxes without me running CLI commands
manually. The MCP server has a security allowlist for commands, so
agents can only run safe operations like git, npm, bun, and file
manipulation.

## The numbers

I ran this setup on ralph-town itself over a day. Multiple sessions,
multiple teams, all using the sandbox approach.

In 24 hours:

- **33 PRs merged**
- **50 issues closed**
- **30 new issues created** (dogfooding discoveries)
- **28 issues still open** (new features, upstream bugs)

Context efficiency is the real win. Solo Claude typically uses 80-90%
of context window before needing a reset. Team orchestration? Around
40%. Teammates carry their own context, investigations happen in their
window, results come back summarised. I just coordinate.

That context efficiency bit is massive. By splitting work across
agents, each one has room to think properly instead of being crammed
full of every file in the project.

## What went wrong (and got fixed)

Right, honesty time. The first day was rough. But that's what
dogfooding is for.

**The PATH issue**

SSH connections weren't getting the full PATH. Every command needed
full paths like `/usr/bin/git` instead of just `git`. Spent 20 minutes
on that one. Fixed by adding PATH config to `/etc/profile.d/` in the
snapshot build.

**The `--name` flag bug**

Was passing to the wrong SDK field. Sandboxes weren't getting named
properly, tracking was a nightmare. Dug through the Daytona SDK, found
the issue, fixed.

**The `exec` returns -1 bug**

This one's upstream. `sandbox exec` returns exit code -1 on
snapshot-based sandboxes
([daytonaio/daytona#2283](https://github.com/daytonaio/daytona/issues/2283)).
For now, better to use regular sandboxes without the `--snapshot` flag
and install tools at runtime. More setup, but `exec` actually works.

**Secrets and environment variables**

Needed `--env-file` support for passing API keys. Added that, plus
`sandbox env set` for setting variables on running sandboxes.

**Security hardening**

The dogfooding teams found security issues too. SSH tokens were
printing to stdout - fixed with masking. The MCP `exec` tool had no
command restrictions - added an allowlist. Teammates finding and
fixing security issues in the tool they're using. Meta.

**Visibility into remote work**

I don't see what teammates are doing in their sandboxes in real-time.
That's fine. The PRs are the feedback loop. If the PR looks good and
tests pass, the work's done. Don't need to watch every keystroke.

## When to use this

This setup makes sense when:

- **Multiple independent tasks.** You've got a backlog of unrelated
  issues that can be tackled in parallel.
- **Lots of branches.** Tasks that need their own feature branches
  without conflict.
- **Can't risk local damage.** Working on something where agent
  mistakes hitting your local files is unacceptable.
- **Context window pressure.** Complex tasks that need more thinking
  room than a single agent has.

It's overkill for:

- Single task work
- Quick fixes
- Anything where the overhead of sandbox creation isn't worth it

## Resources

- [`ralph-town` on GitHub](https://github.com/spences10/ralph-town)
- [My notes on this build](https://github.com/spences10/scottspence.com/issues/1311)
- [Daytona](https://daytona.io)

## Conclusion

AI teammates need isolation just like human developers need separate
laptops. Seems obvious in hindsight. Getting it working reliably?
Still a work in progress.
