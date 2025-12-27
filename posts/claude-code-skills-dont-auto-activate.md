---
date: 2025-11-06
title: Claude Code Skills Don't Auto-Activate (a workaround)
tags: ['claude', 'claude-code', 'guide', 'notes']
is_private: false
---

<script>
  import { Details } from '$lib/components'
</script>

So I got Claude Skills to register with Claude Code (sorted the
[YAML formatting issue](/posts/claude-code-skills-not-recognised)),
and the skills are now showing up when I ask Claude to list them. Job
done, right? Nah! Turns out getting skills to _actually activate_
**reliably** when you need them is another chore in itself.

I created a `research` skill as I was tired of having to fact check
Claude's responses. Dead simple - when I say "research this" or "study
that", Claude should use the global skill (located in
`~/.claude/skills/research/`) which has instructions to verify
sources, fetch actual content, and not just present search snippets as
facts.

<Details button_text="research skill definition" styles="uppercase btn-primary">

```markdown
---
name: research
# prettier-ignore
description: Research topics by verifying actual source content. Use when asked to research or study links and documentation.
# prettier-ignore
allowed-tools: WebFetch, mcp__mcp-omnisearch__web_search, mcp__mcp-omnisearch__kagi_summarizer_process, Read, Grep
---

# Verified Research

## Quick Start

When researching, always fetch and verify actual sources:

\`\`\`bash

# Always do this

WebFetch URL → read content → verify claims → present findings

# Never do this

WebSearch → present snippets without verification \`\`\`

## Core Rule

**Never present findings without examining actual source content.**

Steps:

1. Fetch the actual source (WebFetch or extract tools)
2. Read the complete relevant sections
3. Verify claims match what source actually says
4. Quote specific passages when making claims

## Common Pitfalls

❌ Presenting search snippets as facts ❌ Trusting summaries without
checking sources ❌ Citing sources you haven't read

## When Uncertain

If you can't verify (paywall, 404, contradictions): **Say so
explicitly.** Don't present unverified info as fact.
```

</Details>

Here's a simplified version of what would happen:

```text
Me: "research if Claude Code prefers CLI or MCP tools"
Claude: *fetches some docs, presents findings as facts*
Me: "Why didn't you use the research skill?"
Claude: "Oh yeah, sorry about that"
```

Every. Single. Time.

