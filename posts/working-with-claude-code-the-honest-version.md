---
date: 2025-11-06
title: Working with Claude Code! The Honest Version
tags: ['claude', 'productivity', 'notes']
is_private: false
---

So, I'm a team lead working on a large monorepo for a private client.
I've been on this project for two years, and I've worked with AI
coding assistants since day one - through every iteration, model
update, and paradigm shift over that time.

When I say I use AI for my work, I don't mean occasionally or for
boilerplate. I mean for literally every task. Every feature, every bug
fix, every refactor, every review. In October alone, that's 28 PRs all
AI assisted.

This isn't a hot take from someone who tried Claude Code for a
weekend. This is what I've learned from deeply integrating AI into
professional development work on a production codebase, day in and day
out, for two years.

So, I just spent the last 20-30 minutes trying to get Claude aligned
on writing this post about working with Claude Code (meta, right?). In
that time, it demonstrated literally every problem I wanted to write
about. 😅

## Goal oriented to a fault

I said "shall we write about how I work with you?" and Claude
immediately threw up the `AskUserQuestion` tool - a formal dialogue
box forcing me to pick from predefined options about post angle and
format.

Mate, I just wanted to chat about it. I prefer to think things through
first, not be forced down a predetermined path. But that's Claude's
nature - always goal-oriented, always reaching for "Ready to code" or
these bloody dialogue boxes when a lot of the time I want to talk
something through before I let it loose.

Here's what that looked like:

```
Me: "shall we write about how I work with you?"

Claude: "I'd love to help! Let me ask you a few questions to
structure this properly:"

[AskUserQuestion dialogue box appears]

Question 1: What angle do you want to take?
□ Technical deep-dive
□ Productivity tips
□ Critical analysis
□ Other

Question 2: What format works best?
□ Tutorial style
□ Personal reflection
□ How-to guide
□ Other
```

I just wanted to get aligned, not fill out a form, I'm not at the
dentist!

## Spin the wheel!

Every time I start a conversation with Claude, it's a lottery on what
I'm going to get out of it. 🎰 See
[Claude Code Skills Don't Auto-Activate](/posts/claude-code-skills-dont-auto-activate)
for a taste on what I go through.

Sometimes it completely misses the point. Sometimes it pretends to
understand what I'm talking about, only to be caught short when I ask
for clarification. I've learned that Claude will absolutely try to
bullshit its way through situations where it doesn't know the answer
but wont't admit it.

So now I have to verify everything before letting it touch any code.
It's like having a really enthusiastic junior developer who's
confident about everything but actually knows nothing about the
codebase or business goals and will just write whatever it feel like
writing.

See, "skill issue", "you're prompting it wrong", "ha! Noob!" -
whatever! You can spend 45 minutes crafting the perfect prompt and
Claude will still go off the rails.

Got a large codebase? `docs/` is where it all goes! When Claude feels
like it should maybe think about what it's doing it may take a look in
there. If you explicitly tell it to look in there it'll take a look,
skim it, and then get back to completing it's task and have the
context from the documentation as a "suggestion".

See. it might sound like I'm really bitter about AI, but, I've never
been so productive.

## The productivity paradox

That
[side project I started 18 months ago and never went back to](https://devhub.party)?
It's now a polished app out there in the world. I've done that several
times over now. I've built
[MCP tools](https://github.com/spences10?tab=repositories&q=mcp-&type=source&language=&sort=),
[CLIs](https://github.com/spences10?tab=repositories&q=cli&type=source&language=&sort=)
(Claude bloody loves a CLI), and learned a great deal in the process.

But here's what nobody talks about: working with AI has fundamentally
changed the nature of my work, and not entirely for the better.

## I'm a project/product manager now

I do consider myself a product engineer, but, I spend less time deep
in code and more time catching drift. Working with AI now is basically
spotting when things are drifting off course and correcting early.

Claude will confidently go in completely the wrong direction, and I've
had to develop this whole new skill set of:

- Spotting the drift early
- Knowing when it's bullshitting
- Understanding its conversation patterns and quirks
- Correcting course before it writes terrible code

I'm a product manager for a stochastic parrot. I got into development
because I enjoy the craft, not because I wanted to babysit an
autocomplete engine.

## Guardrails that actually help

So what do I actually do to manage this? Here's what works:

**Verification checkpoints** - Before Claude touches code, I verify it
understands the task (alignment). I ask it to explain back what it's
about to do. If the explanation is vague or wrong, I stop it there and
call out it's bullshittery.

**Know when to bail** - Some tasks are just faster to do manually.
Renaming a variable across 50 files? I'm using IDE find/replace, not
waiting for Claude to plod through each file. Simple refactors that
are three keyboard shortcuts? I'm not explaining that to AI.

**Context limits** - I don't let conversations run too long. After 5-6
to and fro exchanges, Claude starts hallucinating previous context. I
start fresh rather than fighting that drift.

These aren't revolutionary tactics, but they're the difference between
productive and frustrating sessions.

## The stochastic parrot reality

I know what Claude is - it's pattern matching and autocompleting based
on training data. It doesn't actually understand my codebase or my
intent. It's nothing more than a stochastic parrot that can string
together seemingly thoughtful responses.

I get it. And I've learned to work with it anyway. Don't get me wrong
I have been positively impressed with the responses/plans it comes up
with (on occasion).

The trick is knowing when it's drifting and correcting early. Spotting
when it's bullshitting before it writes code. Verifying everything
because you can't trust it to actually understand.

## The fixation problem

Claude also has this thing where it fixates on certain details that
aren't relevant to what I'm asking about. Due to its goal-oriented
nature, it just won't let go of these things and keeps mentioning
them. I will breeze past these fixations and try course correct
without mentioning it, because
"[Don't think about pink elephants](https://eval.16x.engineer/blog/the-pink-elephant-negative-instructions-llms-effectiveness-analysis)"!!

## The trade-off

More projects shipped, but less of the actual craft I enjoy. That's
the honest trade-off.

It's not the polished "look how productive I am!" story you see in
most AI productivity posts. Those are either:

- "AI is magic and understands everything!" (bollocks)
- "AI is useless and will never work" (also not true)

The reality is messier. I set up the infrastructure (agents, skills,
hooks), and it still ignores them. I have to verify everything. I
spend time catching drift instead of writing code. It can take a while
just to get aligned on what I'm actually trying to do.

But I also ship more projects than I ever would have otherwise.

## What I've learned

Working effectively with Claude means:

- Accepting the lottery nature ("spin the wheel!")
- Calling out bullshit early
- Developing a sense for when it's drifting
- Being okay with being more project/product manager than developer
- Verifying everything before letting it touch code
- Having patience for the alignment process

It's a tool. A frustrating, sometimes brilliant, often wrong,
surprisingly productive tool.

## Conclusion

After two years of using AI for every task, every PR, every feature on
a production monorepo - that's my honest take. It's a tool. I use it
like I use Git, like I use my IDE, like I use any other tool in my
stack. Some days it's brilliant, some days it's absolute dog shite,
but it ships work.

If you're doing similar work - leading teams, working on large
codebases, integrating AI into your daily workflow - I'd be interested
to hear how you're managing the drift and the trade-offs.
