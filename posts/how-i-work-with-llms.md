---
date: 2026-07-25
updated: 2026-08-25
title: 'How I work with LLMs'
tags: ['ai', 'llms', 'pi', 'my-pi', 'developer-experience']
published: true
---

<!-- cspell:ignore LLMs pirecall ccrecall worktree worktrees allowlist handoff nopeek -->

In November 2025 I wrote
[the honest version of working with Claude Code](/posts/working-with-claude-code-the-honest-version).
At the time, most of my process involved spotting when Claude was
drifting, calling out the bullshit, checking that it understood the
task, and restarting the session when the conversation got too long.

I described myself as a product manager for a stochastic parrot.

That was honest, but it is not really how I work with LLMs now.

I still use them for nearly every development task. I still expect
them to drift, misunderstand context and confidently fill gaps with
plausible shite. What changed is that I rely much less on catching all
of that conversationally.

My workflow is now built around grounding, source-of-truth recovery,
research, assumption checking, narrow execution and mechanical
validation. The LLM is useful throughout that process, but it is never
the source of truth.

That distinction has changed everything. I now think of the whole
system as
[agentic engineering in practice](/posts/agentic-engineering-practical-guide),
not a better prompting technique.

## I stopped trying to prompt my way out of it

The old workflow was reactive.

I would give Claude a task, ask it to explain the task back to me, let
it start, then watch for the point where its interpretation began to
wander. If it went too far, I would correct it or start another
session.

That worked, but it made my judgement part of every individual tool
call. I had to notice the drift while it was happening. A missed
shortcut could become a new codebase pattern. A confident summary
could replace what the repository actually said. A focused test could
pass while the broader workflow remained broken.

The answer was not a longer prompt.

Prose leaves room for interpretation. A model can skim it, forget it,
fixate on the wrong sentence, or treat a hard requirement as useful
background. I cannot make the model deterministic, but I can make more
of the workflow deterministic.

I can make the agent read the actual source. I can block changes until
research is complete. I can put architectural boundaries in checks. I
can require specific validation. I can record what was run. I can
separate the agent implementing a change from the context used to
review it.

That is the shift: less trust in a good conversation, more trust in a
process that keeps pulling the conversation back to reality.

## My workflow is more than research, plan, implement

Research, plan, implement is a useful summary, but it starts too late.
There is a lot I do before I consider a plan trustworthy.

The full loop is closer to this:

1. ground the task in reality
2. establish the source of truth
3. research the unknowns
4. challenge assumptions
5. shape and plan the work
6. implement narrowly
7. validate mechanically
8. review the evidence and re-ground if necessary

This is not a rigid sequence where every task needs eight formal
phases. A small edit can move through it in minutes. A production bug
might loop between grounding, research and assumption checking several
times before anyone touches code.

The important bit is that implementation is not the default first
move.

## Ground the task in reality

When someone reports a bug, suggests a feature or asks a question,
their explanation is evidence. It is not automatically the complete
problem definition.

The same applies to my own theories. I will often tell an agent what I
think is happening, then explicitly ask it to qualify that thinking or
prove me wrong. I do not want it to turn my guess into a requirement
just because I wrote the prompt.

Grounding can mean:

- reproducing the current behaviour
- reading the original request rather than its latest summary
- inspecting the relevant code and tests
- querying the database
- checking session history
- reading stakeholder messages or meeting notes
- using the browser to follow the real user journey
- comparing documentation with the installed implementation

I often say "no changes until we discuss this" or ask for research and
analysis before planning the work. That is not me being precious about
process. It is cheaper than implementing a clean solution to an
imaginary problem.

One pattern I have had to correct repeatedly is an agent seeing a
plausible cause and immediately offering to fix it. I am usually still
trying to establish whether the cause is real.

Investigation and implementation are different tasks. Treating them as
one is how assumptions get compiled into code.

## Establish the source of truth

Once the task has some grounding, I want to know which evidence
actually has authority.

That changes by task. It might be:

- current application code and tests
- a schema or migration history
- upstream documentation and source
- production data
- a stakeholder decision
- an API response
- a pull request or issue
- the original session where a decision was made

The LLM's summary is not on that list.

Summaries are useful maps. They are not the territory. If an agent
says "the system currently does X", I want to know which file, query,
request or user journey proves it.

This is why I built tools like `pirecall` and the SQLite context
sidecar into `my-pi`. Long-running work produces a lot of history. I
do not want to dump all of it into the context window, but I do want a
way to search it and recover the exact message or tool result when it
matters.

The goal is not maximum context. It is relevant, recoverable evidence.

