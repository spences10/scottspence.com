---
date: 2026-08-26
title: 'What my prompts say about how I work with AI'
tags:
  ['ai', 'llms', 'coding-agents', 'prompting', 'developer-experience']
published: false
---

<!-- cspell:ignore LLMs pirecall ccrecall nopeek codebases my-pi backpressure handoff handoffs overengineered Sol -->

September 2023 is when I started using AI as part of my job. I had
used it before then, but that was when I became responsible for
getting real results with it. Features had to work. Bugs had to be
fixed. Pull requests had to survive review. I was using AI in a large
private client codebase where a plausible answer was not the same as a
correct one.

I have been honing how I work with it ever since, much like everyone
else trying to keep up while the tools and models change underneath
us.

I have not recorded every session since 2023. What I do have is a
detailed record from recent months, plus the posts, CLIs and projects
I made as my approach changed. I now have the tools to look back
across all of it rather than rely on what I remember doing.

So I asked an agent to find my greatest blind spots when prompting and
working with LLMs, then report on how my prompting had evolved from
the start of my recorded history to now.

The first answer gave me a useful three-stage summary:

1. **Reactive supervision:** catch drift, challenge false claims and
   restart.
2. **Explicit process control:** research first, use official sources,
   confirm understanding and validate.
3. **Workflow engineering:** recall, skills, guardrails, scoped
   agents, harnesses, evidence and review.

That is the story I recognise. I went from supervising the
conversation to shaping the environment around it.

The most uncomfortable finding was this:

> You have solved execution reliability better than task-definition
> reliability.

I can stop an agent writing a known bad Svelte pattern. I can restrict
it to five files, require validation and send the result through an
independent review.

None of that proves I asked it to solve the right problem.

## Why I can look back now

The introspective part of this post only became possible recently.

