---
date: 2026-07-25
updated: 2026-08-25
title: 'Coding agent harnesses with my-pi'
tags:
  ['pi', 'my-pi', 'coding-agents', 'developer-experience', 'evals']
published: true
---

<!-- cspell:ignore Ornith pirecall worktree worktrees allowlist anti-tampering DeepReinforce handoff -->

I have a habit of turning repeated arguments with coding agents into
software. If I tell an agent to stay inside five files often enough,
eventually I stop asking nicely and build something that blocks the
sixth. If I keep asking for validation evidence before a review,
eventually that becomes a required output rather than another line in
a prompt.

That is more or less how `pi-harness` happened. It is one part of the
wider
[agentic engineering workflow I use](/posts/agentic-engineering-practical-guide)
to make coding-agent work reviewable.

Since I added it to `my-pi` on 28 June, agents have created 173
recorded task harnesses across 104 sessions and 10 real project
workspaces. They have completed 144 of them at least once, recorded
validation or review evidence in 155, and hit 133 enforcement blocks
across 69 sessions.

They have also got stuck in stale harnesses, blocked perfectly
reasonable commands, run validation in the wrong worktree, and made me
ask why there was so much ceremony around committing two files I had
already reviewed.

That last bit matters. This is not a post about wrapping every tiny
change in process. The data does not support that. It is about what a
coding-agent harness is, where it earns its keep, and where it becomes
another thing for the agent to trip over.

## A plan is not a harness

I use "harness" far too often when talking about coding agents, so it
is worth being specific.

A plan says:

> Change these files, follow these steps, run these checks.

A harness says:

> Here is the task, the execution boundary, the editable scope, the
> forbidden shortcuts, the validation contract, the review process,
> the status record, and the route back when the plan turns out to be
> wrong.

The harness I built for `my-pi` is an ephemeral runtime under `/tmp`.
A typical one looks like this:

```text
/tmp/my-pi-harness-<id>/
  harness.json
  SYSTEM.md
  TASK.md
  status.json
  OUTCOME.md
  outcome.json
  validate.sh
  review.sh
  logs/events.jsonl
```

`harness.json` is the machine-readable contract. The Markdown files
give the executor a useful brief. The scripts run deterministic
validation and review. The status and outcome files leave something
another agent, or future me, can inspect without reconstructing the
whole session.

`my-pi` enforces parts of that contract through Pi tool hooks. It can
block edits outside the allowed paths, test changes that were not part
of the task, forbidden commands, and writes outside the project. It
can also record amendments when the task changes rather than quietly
pretending the original plan was perfect.

That is the distinction I care about. A plan is advice in the model's
context. A harness is external state with some actual teeth.

## The workflow existed before the harness

I was already using roughly the same loop for larger tasks:

1. recover the relevant context
2. establish the source of truth
3. challenge assumptions
4. align on the narrow task
5. execute without wandering off
6. run deterministic validation
7. review the diff for drift and shortcuts
8. report evidence, deltas and remaining risks

I was also separating roles. A higher-reasoning agent would
investigate and coordinate. Another session would implement. A third
might review. The lead session kept enough context to assess the work
instead of using most of its window writing code.

The problem was that the workflow lived in prompts, skills, messages
and my increasingly irritated corrections.

A teammate could receive a good handoff and still edit one file too
many. A validation command could disappear from the final turn. A
reviewer could say "looks good" without running the checks. A resumed
session could understand the broad goal but miss the exact boundary I
had already agreed.

That is the main problem I keep coming back to with LLMs. Prose leaves
room for interpretation, forgetting and convenient shortcuts. A
mechanical check does not. I cannot make the model deterministic, but
I can make the boundary deterministic: this path is allowed, that
command is blocked, these checks must pass, and this evidence must
exist before the task is complete.

It is the same idea I wrote about in
[How I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases):
move important rules out of prompts and into places the model cannot
politely misinterpret or forget.

The workflow existed. It just was not durable or enforceable.