## Research the unknowns

If the task depends on an API, package, framework feature or external
claim, I want the agent to research it before changing code.

Search results are discovery, not verification. The useful workflow
is:

1. find the likely source
2. read the actual documentation, repository or implementation
3. compare it with the version in the project
4. report contradictions or missing evidence
5. only then decide what the code should do

This sounds obvious. LLMs still try to answer from training data all
the time, especially when the real answer looks similar to an older
API they have seen before.

My `pirecall` history reflects how much this has become part of normal
work. Since I started using Pi in April, research language appears in
314 of my messages across 242 sessions. Prove or verify language
appears in 287 messages across 204 sessions.

Those are rough text matches, not a scientific classification. They do
show that research and verification are not occasional specialist
steps. They are part of how I talk to the tool every day.

The tooling shows the same pattern. Across those Pi sessions there
were 998 web searches and 770 source-extraction calls, spread across
more than 260 sessions. Searching alone is not enough. I want the page
behind the result.

## Challenge assumptions before planning

This is the part most planning workflows skip.

A plan can be beautifully structured and still be based on nonsense.
Before I approve one, I want the agent to identify what it inferred,
what it verified, and what remains uncertain.

That includes challenging me.

I use phrases like "prove me wrong", "qualify my thinking" and "ground
this in reality" because models are otherwise very happy to accept the
premise of a prompt. Agreeing with me is often the shortest path to a
plausible response. It is not necessarily the shortest path to the
right result.

I also hold changes explicitly. My Pi history contains 90 messages
across 83 sessions telling agents not to make changes yet. Sometimes I
want a report. Sometimes I want to compare options. Sometimes the
investigation has exposed a product decision rather than a code
defect.

An agent optimised for completing tasks can find that frustrating. It
keeps trying to reach the implementation phase. I keep dragging it
back to the question we have not answered.

Good. That tension is useful.

## Force a straight answer

Grounding does not always require more research. Sometimes I already
have enough information and the conversation is producing more
explanation than clarity.

That is when I ask for an answer in fifteen words or less. If the
question is genuinely binary, I demand a yes or no answer.

I use both a lot. Before writing this post, my Pi history contained
103 fifteen-word prompts and 127 explicit yes/no prompts. The habit
predates Pi too: my Claude Code history contains another 57
fifteen-word prompts.

They are simple constraints, but they work.

I tend to use them for three things:

- stripping a long explanation down to the actual issue
- confirming one factual premise before continuing
- stopping the agent hedging after it has already given me a lot of
  words without a straight answer

My session history is full of examples:

> Are you patching and fixing symptoms here, rather than the cause?
> Yes/no answer only.

> In fifteen words or less, explain the issue.

A long answer gives an LLM room to bury uncertainty, qualifications or
an uncomfortable fact inside a plausible explanation. Compression
forces it to state what it currently believes. I can then accept that
answer, reject it, or investigate it.

A yes/no constraint only works when the question is actually binary. I
do not want to flatten a complicated product decision into a false
choice. But when I am checking one premise, I do not need another
three-paragraph tour of the context I already know.

Sometimes the fastest route back to reality is making the model stop
talking.

## Shape, plan and implement

Only after the evidence is good enough do I shape the work.

A useful plan should make clear:

- what problem we are solving
- what evidence supports that definition
- what is in and out of scope
- which files or systems are likely to change
- which assumptions remain
- how the result will be validated
- where the agent must stop for review or approval

Then implementation can be surprisingly boring.

For larger work, I often separate coordination from execution. One
session recovers context, researches the task and maintains the source
of truth. Another implements the bounded change. A third can review
it. The coordinating session does not burn most of its context window
writing code, so it still has enough perspective to judge the result.

I am also happy to use a cheaper or faster model for implementation
when the task boundary and validation are strong enough. The cleverest
model does not need to perform every mechanical edit.

This is where
[coding-agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi)
fit. A harness turns the shaped task into external control state: the
editable scope, forbidden shortcuts, validation commands, outcome and
review trail. The plan can change when new evidence appears, but the
executor cannot quietly weaken the trust boundary.

Not every task needs that ceremony. The point is to have it available
when the cost of drift is higher than the cost of the harness.

## Validate claims, not effort

An agent can spend twenty minutes making thoughtful-looking edits and
still be wrong.

I do not care how convincing the final summary sounds. I care what the
evidence says.

Depending on the task, validation might include:

- focused tests
- the broader package or repository suite
- type and LSP diagnostics
- lint and architectural boundary checks
- a production build
- browser testing of the critical journey
- database queries before and after a change
- reviewing the diff for unrelated edits
- an independent review session

