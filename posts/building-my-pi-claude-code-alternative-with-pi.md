---
date: 2026-04-26
title: 'Building my-pi: my own Claude Code alternative with Pi'
tags: ['pi', 'my-pi', 'claude-code', 'developer-experience']
published: true
---

<!-- cspell:ignore pirecall ccrecall nopeek Codex dogfooding badlogic opencode handoff mariozechner -->

Right, so, I have written a few posts now about bits of `my-pi`:
[adding LSP](/posts/add-lsp-to-my-pi),
[adding telemetry](/posts/add-telemetry-to-my-pi), and
[hardening redaction with evals](/posts/hardening-redaction-in-my-pi).

What I have not actually done is write the obvious post: what is
`my-pi`, why did I make it, and why have I suddenly spent a slightly
silly amount of time using it?

The short version: `my-pi` is my own opinionated AI coding agent
harness, built on top of
[pi-coding-agent](https://github.com/badlogic/pi-mono). It started as
"I wonder if I can make Pi feel a bit more like how I want to work"
and has very quickly become "oh, this is just my working environment
now".

That has been a bit of a surprise.

## Claude Code became the default

For a while, the industry more or less settled on Claude Code as the
terminal coding agent. Not because everyone had performed some grand
scientific comparison, but because it was good enough, early enough,
and useful enough that it became the thing people reached for.

I absolutely did too.

I have used Claude Code for basically everything: client work, side
projects, blog posts, plugin work, MCP tools, skill experiments,
redaction tooling, evals, the lot. I have written plenty about it,
including
[the honest version of working with Claude Code](/posts/working-with-claude-code-the-honest-version),
which is still pretty much where my head is at: brilliant, useful,
frustrating, sometimes dog shite, somehow still productive.

The problem is that over time the surrounding product started to feel
less aligned with how I wanted to work. Some of that is model
behaviour, some of it is harness behaviour, and some of it is just the
vibe of using a tool where the defaults are not yours and you cannot
really change the bits that annoy you.

That is where Pi got interesting.

## Pi gave me the primitives

Pi is not "Claude Code but with a different coat of paint". It is a
coding-agent harness with the important primitives exposed: tools,
sessions, extensions, themes, providers, prompts, MCP, and enough of a
surface area that you can actually shape the thing.

That distinction matters.

A model by itself is just the CPU. The harness is the operating
system: tools, memory, files, permissions, prompts, feedback loops,
guardrails, logs, and taste. Change the harness and the same broad
category of work can feel completely different.

Pi gave me a base system I could build on rather than a product I had
to work around.

So I made `my-pi`.

## What my-pi actually is

`my-pi` is not me saying "I have replaced Pi". It is me taking Pi and
turning it into the coding agent harness I personally want to use.

It keeps the core Pi runtime and layers on my own defaults and
extensions:

- MCP support for external tools and data
- LSP tools for diagnostics, hover, definitions, references, and
  symbols
- skills imported from my existing agent setup
- prompt presets for switching working style
- `pirecall` reminders and background sync for session continuity
- `nopeek` reminders for secret-safe environment loading
- output redaction before tool results reach the model
- local SQLite telemetry for runs, turns, tools, provider requests,
  and evals
- destructive action confirmation for risky operations
- Omnisearch and SQLite-tool reminders so the agent reaches for the
  right tool instead of guessing
- headless JSON mode so other scripts and agents can use it

Some of those are built into `my-pi`. Some have now been split into
installable Pi packages, like `@spences10/pi-lsp`,
`@spences10/pi-telemetry`, `@spences10/pi-redact`,
`@spences10/pi-mcp`, `@spences10/pi-recall`, and the newer reminder
packages for Omnisearch and SQLite tools.

That split was one of the little epiphanies from using it in anger:
`my-pi` is the full opinionated harness, but useful pieces of the
harness can be packages other Pi users install into their own setup.
You do not install `my-pi` into Pi. That makes no sense. `my-pi` is
_my_ Pi. The reusable bits are the extensions.

## Why it feels different

The thing I keep coming back to is that the friction is fixable.

If startup feels too quiet, I can change it. If an extension is useful
in the TUI but nonsense in headless mode, I can disable it there. If a
handoff feature becomes redundant because Pi's own session branching
is better, I can delete the fragile version. If destructive commands
make me nervous, I can add confirmation. If I keep asking agents to
use `mcp-sqlite-tools`, I can turn that into a reminder.

That is the bit I had been missing.

With a closed harness, you learn the quirks and route around them.
With your own harness, the quirks become backlog items.

That changes the relationship completely.

## The session data is the interesting bit

This is not just a vibes post either. `pirecall` gives me the trail.

At the time of writing, my Pi recall database has:

- 230 saved Pi sessions
- 23,262 messages
- 12,075 tool calls
- 420 LSP tool calls
- 26 different project paths

For `/home/scott/repos/my-pi` alone, since 2026-04-11:

- 138 sessions
- 8,308 messages
- 4,254 tool calls
- 186 LSP calls

That is not "I tried it for an afternoon and liked the colours". That
is a lot of real iteration in the harness, using the harness, while
changing the harness.

The funnier metric is that my `pirecall` sessions contain noticeably
less swearing than my `ccrecall` history. That is not rigorous product
analytics, obviously, but it does line up with how it feels. I am
spending less time shouting at the tool and more time shaping it.

## LSP stopped being a checkbox

One of the biggest practical differences is LSP.

I had already
[enabled LSP in Claude Code](/posts/enable-lsp-in-claude-code), but it
never really felt like the harness naturally wanted to use it. It was
available, but it did not become part of the normal loop in the way I
wanted.

In `my-pi`, LSP is just one of the senses the agent has. Diagnostics,
definitions, references, symbols, hover info: all of that is exposed
as normal tools. When I am working in TypeScript or Svelte, that means
the agent can inspect the codebase with language-server help instead
of relying on grep and vibes.

That matters because code navigation should not live in the model's
memory. It should live in the harness.

## Skills feel less ceremonial

This has been another pleasant surprise.

I spent a daft amount of time making Claude Code skills activate more
reliably. I wrote posts about skills not being recognised, skills not
auto-activating, hook-based activation, plugin marketplaces, and
sandboxed evals. The annoying finding was that the skill text was not
usually the problem. Once the skill activated, selection was often
fine. The problem was getting the model to notice that a skill should
activate in the first place.

Inside `my-pi`, with the same broad skill corpus available, I have not
had to fight that nearly as much. Relevant skills are simply more
likely to show up in the working flow without me doing a ritual first.

That is harness behaviour.

Same skills. Less prompting. Better affordance.

## Recall changed continuity

The other thing I underestimated was how much I wanted session memory
to be a first-class workflow tool.

I do not mean "the model remembers everything forever", because that
way madness lies. I mean: the harness keeps searchable local history,
and the agent is reminded to use it when I ask about prior work.

That is what `pirecall` gives me. I can say "check what we did last
time" or "look for the session where I made everything into a
package", and the agent can search actual session history instead of
confidently inventing a memory.

That has been especially useful while working on `my-pi`, because the
project has been moving quickly. LSP, telemetry, redaction, packages,
destructive guards, prompt presets, extension toggles, recall sync,
Omnisearch reminders, SQLite reminders. If I had to reconstruct all of
that from Git alone, I would lose half the story.

The recall database gives me the messy working trail, not just the
commit history.

## Telemetry made evals less hand-wavy

Telemetry was the moment `my-pi` stopped feeling like a nice terminal
customisation and started feeling like a harness I could measure.

The local SQLite telemetry records runs, turns, tool calls, provider
requests, timings, status, eval metadata, and success/failure shape.
It deliberately does not try to become another transcript store. That
job belongs to sessions and `pirecall`. Telemetry is there to answer
operational questions:

- how many turns did this take?
- which tools got called?
- did the provider request fail?
- did the harness die, or did it complete and produce the wrong thing?
- which eval case did this run belong to?

That last distinction matters a lot. "The harness exploded" and "the
harness completed safely but gave a bad answer" are different bugs.
Without telemetry, they both collapse into "that run was bad".

## Redaction made it usable on real repos

If I am going to point a terminal agent at real projects, I need to be
less casual about secrets.

`nopeek` handles secret-safe environment loading. `my-pi` adds output
redaction so tool results get scrubbed before the model sees them and
before they land in session history. Then I built a synthetic eval
harness full of fake secrets and used telemetry plus `pirecall` scans
to prove the redaction layer was doing something useful.

The first run found misses. Good. That was the point.

The later run came back clean across raw sessions and recall history.
That is still not a mathematical proof, but it is much better than "I
wrote a regex, probably fine".

Again, this is the pattern: add the harness feature, measure it, then
tighten it when reality disagrees with the first version.

## The Claude Code comparison I keep thinking about

While building the talk around this, I compared the same planning
prompt in two harnesses: `my-pi` with Codex, and Claude Code with
Opus.

Same repo. Same operator. Same prompt. The task was to analyse a
production/staging situation and produce a plan, without making
changes.

The `my-pi` run researched first. It made 60 tool calls before the
first real prose answer and then produced one grounded plan.

The Claude Code run produced earlier planning artefacts, but those
contained wrong assumptions about production infrastructure. It later
corrected itself after more research and pushback.

That is not a universal benchmark. It is one comparison, from my own
work. But it is exactly the kind of difference that matters in daily
use. The harness changes when the system speaks, how much evidence it
gathers before speaking, and how much trust the first answer earns.

This is why I keep saying the harness matters as much as the model.

## Why not just use Pi directly?

You can, and you probably should start there.

Pi already gives you the strong foundation: terminal UI, sessions,
tools, extensions, themes, providers, and the core coding-agent loop.
If you want the base harness, use Pi.

`my-pi` is what happens when I take that foundation and keep sanding
the rough edges that affect my day-to-day work. It has my assumptions
baked in. It expects my style of local tooling. It nudges the model
toward my preferred tools. It makes decisions I would not want to
force on everyone.

That is the whole point.

A personal harness should be personal.

## What changed for me

The weirdest thing is that I did not set out to switch habits. I did
not sit down and decide "today I will stop using Claude Code".

I just kept reaching for `my-pi` because it felt better.

Then the stats caught up with the behaviour. More sessions. More tool
calls. More LSP usage. More Codex usage. More package churn. Less
swearing. The talk deck I am writing about `my-pi` is itself being
written with `my-pi`, while `my-pi` changes underneath it.

That is a very convincing kind of dogfooding.

The biggest shift is not that I found a perfect tool. I have not.
`my-pi` is moving fast, bits have been added and removed, and some of
it is absolutely still "Scott shaped" rather than generally polished.

The shift is that the tool is now mine enough that when something
annoys me, I can fix the harness instead of adapting around it.

## Should you use my-pi?

Maybe.

If you want a polished, universal product with all the edges sanded
down, probably not yet. If you want to see what an opinionated Pi
harness looks like, or you already use Pi and want installable bits
like LSP, telemetry, redaction, recall, MCP, or destructive-action
confirmation, then yeah, have a look.

```bash
pnpx my-pi@latest
```

Or start from Pi itself and build your own shape around it:

```bash
pnpx @mariozechner/pi-coding-agent@latest
```

That is probably the healthier lesson anyway.

Do not wait for one vendor to decide what your coding agent should
feel like. The harness is where your workflow lives. If the defaults
fit you, brilliant. If they do not, change the harness.

That is what `my-pi` is for me.

There are many harnesses like it, but this one is mine.

## References

- [my-pi on GitHub](https://github.com/spences10/my-pi)
- [pi-coding-agent](https://github.com/badlogic/pi-mono)
- [pi.dev](https://pi.dev)
- [Add LSP to my-pi](/posts/add-lsp-to-my-pi)
- [Add telemetry to my-pi](/posts/add-telemetry-to-my-pi)
- [Hardening redaction in my-pi with evals and telemetry](/posts/hardening-redaction-in-my-pi)
- [Working with Claude Code: the honest version](/posts/working-with-claude-code-the-honest-version)
