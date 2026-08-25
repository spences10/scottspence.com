---
date: 2026-08-25
title: 'Agentic engineering for reliable coding agents'
tags: ['ai', 'coding-agents', 'my-pi', 'guide']
published: true
---

<!-- cspell:ignore agentic Andrej Karpathy Willison Mainmatter pirecall nopeek worktree worktrees allowlist codebase codebases toolcall toolcalls handoff handoffs -->

Agentic engineering is the practice of putting coding agents inside an
engineering system that makes context, scope, validation, evidence and
human review explicit. The model can plan and write the code, but it
does not get to decide that its own work is correct.

That is my definition, anyway. The term is new enough that people are
still using it to mean several different things. I am not going to
pretend there is an ISO standard for it.

The useful distinction is not whether an LLM touched the code. It is
where trust lives. If the workflow is “prompt, glance at the result,
ship and hope”, that is vibe coding. If the workflow has reviewable
requirements, bounded access, mechanical checks, recorded evidence and
a human accountable for the outcome, that is engineering with agents.

I have gradually built that workflow into
[`my-pi`](https://github.com/spences10/my-pi), my coding-agent setup
built on [Pi](https://pi.dev). This guide brings the pieces together:
harnesses, project rules, research, context retrieval, LSP
diagnostics, evals, telemetry, secret handling and multi-agent work.
Each section links to the deeper implementation where I have one.

## What is agentic engineering?

Agentic engineering is software engineering where agents perform
substantial parts of the development loop while engineers design the
environment in which that work happens.

A coding agent can inspect a repository, search documentation, edit
files, run commands and respond to the results. That makes it more
useful than autocomplete, but it also gives mistakes somewhere to go.
A bad assumption can become a code change. A missing constraint can
become a new dependency. A confident summary can claim that validation
passed when the useful test never ran.

The engineering work moves up a level. You still care about code, but
you also care about:

- how the agent finds the right context
- which actions it may take
- how a task is scoped
- which checks it cannot quietly skip
- how failures are recorded
- when another agent or a human reviews the result
- what happens when the original plan is wrong

Andrej Karpathy helped popularise “agentic engineering” in early 2026
when he reflected on how programming with agents had moved beyond his
earlier “vibe coding” description. The name is useful, but the
underlying work is not mystical. It is specifications, tools,
permissions, tests, observability and review applied to a worker that
is fast, useful and stochastic.

## Agentic engineering versus vibe coding

Vibe coding is outcome-led and deliberately loose. You describe what
you want, let the model generate it, try the visible result and prompt
again until it feels right. That can be brilliant for prototypes,
throwaway tools and exploring an idea.

The problem is pretending the same trust model is enough for
production software.

A production codebase has things a quick demo can hide: permissions,
data migrations, failure recovery, audit trails, accessibility,
performance, existing conventions and users doing odd things in the
wrong order. “It worked when I clicked it” is not evidence that those
systems still work.

Agentic engineering keeps the speed but changes the acceptance
criteria. The agent can still do most of the typing. The work is only
complete when the repository's checks and the task's actual success
conditions say it is complete.

There is still a fuzzy boundary. Simon Willison has written about
agentic engineering and vibe coding becoming closer as models improve
and unmonitored successes make us more willing to trust them. I have
felt that too. The dangerous bit is not using more autonomy. It is
letting repeated success quietly remove the controls that tell you
when the next run is wrong.

## What does a reliable agentic engineering workflow need?

There is no universal stack. A documentation edit does not need the
same machinery as a database migration. These are the parts that have
survived repeated use in my workflow.

### Recover the source of truth first

A fresh agent session knows the prompt and whatever context the
harness has inserted. It does not automatically know why an
architecture choice exists, what failed last week, or which user
correction changed the task.

I start by recovering evidence:

1. inspect the repository and its local instructions
2. find the current implementation and its tests
3. retrieve relevant earlier sessions when the task has history
4. research external APIs and documentation from primary sources
5. state assumptions before building on them

The goal is not maximum context. A giant instruction file can crowd
out the task it is supposed to help with. The goal is relevant context
that the agent can retrieve again when it needs it.

That is why I built
[`pirecall`](https://github.com/spences10/pirecall) for session
history and a
[SQLite context sidecar](/posts/sqlite-context-sidecar-my-pi) for
large tool output. Both turn a wall of text into something searchable.
The agent gets the focused evidence, not every message and log line I
have ever produced.

### Make project knowledge executable

An `AGENTS.md` file is useful for stable project rules. It is not a
force field.

If a rule matters enough that breaking it would damage the codebase, I
try to express it as software: a type, lint rule, boundary check,
test, hook or CI command. Prose tells the agent what good looks like.
Deterministic checks stop a plausible shortcut becoming the next local
convention.

I wrote about this in
[how I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases).
The pattern is simple:

- document the intended architecture
- give the agent a way to retrieve the relevant detail
- block known bad writes early
- test boundaries that normal unit tests do not cover
- require evidence at handoff

The more often I repeat a correction, the stronger the case for
turning it into a check.

### Bound risky tasks outside the conversation

Prompts are good for intent. They are a weak place to keep a trust
boundary.

For material-risk work I use an external task harness. It records the
allowed paths, forbidden operations, validation commands, task status
and collected evidence outside the executor's working context. The
agent can adapt its implementation plan when new facts appear, but it
cannot quietly widen its own permissions or remove the checks it finds
inconvenient.

That distinction matters. A static plan can be wrong. An editable
outer policy is barely a policy at all. My harness separates the fixed
trust boundary from an inner execution scaffold that can be amended
with a reason and an audit trail.

The full design and results are in
[coding-agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi).
The short version is that a harness should answer:

- what may change?
- what must not happen?
- how will success be checked?
- what evidence was collected?
- when should the agent stop and ask for help?

Not every task needs one. Wrapping a spelling fix in a miniature
software factory is ceremony, not rigour.

### Give validation back to the agent

An agent cannot fix a failure it cannot see.

I expose the same useful feedback a developer would use: type errors,
unit and integration tests, browser checks, lint output, build results
and language-server diagnostics. I prefer focused feedback during the
work, followed by the repository's broader checks before completion.

[Adding LSP to my-pi](/posts/add-lsp-to-my-pi) made a bigger
difference than I expected. The agent can ask for diagnostics on the
changed file instead of running a full project check after every edit.
It can also find definitions and references rather than guessing where
a symbol comes from.

The important part is that the completion check is not “the agent says
it looks good”. It is an independent command or observable outcome.
For a user journey, that can mean loading the page and using it. For a
migration, it can mean inspecting the resulting schema and data. A
green test that only asserts a mocked fallback is not proof that the
feature works.

### Record traces and evaluate outcomes

Coding-agent work is difficult to improve if every session disappears
into a transcript.

I added local telemetry to record session, model and tool usage. I
also keep searchable session history and use focused evals when I
change a prompt, tool or retrieval strategy. That lets me ask better
questions: Did the agent use the new tool? Did it find the right
source? Did the change reduce wasted output? Did the guard catch the
failure it was built for?

The implementation is covered in
[adding telemetry to my-pi](/posts/add-telemetry-to-my-pi) and
[hardening redaction with evals and telemetry](/posts/hardening-redaction-in-my-pi).

Evals are not only checks against the final paragraph an agent writes.
The outcome matters. Anthropic uses the useful example of a
flight-booking agent: the transcript may say the flight was booked,
but the real outcome is whether the reservation exists. Coding work is
the same. Grade the repository state and user journey, not the
confidence of the summary.

### Treat secrets and permissions as system concerns

A coding agent with shell, filesystem and network access has a larger
blast radius than a chat box. Prompt injection is also not limited to
what a user types. It can arrive in a web page, issue, dependency
README or tool response.

I use narrow tool permissions, explicit approval boundaries and
secret-reducing command execution. I built
[`nopeek`](https://github.com/spences10/nopeek) so an agent can run a
credential-dependent child process without first printing an entire
`.env` file into its conversation. It does not make arbitrary child
output safe, but it removes one common and unnecessary exposure path.

The wider rule is straightforward: give the agent the least access
needed for the task, and keep destructive or public actions behind a
human approval boundary.

### Use more agents only when the work is actually parallel

Multi-agent work is useful when tasks can proceed independently: one
agent researches an API while another maps the existing
implementation, or separate agents work in isolated worktrees and a
lead reviews the results.

It is less useful when five agents all need the same files, context
and decisions. Then you have created a coordination problem and called
it scale.

My [Team Mode work](/posts/enable-team-mode-in-claude-code) focuses on
ownership, durable handoffs and explicit review. The lead still needs
to understand the combined result. Delegation does not transfer
accountability to a swarm-shaped cloud.

## What did this look like in real use?

I do not have a clean benchmark proving that my workflow makes every
coding task faster. Different projects, models and tasks make that
claim difficult to defend.

I do have operational evidence.

Between 28 June and 25 July 2026, agents created 173 recorded task
harnesses across 104 sessions and 10 real project workspaces. Of
those, 144 reached a completed state at least once, 155 recorded
validation or review evidence, and enforcement blocked an action 133
enforcement blocks across 69 sessions.

Those numbers do not prove that every completed change was good. They
do show that the system was used outside a demo, that agents regularly
produced reviewable evidence, and that enforceable boundaries caught
real behaviour.

They also exposed weaknesses:

- some forbidden-command patterns were too broad
- plans needed legitimate amendments more often than I expected
- stale task state made later sessions confusing
- failed harnesses still needed a human to interpret the outcome
- low-risk tasks became slower when I routed them through the same
  ceremony

That last point matters. Agentic engineering is not “add more
harness”. It is designing enough system for the risk and complexity in
front of you.

## What does not work well?

A few patterns keep failing regardless of which model I use.

### Prompting harder

Repeating “do not drift”, “be careful” or “make sure the tests pass”
can help for one turn. It does not create a durable control. If the
rule is important, give it a test or move it outside the executor's
authority.

### Loading everything into context

More context is not automatically better context. Huge instruction
files, every available MCP tool and complete session transcripts make
the relevant signal harder to find. Use progressive disclosure and
searchable sources.

### Letting the agent review itself

A self-review is useful, but it is not independent evidence. Run the
checks, inspect the diff and use a separate review path for risky
work. The same mistaken assumption can survive planning,
implementation and self-review if all three stages share the same
context.

### Automating the unclear bit

If humans cannot explain the desired outcome, giving the task to more
agents usually produces more output, not more clarity. Research,
discussion and a small prototype can be the correct next step.

## How do you start with agentic engineering?

You do not need to build `my-pi` or adopt my exact tools. Start with
one real failure you keep seeing.

1. **Write the success condition.** Describe the observable result,
   not only the files you expect to change.
2. **Add the cheapest deterministic check.** Use an existing test,
   type-check, lint rule, browser journey or boundary script.
3. **Expose the check to the agent.** Give it focused feedback while
   it works and require the full check before completion.
4. **Keep instructions small.** Put stable project guidance in the
   repository and link to deeper, retrievable documentation.
5. **Restrict access.** Limit paths, commands, credentials and
   external side effects to what the task needs.
6. **Record evidence.** Keep the commands, results, decisions and
   remaining risks needed for review.
7. **Review the system after failure.** Ask which capability or
   control was missing instead of only telling the next model to try
   harder.

Start there. Add more machinery only when repeated failures or task
risk justify it. The goal is not maximum automation. It is the
smallest workflow that makes the result trustworthy.

## The point

The best coding model will change. The useful workflow should survive
that change.

Agentic engineering, as I practise it, is not handing software
delivery to an autonomous agent and walking away. It is making more of
the work delegable because the surrounding system can recover context,
enforce boundaries, return useful feedback and show a human what
actually happened.

The model is the fast, probabilistic worker. The repository, tools,
checks and review process are the engineering system.

That is the bit I trust.

## Go deeper

- [How I work with LLMs](/posts/how-i-work-with-llms)
- [Coding agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi)
- [How I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases)
- [Building my-pi: my own Claude Code alternative with Pi](/posts/building-my-pi-claude-code-alternative-with-pi)
- [Building a SQLite context sidecar for my-pi](/posts/sqlite-context-sidecar-my-pi)
- [Add LSP to my-pi](/posts/add-lsp-to-my-pi)
- [Add telemetry to my-pi](/posts/add-telemetry-to-my-pi)
- [Hardening redaction in my-pi with evals and telemetry](/posts/hardening-redaction-in-my-pi)

## References

- [Andrej Karpathy on the move from vibe coding to agentic engineering](https://x.com/karpathy/status/2019137879310836075)
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Simon Willison: Vibe coding and agentic engineering are getting closer than I'd like](https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/)
- [Mainmatter: Agentic engineering with Svelte](https://mainmatter.com/blog/2026/07/28/agentic-engineering-with-svelte/)
- [Mainmatter: A complete agentic engineering glossary](https://mainmatter.com/blog/2026/08/25/agentic-engineering-glossary/)
