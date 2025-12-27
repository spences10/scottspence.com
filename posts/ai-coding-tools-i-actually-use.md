---
date: 2025-06-24
title: The AI Coding Tools I Actually Use (And the Ones I Don't)
tags: ['tools', 'claude', 'cursor', 'cline', 'notes']
is_private: false
---

<script>
	import { Bluesky } from 'sveltekit-embed'
</script>

<!-- cspell:ignore Sveltest cutoff nlvjelw pddq qoglleko mgmujs nlvjelw pddq qoglleko lrxynygvo BYOK BYOK nlvjelw pddq qoglleko klogc -->

Cool! So, coding tools! We all use them right? I've been through a few
of them! As a team lead working on a large SvelteKit monorepo, I'm
constantly evaluating tools that could help the team move faster and
write better code. Here's my honest take on what actually works and
what's just hype.

So, if you read my posts you'll know I post about using these tools,
like, all the most popular posts on this site are now dominated by the
posts I have made on coding tools! 😅

The thing is, these tools will promise a lot from the hype you see on
the socials etc, but actually using them in a real production
environment is a whole different story.

## The Svelte 5 reality

Here's the thing that really matters for my work: Claude 4 is _really_
the only LLM that 'gets' Svelte 5 code and can write it effectively.
The training data cutoff issue is real - most LLMs are still stuck on
Svelte 4 patterns. Claude 4 will still default to Svelte 4 sometimes
if you're deep into a prompt and you're not specifically specifying
"Svelte 5" in your prompts.

When Windsurf lost Claude 4 access, it essentially became useless to
me. Although Windsurf has a much better MCP integration than Cursor,
now with Claude 4 there's less reason for me to use MCP tools (I
essentially used MCP tools to validate the Svelte 5 code being
written).

**Windsurf got cut off officially:**