The skill was there. It showed up when prompted
"**`list <available_skills>`**". The description had "research" and
"study" as trigger words. According to the
[official docs](https://docs.claude.com/en/docs/claude-code/skills),
skills are "model-invoked" and "Claude autonomously decides when to
use them based on your request and the Skill's description."

Spoiler: they don't.

## The investigation

Back to that GitHub issue I mentioned in the other post
([#9716](https://github.com/anthropics/claude-code/issues/9716)) where
multiple people report the same thing:

> Claude Code is not automatically discovering or prioritizing
> available skills during conversation, despite being able to list
> them when explicitly asked.

Even when users' queries _exactly matched_ skill descriptions, Claude
would just... ignore the skill and do the work manually.

So, my initial issue with having Claude actually recognise the skills
was just the first half of the problem!

## "Hey Claude is there a skill for this?"

I had a `UserPromptSubmit` hook that fired on every prompt:

```bash
echo '💡 Check .claude/skills/ for relevant skills before responding!'
```

Claude saw it. Acknowledged it. And completely ignored it anyway.

The hook was just a gentle suggestion, and Claude treated it like
background noise.

The thing is, Claude is so goal focused that it barrels ahead with
what it thinks is the best approach. It doesn't check for tools unless
explicitly told to.

## A workaround

I'd already come across the
[claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)
repository when researching for my
[claude-skills-cli](https://github.com/spences10/claude-skills-cli) in
the infrastructure showcase the author straight up says:

> "Claude Code skills just sit there. You have to remember to use
> them."

This doesn't live up to the Anthropic marketing hype!

The Claude Code infrastructure showcase solution? **Don't rely on
"autonomous activation" - use hooks to explicitly invoke skills when
trigger words appear.**

The Anthropic docs claim skills are autonomous, but in practice, you
need to force the issue.

Here's what I got to work - call a script via the `UserPromptSubmit`
hook that detects trigger words and **explicitly tells Claude to use
the skill**.

## The hook script

This is global for me for this skill but could just as simply live in
a project-specific `.claude/hooks/` folder. Same for project level
settings `.claude/settings.json` file you may want to ship with your
repo.

Create `~/.claude/hooks/auto-research.sh`:

```bash
#!/bin/bash
# Auto-activate research skill when user says "research" or "study"

# Read JSON from stdin (how Claude Code passes hook data)
INPUT=$(cat)

# Extract prompt from JSON
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Check for jq availability
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Install with: sudo apt install jq"
  exit 1
fi

# Check if prompt contains research/study trigger words (including inflections)
if echo "$PROMPT" | grep -qiE '(research|study)'; then
  echo "🔍 INSTRUCTION: Use Skill(research) to handle this request with source verification."
fi
```

Make it executable:

```bash
chmod +x ~/.claude/hooks/auto-research.sh
```

## Add the hook to settings

Update `~/.claude/settings.json` to add the hooks configuration:

```json
{
	"hooks": {
		"UserPromptSubmit": [
			{
				"hooks": [
					{
						"type": "command",
						"command": "~/.claude/hooks/auto-research.sh"
					}
				]
			}
		]
	}
}
```

## Key differences from a reminder

**Gentle reminder (doesn't work):**

```bash
echo '💡 Check .claude/skills/ for relevant skills'
```

**Explicit instruction (actually works):**

```bash
echo "🔍 INSTRUCTION: Use Skill(research) to handle this request"
```

The difference? One is "Please sir, consider this 🙏", background
noise, the other is a "HEY! STFU! Listen!" direct command.

## The results

Now when I say "research X" or "study Y", the hook:

1. Detects the trigger word
2. Injects an explicit instruction to use the skill
3. Claude follows through

No more "Nah, I ignored that m8" responses. From my testing and usage
it consistently works.

## How hooks actually work

Quick note on the hook format, as I was dicking around with this
making
[analytics tools via the statusline in the past](https://github.com/spences10/claude-code-analytics).
Hooks receive JSON via stdin:

```json
{
	"prompt": "research this thing",
	"session_id": "...",
	"transcript_path": "...",
	"cwd": "/current/directory",
	"permission_mode": "...",
	"hook_event_name": "UserPromptSubmit"
}
```

You can parse it with `jq` (or any JSON parser) to get the prompt
text.

## Why this matters

Skills are _said_ to be good for keeping context windows under
control. Instead of pasting the same instructions every time, you
define behaviour once in a skill.

But if skills don't activate automatically (and they don't), you
should consider this hook pattern to make them useful.

The official docs might say skills are "autonomous" and
"model-invoked", but in practice? You need to smash Claude over the
head to actually use them.

## Pattern for other skills

Want to auto-activate other skills? Same pattern:

```bash
#!/bin/bash
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Add your trigger logic
if echo "$PROMPT" | grep -qiE '(your|trigger|words)'; then
  echo "INSTRUCTION: Use Skill(your-skill-name) for this request."
fi
```

The key (I found) is making it an **INSTRUCTION**, not a suggestion.

## The scalability problem

Right, let's be honest - this approach is brittle and won't scale well
beyond one or two skills.

**Keyword collisions are inevitable:**

```bash
"research the database schema"     # Triggers research skill (wrong)
"study this function's logic"      # Triggers research skill (wrong)
"research why this test fails"     # Triggers research skill (wrong)
```

The hook just greps for keywords without understanding context. It
can't tell the difference between "research this documentation" (web
sources) and "research this codebase" (code analysis).

**For multiple skills, you'd need:**

1. More sophisticated pattern matching (regex with context)
2. Priority/disambiguation system
3. Skill metadata for conflict resolution
4. Proper routing logic that understands intent

Basically, you'd need a proper skill router - which is a whole project
in itself. Something that could:

- Parse skill definitions with trigger patterns
- Handle conflicts and ambiguity
- Generate hooks automatically
- Maintain routing rules in one place

This is exactly the kind of thing that could be built into a CLI tool
(like
[claude-skills-cli](https://github.com/spences10/claude-skills-cli))
where you define triggers when creating skills, and the tool generates
the routing hooks for you.

**For now:** This approach works great for a single, well-defined
skill with unique trigger words. Beyond that, you're better off
manually invoking skills with explicit commands until better tooling
exists.

## Update: A simpler, more scalable approach

After more testing with the
[claude-skills-cli](https://github.com/spences10/claude-skills-cli),
I've found a simpler solution that's **less brittle** than
keyword-based scripts but a bit more inconsistent!

The problem with my original approach is the keyword script works, but
it has a flaw for scaling: **every new skill requires creating a new
script or updating the script with new keywords**. You end up
managing:

- Keyword collision avoidance
- Script maintenance for each skill
- Regex patterns that grow increasingly complex

What I found (from my testing) is:

A single, hook with an **explicit instruction** that works for _all_
skills:

```json
{
	"hooks": {
		"UserPromptSubmit": [
			{
				"hooks": [
					{
						"type": "command",
						"command": "echo 'INSTRUCTION: If the prompt matches any available skill keywords, use Skill(skill-name) to activate it.'"
					}
				]
			}
		]
	}
}
```

No script. No `jq`. No keyword management. Just a direct instruction
that tells Claude to:

1. Check available skills
2. Match keywords in the prompt to skill descriptions
3. **Activate** matching skills using `Skill()` syntax

## Does this work better?

When I tested with two skills (alpha and beta) using different
keywords:

- **Simple hook**: Activated correctly based on skill metadata ✅
- **No script updates needed** when adding new skills ✅
- **Skills self-describe** through their frontmatter ✅

## What I actually found from testing

After messing about with both approaches for the "research" skill, I
ran 20 fresh Claude Code sessions to test the hook reliability - 10
with the hook at project level, 10 at global level.

Results? **4/10 globally, 5/10 locally.** Basically a coin flip.

So the simple explicit hook is a "Spin the wheel!" situation and see
if Claude pays attention. Sometimes it activates skills, sometimes it
completely ignores the instruction. No pattern I could spot - just
50/50 randomness.

Still, I prefer this approach over keyword scripts because:

- No maintenance overhead when adding new skills
- No keyword collision headaches
- No regex patterns to manage

50% success rate isn't great, but it beats maintaining keyword scripts
and dealing with collisions when you've got multiple skills.

The
[claude-skills-cli](https://github.com/spences10/claude-skills-cli)
uses this approach by default with the `add-hook` command.

## Bottom line

Skills should auto-activate based on their descriptions. (They don't).
Even with explicit hook instructions, it's a coin flip.

My approach? Use the simple hook approach for convenience, but if you
actually need a skill for something important, invoke it explicitly
with `Skill(skill-name)` in your prompt.

If you've found a way to get skills activating reliably, I'd genuinely
love to know - hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev).