## The useful bit I took from Ornith

The useful bit in
[Ornith-1.0](https://deep-reinforce.com/ornith_1_0.html) was not the
benchmark table. It was the self-scaffolding idea.

Ornith trains a model to produce both the solution and the
task-specific scaffold guiding the solution rollout. More importantly,
its reward-hacking defence separates two things:

1. an immutable outer trust boundary containing the environment, tool
   surface, isolated verification and anti-tampering controls;
2. a mutable inner scaffold containing the task strategy, memory,
   orchestration and error handling.

I was not doing reinforcement learning. I was building an
inference-time version of the same separation.

My first attempt was essentially a nicer Markdown plan. It described
the goal, allowed changes, validation and escalation rules, but it
could not enforce any of them. Making it executable fixed that part.

The next attempt went too far in the other direction. It treated the
whole contract as immutable, including the planner's guesses about
which files needed changing and which checks should run. That sounds
safe until the plan is wrong.

The design that survived was simpler:

```text
Outer policy, fixed during execution
  workspace boundary
  protected paths
  prohibited commands
  verifier protection
  available tool surface

Inner scaffold, versioned and amendable
  task interpretation
  planned edit scope
  validation commands
  test strategy
  model allocation
  orchestration strategy
  escalation rules
```

The executor cannot weaken the real trust boundary. The user or
planner can amend the task strategy when new evidence appears, with a
reason and an audit trail.

That distinction turned out to matter a lot more than the original
plan.

## What 173 harnesses taught me

I synced `pirecall` and queried my session history from the first
implementation on 28 June through 24 July.

There were 175 `harness_create` calls. I could analyse 173 captured
creation results; two calls had no captured result. Those 173 included
two explicit end-to-end smoke harnesses and appeared across 104
sessions and 10 non-temporary project workspaces.

The first useful finding is that agents should not use a harness for
every change.

Across the same period, 310 sessions used `edit` or `write`. Only 99
of them created a harness. That is 31.9%.

I was reaching for one mostly when the work was risky, ambiguous,
long-running, spread across several files, or split between agents. A
small obvious edit did not need its own temporary bureaucracy.

The useful routing rule is:

> Use a harness when the cost of agent drift, lost context or false
> completion is higher than the cost of the harness ceremony.

The rest of the numbers make more sense through that lens.

## Enforcement caught real problems

I found 133 harness-related blocks across 69 sessions. They included:

- 47 forbidden-command matches
- 32 paths outside the project workspace
- 25 paths outside the agreed task scope
- 25 review guard failures
- two explicitly protected paths
- one blocked test edit
- one blocked test deletion

Some of those are exactly why the harness exists. It stopped commit
commands before approval, caught files outside the agreed scope, and
prevented unplanned changes to tests. Review scripts found drift that
a conversational "looks good" could easily miss.

But not every block was a win.

A forbidden-command pattern caught harmless `-u` flags. The workspace
rule blocked useful temporary probe scripts. Worktree paths were
initially treated as being outside the main checkout. An
already-reviewed change hit the old harness boundary when all I wanted
the agent to do was commit it.

There were three direct complaints from me across two sessions, all
pointing at the same problem: a safety mechanism that does not know
when its job is finished becomes bureaucracy.

The harness should constrain execution. It should not claim ownership
of every action that happens afterwards.

## Static plans were wrong surprisingly often

Since `harness_amend` was added, 41 harnesses were amended 91 times in
the period I measured. That is 23.7% of all captured harnesses, with
an average of 2.22 amendments among those that changed.

The amendments were split almost evenly between user and planner
requests.

Nearly a quarter of the harnesses needed their inner scaffold revised.
The original contract was not sacred. The user clarified the scope.
Validation exposed a missing file. The planner found the test strategy
was wrong. New evidence changed the order of work.

That is the strongest evidence for the Ornith-inspired separation. The
answer is not to make the whole harness soft and ignorable. It is to
keep the real trust boundary fixed while making the task strategy
explicitly revisable.

Immutable policy. Amendable scaffold. Audit both.

## Failed does not always mean useless

Of the 173 harnesses, 144 were marked completed at least once and 155
recorded validation or review evidence.

Eleven ended in a failed state. Most were reverted or aborted after a
direct correction, exposed required validation failures, or were
stopped because the task had changed. Those are useful outcomes if the
alternative is an agent quietly listing the focused checks that passed
and declaring victory.

Two failures were different. Validation ran against the main `my-pi`
checkout rather than the requested PR worktrees, making the evidence
invalid. Those were actual defects in the harness runtime.

There were also stale harnesses where the underlying work had finished
but the agent never performed the final status update. Some sessions
ended with passing checks, completed investigations or shipped work,
while the harness remained non-terminal.

That is not a task-failure metric. It is a usability problem. The
runtime still relies too much on an agent remembering one final piece
of bookkeeping.

Failure and stale state both told me something useful because the
state existed outside the agent's final summary. Without that record,
the distinction would have been lost in the transcript.

## When I use a harness now

A harness earns its ceremony when one or more of these are true:

- the task is ambiguous enough that the scope will probably change
- the work crosses several files or packages
- another agent will execute or review it
- the session may need handing off or resuming
- there are destructive or external side effects
- tests and verification need protecting from the executor
- the diff must stop for human review before commit, push or release
- a cheaper or less trusted model is doing the implementation

It is usually unnecessary for:

- a read-only lookup
- a tiny, obvious edit
- running one explicit command
- committing an already-reviewed diff
- formatting a known file
- a task where describing the contract takes longer than doing the
  work

That last one should be obvious. It apparently took me several annoyed
conversations with agents to make it explicit.

## What the evidence does not prove

I do not have a clean A/B test showing that the same tasks finish
faster or produce better code with a harness.

The harnessed tasks are deliberately the messier ones, so comparing
them directly with non-harnessed sessions would be nonsense. A
five-minute copy change is not a fair control for a multi-package
refactor with three agents and a production validation gate.

What the current evidence shows is narrower:

- the harness is being used repeatedly across real projects
- most harnesses record evidence and reach completion
- enforcement catches genuine scope and validation problems
- static task contracts need amendment often
- failure states contain useful information rather than being hidden
- stale lifecycle state and over-broad guards remain real weaknesses
- blanket routing would create unnecessary ceremony

A proper evaluation would pair similar tasks with and without a
harness, then measure success, review findings, rework, tool calls,
wall time and user corrections. I have the telemetry and recall data
to do that now. I just have not done it yet.

No vibes pretending to be science.

## What a harness is for

A coding-agent harness does not make the model smarter.

It externalises the bits I do not want to trust to the model's working
memory:

- what it is allowed to change
- what it must not weaken
- how success is verified
- what evidence has actually been collected
- when it must stop or escalate
- how another session can recover the task
- which parts of the strategy may change

That makes the work easier to inspect and harder to quietly fake.

Ornith gave me the outer-policy and inner-scaffold model. My existing
workflow supplied the actual loop. Real usage showed where enforcement
helped, where it failed, and where I had simply added ceremony to a
task that did not need it.

That is the bit I would keep if I rebuilt it tomorrow:

- keep the outer trust boundary outside the executor
- let the inner scaffold change when reality changes
- make validation deterministic
- record the evidence
- treat failure honestly
- know when not to use the bloody thing

## References

- [Ornith-1.0: Self-Scaffolding LLMs for Agentic Coding](https://deep-reinforce.com/ornith_1_0.html)
- [`my-pi`](https://github.com/spences10/my-pi)
- [`@spences10/pi-harness`](https://www.npmjs.com/package/@spences10/pi-harness)
- [Building my-pi: my own Claude Code alternative with Pi](/posts/building-my-pi-claude-code-alternative-with-pi)
- [Building a SQLite context sidecar for my-pi](/posts/sqlite-context-sidecar-my-pi)
