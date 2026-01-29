---
date: 2026-01-28
title: Unlock Swarm Mode in Claude Code with claude-sneakpeek
tags: ['claude', 'claude-code', 'guide']
is_private: false
---

<!--
cspell:ignore Kimi Witteveen claudesp numman sneakpeek realmikekelly
-->

So, I watched a video about Kimi K2.5 from Sam Witteveen that detailed
a load of cool looking features but what caught my eye was the swarm
mode feature, this is where it will spin up to (apparently) 100
sub-agents to work on tasks in parallel. Turns out Claude Code has
similar capabilities baked in but they're just feature-flagged and not
publicly released yet. I was sort of aware of it when I saw something
on Reddit about this, can't find the exact post, sorry, I do have the
[gist that was linked](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f)
though and that's essentially a breakdown of a feature flagged version
of Claude Code.

- See
  [Kimi K2.5- The Agent Swarm](https://www.youtube.com/watch?v=FfCqINSD8Tc)
  If you're interested

Anyway, orchestration of tasks is something I've got a bit of an
interest in for me and my team to get ship done! I spent some time
building [ralph-town](https://github.com/spences10/ralph-town)
essentially the Ralph loop but with containers, and, well I had mixed
results with it. Essentially if you didn't have the perfect user story
with essentially every step outlined it just failed.

I sort of bailed on that idea but watching that video did make me want
to revisit using subagents in Claude Code to get similar results, with
the notion of an 'inbox' where the orchestrator (Claude Code) would
manage the subagents from there! I was in research mode! Pulled the
transcript from Sam's video had Claude break it down into
documentation, then asked Claude to do some more research and it found
[claude-sneakpeek](https://github.com/mikekelly/claude-sneakpeek).
That's the post really!

## What is this?

Mike found the feature flag check in the minified JS and patched it to
always return true. What that unlocks:

- **Delegation mode** - spawns a team of specialists when you approve
  a plan
- **Shared task board** - tasks with dependencies that workers pick up
- **Parallel teammates** - workers coordinate amongst themselves
- **Inter-agent messaging** - the `TeammateTool` with `write`,
  `broadcast`, etc.

It's packaged as its own npm install, completely isolated from your
main Claude Code. Separate config, sessions, MCP servers, credentials.
This is important to note as you're starting fresh again!

## Install it

The following is taken from the
[README.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/README.md)
on the claude-sneakpeek repo.

```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp # whatever you want to call it
```

Add to PATH if needed (macOS/Linux):

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

Then run `claudesp` to launch. Or whatever you decided to name it.

## What's actually unlocked?

The repo patches Claude Code to enable task-based coordination tools:

| Tool         | Purpose                       |
| ------------ | ----------------------------- |
| `TaskCreate` | Create tasks for agents       |
| `TaskUpdate` | Track progress, mark complete |
| `TaskGet`    | Retrieve task details         |
| `TaskList`   | List available tasks          |

These replace `TodoWrite` in team mode. Tasks are stored in
`~/.claude-sneakpeek/<variant>/config/tasks/<team_name>/` and isolated
per-project.

## The orchestration pattern

Mike's orchestration skill ships with documentation on how to use
these unlocked tools effectively. The key pattern is the WORKER
preamble - every agent prompt starts with context telling the agent
it's a worker, not an orchestrator. This prevents recursive agent
spawning (agents trying to spawn their own agents). Check the
[tools.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/references/tools.md)
reference for the full preamble and workflow patterns.

The orchestrator handles planning and coordination (Task, TaskCreate,
TaskUpdate), workers do the actual implementation (Write, Edit, Bash).
You maintain this separation through prompting discipline.

## Model selection

Mike's docs have guidance on which model to use for what. Basically:
haiku for quick fetch/search tasks (spawn loads of them), sonnet for
well-defined implementation work, opus for the ambiguous stuff that
needs more reasoning. Makes sense when you think about cost vs
capability. Full breakdown in the
[tools.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/references/tools.md)
reference.

## Real-world testing

Before even trying sneakpeek, I tested vanilla Claude Code's subagent
limits, I'd used it in the past ans saw something about a limit to the
amount of subagents that could be spawned. I tried a simple task, curl
my website. Claude spun up **50 subagents** to handle it. Granted, it
was well-defined work, but the numbers quoted for agent limits seem
conservative. I don't know what the upper limit is, unknown still.

With sneakpeek enabled, I threw a proper task at it, fix Langfuse
telemetry on one of our agents. The issue had 4 sub-issues, a large
reference doc, and a reference implementation repo.

Asked Claude to "form a team" to deal with it:

```
Agent 1 → Review the documentation
Agent 2 → Tracer bullet methodology (find the blocking path first)
Agent 3 → Fix the blocking issue
─────────────────────────────────────────────────────────────────
Then parallel:
Agent 4 → Sub-issue 2
Agent 5 → Sub-issue 3
Agent 6 → Sub-issue 4
```

30 minutes. Not perfect, so I ran another orchestrator pass - read the
docs again, review changes, find gaps, implement. The iterative
approach works.

## Using swarm mode to validate this post

I used swarm mode to fact-check this article, meta! Spawned three
agents in parallel:

```
Agent 1 (haiku)  → Read and summarise this blog post
Agent 2 (haiku)  → Fetch and analyse the gist
Agent 3 (sonnet) → Explore the claude-sneakpeek repo
```

All three ran in the background, reported back within a minute. The
synthesis revealed gaps I'd missed:

**TeammateTool is deeper than I described.** The gist documents 13
operations, not just "write, broadcast, etc.":

- Team management: `spawnTeam`, `discoverTeams`, `requestJoin`,
  `approveJoin`, `rejectJoin`
- Messaging: `write`, `broadcast`
- Lifecycle: `requestShutdown`, `approveShutdown`, `rejectShutdown`
- Plan approval: `approvePlan`, `rejectPlan`
- Cleanup: `cleanup`

**Spawn backends exist.** iTerm2 split panes on macOS, tmux windows
cross-platform, or in-process (fastest). I hadn't mentioned this.

**More interaction patterns.** The gist documents Leader, Swarm,
Pipeline, Council, and Watchdog patterns. The repo adds Task Graph,
Fan-Out, Map-Reduce, Speculative, and Background patterns.

**Infrastructure I glossed over:**

The coordination layer is file-based. Agents communicate via a mailbox
at `~/.claude/teams/{team-name}/messages/{session-id}/`. Tasks live in
`~/.claude/tasks/{team-name}/` - workers autonomously claim them via
`TaskUpdate`. No central broker, just the filesystem.

Crash recovery uses heartbeat timeouts. If an agent dies mid-task, the
5-minute timeout releases the task back to the pool. Another worker
can claim it.

Environment variables tell agents who they are:

- `CLAUDE_CODE_TEAM_NAME` - which team they belong to
- `CLAUDE_CODE_AGENT_ID` - unique identifier
- `CLAUDE_CODE_AGENT_NAME` - display name
- `CLAUDE_CODE_AGENT_TYPE` - role (worker, leader, etc.)
- `CLAUDE_CODE_PLAN_MODE_REQUIRED` - whether plans need approval

**Provider support.** Not just Claude - sneakpeek supports Z.ai,
MiniMax, OpenRouter, and local models via the cc-mirror fork.

This is exactly the kind of research task swarm mode excels at -
parallel information gathering with synthesis. Three sources, one
orchestrator, coherent output.

## The flow

This was taken from the
[orchestration skill](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/SKILL.md)
in the claude-sneakpeek repo, didn't even know 'vibe check' was a
thing, thought I'd add this for illustration purposes, again thanks to
Mike for putting this together for us:

```
User Request
     │
     ▼
┌─────────────┐
│ Vibe Check  │  ← Read their energy, adapt your tone
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Clarify   │  ← AskUserQuestion if scope fuzzy
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         DECOMPOSE INTO TASKS        │
│   TaskCreate → TaskCreate → ...     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         SET DEPENDENCIES            │
│   TaskUpdate(addBlockedBy) for      │
│   things that must happen in order  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         FIND READY WORK             │
│   TaskList → find unblocked tasks   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     SPAWN WORKERS (background)      │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│   │Agent│ │Agent│ │Agent│ │Agent│   │
│   │  A  │ │  B  │ │  C  │ │  D  │   │
│   └─────┘ └─────┘ └─────┘ └─────┘   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         MARK COMPLETE               │
│   TaskUpdate(status="resolved")     │
│   ↻ Loop back to FIND READY WORK    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         SYNTHESIZE & DELIVER        │
│   Weave results into something      │
│   beautiful and satisfying          │
└─────────────────────────────────────┘
```

## Should you use this?

Up to you, usual disclaimer bs here I guess! I've had limited use, but
that use has been very impressive. If you've been looking at Ralph
loop and other orchestration methods then this may be what you're
looking for.

The irony isn't lost on me about the time I spent trying to create my
own orchestration toolchain but I'm also relieved I can just use this
now to be honest!

## Conclusion

I'm a happy camper right now! I don't have to dick around trying to
get my own scuff orchestration version working! This will be short
lived though and I will be using it until the Anthropic team enable
this, which I'm hoping is soon considering the competition are
shipping this now.

## Links

- [claude-sneakpeek repo](https://github.com/mikekelly/claude-sneakpeek)
- [Demo video of swarm mode](https://x.com/NicerInPerson/status/2014989679796347375)
- Fork of [cc-mirror](https://github.com/numman-ali/cc-mirror) by
  Numman Ali
- [ralph-town](https://github.com/spences10/ralph-town) - my external
  orchestration attempt (before discovering sneakpeek)

## Orchestration skill references

- [SKILL.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/SKILL.md) -
  core orchestrator identity and workflow
- [tools.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/references/tools.md) -
  tool reference including model selection and worker preamble
- [patterns.md](https://github.com/mikekelly/claude-sneakpeek/blob/main/src/skills/orchestration/references/patterns.md) -
  orchestration patterns (fan-out, pipeline, map-reduce)