- Anthropic
  [officially cut off Windsurf's direct access to Claude models](https://techcrunch.com/2025/06/03/windsurf-says-anthropic-is-limiting-its-direct-access-to-claude-ai-models/)
  in June 2025
- Windsurf CEO stated:
  ["Unfortunately, Anthropic did not provide our users direct access to Claude Sonnet 4"](https://analyticsindiamag.com/ai-news-updates/openai-rival-anthropic-blocks-windsurf-from-using-claude-4-models/)

I was happily using Claude 4 in Cursor for a couple of weeks after
Anthropic released it. I have seen this scenario play out at least
twice now, where I believe the code editor teams intercept the system
prompt and add in their own crap!

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3lrq4mgmujs2r"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

Cursor's decline was the last nail in the coffin for me. I was happy
with working with Claude 4 in Cursor, but when the Cursor team flicked
the "you now dumb af" switch I couldn't use it anymore.

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3lrxynygvo22x"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

I'd seen stuff posted elsewhere in the past about this happening so I
asked around.

## My suspicions validated

I wasn't sure if it was just me, I asked the rest of the team and they
felt the same, then I had a poke around on Reddit and the Cursor
forums and found that it wasn't just me, Cursor had really gone
downhill.

**Cursor's Claude 4 degradation is real:**

- Users reporting Claude 4
  ["extremely slow since yesterday" with 0.3 tokens per second](https://forum.cursor.com/t/claude-4-sonnet-thinking-is-extremely-slow-since-yesterday/100131)
  (essentially unusable)
- ["Context problems got noticeably worse after the 0.45.4 update"](https://www.vincentschmalbach.com/cursor-ide-problems-mount-with-each-update/)
  with AI "losing context immediately"
- Multiple reports of
  [Claude 4 working great then suddenly becoming "nearly unusable for productive work"](https://dredyson.com/my-key-insights-on-claude-4-sonnets-extreme-slowdown-in-cursor-ide/)

**System prompt interference is documented:**

- Users directly asking Cursor:
  ["Did you guys change the backend system prompt?"](https://forum.cursor.com/t/did-you-guys-change-the-backend-system-prompt/12571)
  with reports of degraded experience
- Cursor makes
  ["frequent updates to system prompts (approximately monthly)"](https://forum.cursor.com/t/give-users-rights-to-edit-select-stable-system-prompt/94419)
  that disrupt user workflows
- Evidence that
  ["System prompt makes Claude go off script and ignore rules"](https://forum.cursor.com/t/system-prompt-makes-claude-go-off-script-and-ignore-rules/67978)
- Technical analysis shows
  ["If all models are failing in the same way, it's likely something Cursor is injecting ahead of each prompt"](https://forum.cursor.com/t/cursor-is-basically-not-usuable-constant-crashes-severe-lag-when-trying-to-type-any-way-to-fix-this/58922)

The perfect example? I asked Cursor to write tests for a file and it
randomly wrote tests that didn't even correspond to the file. When I
corrected the prompt, the response was "yes I should read the file to
know what I'm testing." Unacceptable!

**The Cursor team's response? Radio silence.** Despite
[extensive user documentation](https://forum.cursor.com/t/give-users-rights-to-edit-select-stable-system-prompt/94419)
of these issues, they avoid addressing the systemic problems. When
pressed with concrete evidence (users comparing Cursor vs web Claude
performance), they'll
[credit back requests](https://forum.cursor.com/t/did-you-guys-change-the-backend-system-prompt/12571)
but won't acknowledge the underlying issues.

## The wrapper problem

Here's my theory: tools like Cursor and Windsurf are essentially
wrappers around the actual LLMs. The teams behind these wrappers want
to keep you engaged with _their_ tool, so they subtly limit the
effectiveness to encourage more interaction, more iterations, more
usage.

Think about it - if Claude worked perfectly in Cursor on the first try
every time, you'd spend less time in the tool, generate fewer API
calls, and potentially use fewer credits. But if it's "almost right"
and requires tweaking, you stay engaged longer.

This is why I'm gravitating toward tools that go straight to the API:

- **Claude Code**: Direct Anthropic integration, no wrapper
  interference
- **Cline**: BYOK approach, your API key, your usage patterns
- **GitHub Copilot with Claude 4**: Microsoft's wrapper, but they seem
  to be hands-off with the Claude integration

These tools have no incentive to artificially limit effectiveness
because they're not trying to maximize your session time - they just
want to provide the best possible experience.

## What actually works for production teams

After evaluating with the CTO, here's what we're actively considering:

**Claude Code - The Team Choice:**

- Minimal misunderstanding on tasks
- Stays focused and doesn't get distracted by config changes (huge
  win!)
- Pro subscription at ~$20/month makes it cost-predictable for teams
- Direct API access means no system prompt interference
- Claude Code will stay on task _most of the time_ and not wander off
  into config rabbit holes

**GitHub Copilot - The Surprise Contender:**

- Now has Claude 4 access in VS Code
- Appears unhindered by Microsoft's system prompt meddling
- Seems to maintain Claude's original capabilities
- Good fallback when you run out of Claude Code tokens

**Cline - The token monster:**

- "Just gets it" like Claude Code
- BYOK (bring your own key) approach via OpenRouter
- Minimal system prompt interference from the Cline team
- Can be cost-prohibitive due to token burn rate

## The team impact

This isn't just personal frustration. When tools don't follow rules
files, they write shitty tests that cause the CI to fall over. When
they get distracted by config changes instead of staying on task,
velocity drops. When they randomly generate code that doesn't match
the actual file structure, **developers lose trust**.

As a team lead, I need tools that are consistent and reliable. The
current crop of "AI-enhanced" editors that meddle with system prompts
are actively hurting productivity.

<Bluesky
	post_id="did:plc:nlvjelw3dy3pddq7qoglleko/app.bsky.feed.post/3ls22klogc22z"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

## The bottom line

The tools that work are the ones that:

1. **Go straight to the API** without system prompt interference
2. **Have access to Claude 4** for modern framework support
3. **Stay on task** without getting distracted by every config file
4. **Are cost-predictable** for team deployments

Right now, that's Claude Code for team work, Cline for power users who
don't mind burning tokens, and surprisingly, GitHub Copilot as a
backup option.

Everything else? Skip it. The hype isn't worth the frustration when
you're trying to ship real code with a real team.

Your mileage may vary, but this is what works when you need to get
stuff done, not just tinker with cool demos.
