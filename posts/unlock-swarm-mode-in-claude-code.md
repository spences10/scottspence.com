---
date: 2026-01-28
title: Unlock Swarm Mode in Claude Code with claude-sneakpeek
tags: ['claude', 'claude-code', 'guide']
is_private: false
---

<!-- cspell:ignore Kimi Witteveen claudesp numman -->

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

Anyway, orcestration of tasks is something I've got a bit of an
interest in for me and my team to get ship done! I spent some time
building [ralph-town](https://github.com/spences10/ralph-town)
essentially the Ralph loop but with containers, and, well I had mixed
results with it. Essenitally if you didn't have the perfect user story
with essentially every step outlined it just failed.

I sort of bailed on that idea but watching that video did make me want
to revisit using subagents in Claude Code to get similar results, with
the notion of an 'inbox' where the orchestrator (Claude Code) would
manage the subagents from there! I was in research mode! Pulled the
transcript from Sam's video had Claude break it down into
documentation, then asked Claude to do some more research and it found
[claude-sneakpeek](https://github.com/mikekelly/claude-sneakpeek).

## What is this?

It's a parallel build of Claude Code that unlocks hidden features:

- **Swarm mode** - But not, it's called `TeammateTool`
- **Delegate mode** - Task tool spawns background agents
- **Team coordination** - teammate messaging and task ownership (my
  'inbox' idea)

So Mike took the time to recompile the claude binary with the flag
enabled! It's in it's own npm package you can install and it's
isolated from your main Claude Code install. Separate config,
sessions, MCP servers, credentials. Everything.

## Install it

```bash
npx @realmikekelly/claude-sneakpeek quick --name claudesp # whatever you want to call it
```

Add to PATH if needed (macOS/Linux):

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

Then run `claudesp` to launch.

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

The real magic is in the orchestration skill that ships with it. The
idea is simple:

**You (the orchestrator) don't execute. You delegate.**

```
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR uses directly:                                │
│                                                             │
│  • Read (references, guides, agent outputs for synthesis)   │
│  • TaskCreate, TaskUpdate, TaskGet, TaskList                │
│  • AskUserQuestion                                          │
│  • Task (to spawn workers)                                  │
│                                                             │
│  WORKERS use directly:                                      │
│                                                             │
│  • Read (for exploring/implementing), Write, Edit, Bash     │
│  • Glob, Grep, WebFetch, WebSearch, LSP                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Every worker agent needs a preamble:

```text
CONTEXT: You are a WORKER agent, not an orchestrator.

RULES:
- Complete ONLY the task described below
- Use tools directly (Read, Write, Edit, Bash, etc.)
- Do NOT spawn sub-agents
- Do NOT call TaskCreate or TaskUpdate
- Report your results with absolute file paths

TASK:
[Your specific task here]
```

## Model selection matters

The skill includes guidance on which model to use:

| Model    | When to use                                       |
| -------- | ------------------------------------------------- |
| `haiku`  | Fetch/grep/search tasks - spawn many in parallel  |
| `sonnet` | Well-defined implementation tasks                 |
| `opus`   | Ambiguous problems, architecture, security review |

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
loop and other orcestration methods then this may be what you're
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