Claude Code stores its sessions as JSONL files. I created
[`ccrecall`](https://github.com/spences10/ccrecall) in December 2025
to sync those transcripts into SQLite. The database includes sessions
from November, giving me searchable prompts, tool calls and model use
from that point onwards.

When I moved most of my daily work to Pi, I created
[`pirecall`](https://github.com/spences10/pirecall) in April 2026. It
does the same job for Pi sessions and can recover the useful context
around a result without pouring a whole transcript back into the
model.

For this analysis I used three databases:

- 2,754 Claude Code sessions from 13 November 2025 to 23 February 2026
- 1,259 sessions in my current Claude Code database from 15 January to
  18 August 2026
- 2,165 Pi sessions from 11 April to 26 August 2026

Claude's stored user rows can also include injected tool and skill
content, which makes its prompt-length statistics approximate. The
record is evidence for a recent retrospective, not a complete history.

It is still enough to show a clear change.

## November 2025: I was the alignment system

In November I wrote
[Working with Claude Code: the honest version](/posts/working-with-claude-code-the-honest-version).
At the time, most of my process involved spotting drift, calling out
bullshit and checking that Claude understood the task before it
touched code.

I described myself as a product manager for a stochastic parrot.

The first recorded work already contains the shape of the problem. I
gave Claude the desired result and my implementation guess together:

> This will probably mean the shared styling config will need to go?

That is normal when you know a codebase well. It also gives an
agreeable model a solution before it has established the problem.

The corrections arrived quickly:

> You didn't research though did you? Didn't check official
> documentation.

> You changed the implementation to fit the test?

> You didn't do a like-for-like replacement.

Important constraints were still in my head. They became visible only
after Claude violated them.

The model was useful. I was shipping more work than I could have
without it. The cost was that I had to remain inside every interaction
as the source of truth, drift detector and emergency brake.

The interrupt data supports that memory. In November 2025, 199 of my
2,549 recorded prompts stopped Claude mid-action. In January it was
173 interrupts in 1,318 prompts, roughly one in eight.

The Pi record has 12 interrupt-shaped rows in 18,731 prompts. The
tools record interrupts differently, so that is not a clean benchmark.
The direction still matches the wider history. I spend far less time
physically hitting the brakes now.

## Late November to March: distrust became a method

My response to drift was not to write one perfect mega-prompt. I
became more deliberate about testing the model's understanding.

I required official sources. I asked it to compare contradictory
claims. I stopped implementation until it could state what it was
about to do. I wanted evidence rather than a confident summary.

This is where the `fifteen words or less` prompts start appearing. The
later Pi history alone contains 119 of them. I also use yes-or-no
questions constantly.

That is deliberate. I got tired of waffle and learnt that the quickest
way through it was to constrain the output.

A model can hide weak understanding inside a polished five-part plan.
It can restate all the context, thank me for the clarification and
still avoid the question. It has much less room to hide when I ask:

> Explain what you were about to do in fifteen words or less.

The frustration in those prompts is also catharsis for me. Calling
bullshit marks a hard stop. It prevents the conversation smoothing
over a mistake and pretending everything is still going to plan.

A binary constraint can force certainty when the truthful answer is
conditional or unknown. The version I use now leaves an escape hatch:

> Answer yes, no or unknown. Add one evidence line.

The same period exposed another boundary:

> Didn't mean for you to set stuff up, was just exploring.

I often want to think conversationally before making changes. Coding
agents keep trying to turn discussion into implementation, so
`investigate only`, `no changes` and `implementation guidance only`
became explicit modes.

Repeated corrections also started becoming reusable procedure. Commit
instructions became a workflow: inspect the affected apps, run the
right checks, format, collect coverage, commit locally and do not push
without permission. Research instructions became skills. Acceptance
criteria became loops with backpressure commands.

The posts and projects follow the prompts:

- November: I started the Svelte skills repository because I was tired
  of repeating current Svelte and SvelteKit patterns.
- December: `ccrecall` made earlier conversations searchable.
- January: reusable Claude Code skills moved into plugin marketplaces,
  while I experimented with swarm workflows.
- February: sandboxed evals measured whether skills actually
  activated.
- March: language server and hook instructions started checking code
  and blocking behaviour mechanically.
- 3 April: [`nopeek`](https://github.com/spences10/nopeek) moved
  secret handling out of prompts and into a CLI.

By late March my correction had become a more useful question:

> What grounding in reality does this have?

That asks how the model knows, not only whether its answer sounds
right. A project instruction file can rot. The repository, runtime
behaviour, official documentation, production data and earlier
decisions have to be compared.

The LLM's summary is not the source of truth because it sounds
confident.

## April onwards: I changed the environment

I started [`my-pi`](https://github.com/spences10/my-pi) on 11
April 2026.

One of my first questions was:

> So, how do we ground what you do in reality?

The next day I created `pirecall` and connected session history to the
new workflow. During the following weeks I added language server
tools, SQLite telemetry, stronger redaction and Team Mode. On 1 May I
added a SQLite context sidecar so large tool results could remain
searchable without filling the conversation.

Each feature maps to a repeated problem:

- session history became `ccrecall` and `pirecall`
- code questions gained language server evidence
- secret handling became `nopeek` and redaction
- large tool results became a searchable context sidecar
- mutation ownership became scoped handoffs and Team Mode
- validation became telemetry and evidence records

Then there was Svelte.

I kept telling agents not to reach for <code>&dollar;effect</code> as
the answer to every reactive problem. Putting that preference in
project instructions did not stop it. On 8 May I added Svelte
guardrails to my-pi. They inspect writes and block that pattern before
it lands in a `.svelte` file, then point the model towards derived
state, event handlers, actions or an explicit lifecycle API instead.

On 23 May I added boundary checks for architectural rules. On 28 June
I added the harness runtime so risky tasks could carry editable scope,
forbidden commands, validation and review outside the conversation.

The repeated instructions had become deterministic code.

The platform crossover was abrupt. April had about 187 Claude Code
sessions and 319 Pi sessions. May had two Claude Code sessions and 631
Pi sessions.

That was not only a model preference. Claude Code made me fit my
workflow around the product. Pi let me change the product around my
workflow.

## How I prompt now

My Pi-era monthly median prompt length sits between 63 and 89
characters. A precise comparison with early Claude prompts is not
possible because its stored user rows contain injected content. The
useful finding is not an exact percentage reduction. It is why short
prompts now work.

The context became addressable.

A new session can point at an earlier session, ask `pirecall` for the
relevant history, inspect the current code and use the available tools
to orient itself. I do not need to paste the whole story into every
opening prompt.

When a risky task needs a detailed contract, I still write one. Long
prompts did not disappear. They became task briefs rather than my
normal side of a conversation.

I am still conversational. `GPT-5.6 Sol` is my main workhorse now and
Claude is on the bench when I need it. My typos, `ok,` openers,
questions and short replies do not change with the model. The style is
mine.

The short replies make sense only with their surrounding turns. The Pi
history contains 275 prompts that are exactly `continue`, 35 that are
only `sure` and 10 that are only `do that`.

`Do that` normally approves a recommendation after an investigation.
`Sure` accepts a specific next step the agent offered. `Continue`
resumes agreed work after a checkpoint or tool result, or wakes a
response that stopped or trailed off.

They are approval gates inside a task we have already discussed, not
attempts to define a task from scratch.

I have never compacted a Pi session. The history contains no exact
`compact` or `/compact` command from me. My normal pattern is one
task, then a fresh session for the next one. If it needs earlier
context, session recall and the available tools help it orient itself
without carrying the whole conversation forward.

Where I was, the conversation itself carried the context and I watched
for drift. Where I am now, the conversation can stay short because the
environment can recover context, check claims and enforce known rules.

## Where I still get it wrong

The current weak point sits before execution.

A harness can restrict edits to five files. It cannot tell me whether
those are the right five files. A test can pass against the wrong
expected behaviour. Two agents can review the same anchored premise
and agree with each other.

Research tools can retrieve excellent sources. They cannot rescue a
question that asks the wrong thing.

Some of my opening prompts still leave the outcome implicit:

> Unit tests on the GitHub repo are failing. Can you investigate and
> fix?

> Work out why the Renovate PRs have failing CI.

These often work because the environment supplies sensible defaults.
They still do not state which observable result matters, what must
stay untouched or what evidence is enough.

I also ask for opposition after stating my preferred answer:

> To my mind...

> Fair presumption?

> Push back if I'm wrong.

That is anchored pushback. A better sequence is to ask for an
independent assessment first, then state my view and compare it with
the result.

The control system can become the work too. My history contains
repeated versions of:

> Why have you added all this ceremony?

> The team overengineered it.

A 45-minute governed agent run is not a win when the task was one
obvious conflict in one file. Small, bounded work needs direct
execution. Uncertain work needs research and a short contract. Broad
or risky mutation earns a harness. Genuinely parallel work earns team
coordination.

The next improvement is not another large prompt template. For a small
task, one clear outcome sentence can be enough:

> Fix only the conflict in this file. Preserve all unrelated changes.
> Show the final diff and run the focused check.

For larger work, I want the outcome, verified facts, hypotheses,
scope, evidence and stopping point separated clearly. The mechanism
comes after the result I need.

## The making of this post proved the point

The sessions used to make this post became the newest evidence in the
databases while I was writing it.

The first analysis found the story. I then remembered another Claude
database and asked the agent to store the additional data. It produced
a thorough statistics dashboard and flattened the part I cared about.

I corrected it:

> You seem to have gone into stats rather than telling the story.

I then asked Claude for an independent version because parts of the
first draft were inconsistent. It found some excellent new evidence,
including the interrupt history and the fact that my conversational
style survives model changes. Its post still did not tell the whole
story cleanly.

That is not a failure of the exercise. It is the exercise.

The tools recovered the history. The databases challenged my memory.
Different models found different patterns. I still had to decide what
the post was about, reject the bits that did not fit the evidence and
join the useful parts into one account.

That is where my work with AI has moved. I spend less time supervising
every sentence and more time defining the outcome, choosing the source
of truth and deciding how much machinery the task deserves.

A reliable workflow can prove that an agent followed the contract. It
cannot prove that I gave it the right contract.

## Related reading

- [Working with Claude Code: the honest version](/posts/working-with-claude-code-the-honest-version)
- [How I work with LLMs](/posts/how-i-work-with-llms)
- [How I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases)
- [Building my-pi](/posts/building-my-pi-claude-code-alternative-with-pi)
- [Coding agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi)