Since April, my Pi sessions have made 3,393 batched LSP diagnostic
calls across 851 sessions. That is a more useful description of my
workflow than "I ask the model to check its work". The check is a tool
with an observable result.

Validation can also send the task back to the beginning. If the result
contradicts the plan, I would rather re-ground than keep patching the
implementation until the test turns green.

A failing check is evidence. It is not an inconvenience to explain
away in the handoff.

## I did not consciously stop using Claude Code

I thought my confidence in Claude Code disappeared around Opus 4.8.
The session history says otherwise.

I queried `~/.claude/ccrecall.db` and `~/.pi/pirecall.db` to compare
when I was actually using each tool:

| Month        | Claude Code sessions | Pi/my-pi sessions |
| ------------ | -------------------: | ----------------: |
| March        |                  455 |                 0 |
| April        |                  186 |               320 |
| May          |                    2 |               631 |
| June         |                    2 |               408 |
| July to 25th |                    2 |               602 |

Pi first appears in my history on 11 April. In the week beginning 13
April, there were 52 Claude Code sessions and 104 Pi sessions. The
following week there were two Claude Code sessions and 86 Pi sessions.

That was the crossover.

The model history makes the Opus part clearer:

- Opus 4.6 appeared in 878 Claude Code sessions, ending on 15 April
- Opus 4.7 appeared in 32 sessions, beginning on 16 April
- Opus 4.8 appeared in only two later sessions, in June and July

So Opus 4.8 did not drive me away. I had already left during the
transition from 4.6 to 4.7, just as `my-pi` became useful enough for
daily work. Those later Opus 4.8 sessions may have confirmed that I
was not going back, but they did not cause the move.

That is a good example of the workflow in this post. I had a confident
recollection. Then I queried the source of truth and changed the
story.

## I wanted to change the harness, not work around it

This is not really a Claude-versus-Codex argument.

My frustration was with adapting my workflow to a product whose shape
I did not control. Claude Code had skills, hooks, plugins and its own
opinions about how sessions should work. I built a lot around it. I
also spent a lot of time working around lifecycle behaviour,
unreliable activation and the boundaries of the extension surface
available to me.

Pi gave me a smaller, more direct base. Its extension API can register
custom tools and commands, intercept lifecycle events and tool calls,
add UI, persist session state and change how context is assembled. Its
SDK exposes the agent runtime programmatically.

That meant repeated corrections could become software:

- session history became `pirecall`
- oversized context became a searchable SQLite sidecar
- secret handling became a redaction layer and `nopeek`
- model drift became guardrails and boundary checks
- multi-agent work became Team Mode
- risky execution became task harnesses
- validation and usage became telemetry I could query afterwards

The important part is not that everyone should use my collection of Pi
packages. It is that the coding-agent harness now fits how I work,
rather than me continually reshaping my work around the harness.

I mostly use Codex models inside it. The model history records 1,785
Pi sessions selecting the OpenAI Codex provider, compared with 40
selecting Anthropic models. But the workflow is not owned by either
provider. I can change the model without throwing away the research,
recall, validation and orchestration around it.

That is the flexibility I wanted.

Claude Code felt like a capable product I was extending from inside
its boundaries. `my-pi` feels like my own development environment. If
a workflow is missing, I can add a tool, hook, command, package or
piece of state that makes it real.

There is still plenty of dog shite code generated inside that
environment. I have not engineered uncertainty out of LLMs. I have
made it harder for uncertainty to pass as evidence.

## How I work with LLMs now

I no longer think the main skill is writing a brilliant prompt.

The useful skill is building a loop that repeatedly asks:

- what do we actually know?
- where did that claim come from?
- what is the source of truth?
- what are we assuming?
- what should remain unchanged?
- how will we prove the result works?
- what evidence would make us change the plan?

The LLM helps answer those questions. It researches, queries,
compares, plans, implements and reviews. It can do an enormous amount
of useful work.

It just does not get to mark its own confident answer as reality.

That is how my workflow changed. I moved from watching Claude for
drift to building a system that grounds the work before, during and
after implementation.

The model is interchangeable. The workflow is the valuable bit.

## References

- [Working with Claude Code: the honest version](/posts/working-with-claude-code-the-honest-version)
- [Building my-pi: my own Claude Code alternative with Pi](/posts/building-my-pi-claude-code-alternative-with-pi)
- [How I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases)
- [Coding agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi)
- [`my-pi`](https://github.com/spences10/my-pi)
