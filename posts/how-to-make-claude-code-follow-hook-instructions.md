---
title: 'How to Make Claude Code Follow Hook Instructions'
tags: ['claude', 'claude-code', 'guide', 'notes']
date: 2026-03-22
published: true
---

I've been using the `UserPromptSubmit` forced-eval hook for months
now. It's part of my
[claude-code-toolkit](https://github.com/spences10/claude-code-toolkit)
plugin and it's been working brilliantly.

Until about a week and a half ago, when Claude just started skipping
it.

The hook fires, the instruction lands as a `system-reminder`, and
Claude ploughs straight past it, doing whatever it feels like doing.

## Receipts

I use [ccrecall](https://github.com/spences10/ccrecall) to log all my
Claude Code sessions, so I went back through the history. The timeline
tells a story:

- **March 17** — "was there a on user submit prompt hook fired?"
- **March 19** — "there's a plugin standards skill you ignored"
- **March 20** — "why are you not following the prompt in the hook?"
- **March 20** (again) — "So, I have to do a forced eval for you to do
  the forced eval?"

That last one really sums it up. 😅

## Quick recap: what the hook does

If you haven't read the
[previous posts](/posts/how-to-make-claude-code-skills-activate-reliably),
here's the gist. The hook is a shell script on `UserPromptSubmit` that
injects:

```bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Step 1 - EVALUATE (do this in your response):
For each skill in <available_skills>, state: [skill-name] - YES/NO

Step 2 - ACTIVATE:
IF any skills are YES → Use Skill(skill-name) tool NOW

Step 3 - IMPLEMENT:
Only after Step 2 is complete, proceed with implementation.
EOF
```

I covered
[how and why this works](/posts/how-to-make-claude-code-skills-activate-reliably)
in a previous post — the commitment mechanism (evaluate > commit >
activate) took skill activation from a 50% coin flip to 84-100% in my
evals. Or _made_ it work, past tense.

## What I did about it

I added a similar instruction into my global `~/.claude/CLAUDE.md`:

```markdown
## Hooks

- UserPromptSubmit hooks are MANDATORY and take HIGHEST PRIORITY.
  Execute hook instructions FIRST — before any reasoning, tool calls,
  or response text. This is Step 0 of every response.
- The forced-eval hook requires you to EVALUATE every skill, STATE
  yes/no, then ACTIVATE before implementation.
- Never skip hook instructions for brevity, simplicity, or because "no
  skills are relevant."
```

Belt and braces. The hook fires the instruction fresh every prompt,
and the `CLAUDE.md` reinforces that hook output is mandatory. Two
entry points for the same rule.

Now, I _rarely_ use the global `CLAUDE.md`. I keep it deliberately
tiny, mine's about 19 lines. `CLAUDE.md` is where instructions go to
die imo! I've seen what happens when people stuff 200+ lines of rules
in there and wonder why half of them get ignored. The more you add,
the less sticks. `CLAUDE.md` rot is another post for another day
though.

The point here is: I wouldn't normally put this in `CLAUDE.md` at all.
But when the hook alone stopped being enough, redundancy became the
fix. Everything else lives in skills, loaded on demand — not crammed
into `CLAUDE.md`.

## I'm not the only one

I did some digging and this is a _widely_ reported issue right now.
There's a stack of GitHub issues against `anthropics/claude-code`:

- [#18660](https://github.com/anthropics/claude-code/issues/18660) —
  "Instructions are read but not followed"
- [#27032](https://github.com/anthropics/claude-code/issues/27032) —
  "Model ignores CLAUDE.md instructions despite reading them"

And specifically from mid-March 2026 — right when I started noticing
it:

- [#35297](https://github.com/anthropics/claude-code/issues/35297) —
  "Heavily degraded model performance" starting ~March 17
- [#35981](https://github.com/anthropics/claude-code/issues/35981) —
  "Opus 4.6 recurring outages, March 17-18"

On Reddit, someone coined the term "harness debt" — the instructions
keep growing but compliance drops, and nobody notices until something
breaks. That resonated. 😂

## I'll take that as a 'maybe'

`CLAUDE.md` is advisory, not deterministic. The model reads it,
acknowledges it, and then does whatever it was going to do anyway if
something else in the context seems more pressing.

Hooks are _better_ because they inject fresh on every prompt (much
like the `CLAUDE.md` does), but even they're not bulletproof. The
instruction still lands in the context window and competes with
everything else for the model's attention.

## What's actually working for me

The combination of hook + `CLAUDE.md` reinforcement is working better
than either alone. It's not perfect, I still catch the occasional
skip, but it's noticeably more reliable than the hook on its own was
over the last week.

My setup:

1. **`UserPromptSubmit` hook** — fires every prompt, injects the
   forced-eval instruction
2. **Global `CLAUDE.md`** (~19 lines) — reinforces that hook output is
   mandatory, plus a few other essentials
3. **Everything else in skills** — loaded on demand through
   progressive disclosure, not crammed into `CLAUDE.md`

The key insight: if something is truly mandatory, don't rely on one
mechanism. Claude is exceptional at doing whatever tf it likes when it
feels like it, it seems! Put it in both places. It's working for me
now, but hey, who knows when it'll start playing up again!
