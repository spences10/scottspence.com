---
date: 2025-11-16
title: How to Make Claude Code Skills Activate Reliably
tags: ['claude', 'claude-code', 'guide', 'notes']
is_private: false
---

<script>
  import { Details } from '$lib/components'
</script>

So, remember that
[blog post I wrote](/posts/claude-code-skills-dont-auto-activate)
about Claude Code skills being a coin flip? Where the "simple hook"
approach gave me a whopping 50% success rate and I basically said
"just invoke skills manually"?

Yeah, well, I wasn't happy with that. Coin flips are for deciding
which takeaway to order, not for whether my development tools actually
work. So I did what any reasonable dev would do: I spent my weekend
building a testing framework and ran 200+ tests across different
prompt types to figure out what actually makes Claude activate skills
reliably.

I found two approaches that hit **80-84% success** vs the 50% coin
flip. Not perfect, but way better than nothing! 😅

## The problem

Claude Code skills are _supposed_ to activate autonomously based on
their descriptions. The docs say Claude "autonomously decides when to
use them based on your request."

In practice? Nah. They just sit there whilst Claude barrels ahead
blissfully ignoring them.

My original "solution" was a simple hook that said "INSTRUCTION: If
the prompt matches any skill keywords, use Skill(skill-name)." That
gave me about 50% activation. Better than nothing, but still basically
a coin flip.

## Building a proper test harness

Right, so instead of just whinging about it, I decided to actually
measure this properly. I built a testing framework with:

- SQLite database to track results
- Multiple hook configurations to test
- Both synthetic (API) and manual (real Claude Code) testing
- Proper metrics: pass rates, latency, costs

The setup's in my
[svelte-claude-skills](https://github.com/spences10/svelte-claude-skills)
repo if you want to poke around.

## The skills being tested

I created four Claude Code skills for SvelteKit development, each
covering a specific domain:

1. **svelte5-runes** - Guidance on Svelte 5's runes system (`$state`,
   `$derived`, `$effect`, `$props`, `$bindable`) and migration from
   Svelte 4
2. **sveltekit-data-flow** - Data loading patterns, form actions,
   server vs universal load functions, `fail()`, `redirect()`, and
   serialization rules
3. **sveltekit-structure** - File-based routing, layouts, error
   boundaries, SSR/hydration, and file naming conventions
4. **sveltekit-remote-functions** - Remote function patterns with
   `query()` and `command()` for type-safe server calls

Each skill has a description that Claude _should_ use to autonomously
decide when to activate it. For example, if you ask about form
actions, `sveltekit-data-flow` should activate. If you ask about
`$state`, `svelte5-runes` should activate.

The problem? Without proper hooks, skills just sit there collecting
dust whilst Claude blags it's way through things with pattern
matching.

## The test prompts

To measure activation rates, I tested five prompts covering common
SvelteKit tasks, running each through Haiku 4.5 ten times:

1. **Form/Route Creation** - "Create a new route at /posts/new with a
   form to create a blog post. On successful submission, redirect to
   /posts. Show validation errors if title is empty."
   - _Should activate_: `sveltekit-structure`, `sveltekit-data-flow`,
     `svelte5-runes`
2. **Data Loading** - "Create a /products page that loads product data
   from a database in the load function. Display products in a list."
   - _Should activate_: `sveltekit-data-flow`
3. **Server Actions** - "Add a +page.server.ts file to handle form
   submission for a contact form. Validate email and message fields."
   - _Should activate_: `sveltekit-data-flow`, `sveltekit-structure`
4. **Remote Functions** - "Create a query() remote function to fetch
   user profile data and a command() to update preferences."
   - _Should activate_: `sveltekit-remote-functions`
5. **Svelte 5 Runes** - "Create a counter component using Svelte 5
   runes with $state for count and $derived for doubled value."
   - _Should activate_: `svelte5-runes`

The Form/Route Creation prompt is the trickiest - it involves creating
routes (structure), handling forms (data flow), AND reactive state
(runes). Multi-skill prompts like this are where the simple hook
completely fell apart.

## Four hook types tested

I tested four different approaches:

1. **No hook** - Baseline, no intervention
2. **Simple instruction** - The original "coin flip" approach
3. **Forced eval** - Make Claude explicitly evaluate each skill before
   proceeding
4. **LLM eval** - Use Claude API to pre-evaluate which skills match

## The results

Here's the the data from the databse across all five prompt types (10
runs each prompt):

## Complete results across all hooks

| Prompt Type         | Simple  | LLM-Eval | Forced  | Best       |
| ------------------- | ------- | -------- | ------- | ---------- |
| Form/Route Creation | 0%      | 0%       | 80%     | Forced     |
| Data Loading        | 0%      | 100%     | 100%    | LLM/Forced |
| Server Actions      | 10%     | 100%     | 40%     | LLM-Eval   |
| Remote Functions    | 90%     | 100%     | 100%    | LLM/Forced |
| Svelte 5 Runes      | 100%    | 100%     | 100%    | All tied   |
| **Overall**         | **20%** | **80%**  | **84%** | **Forced** |

## Cost and performance comparison

All tests run with **Claude Haiku 4.5** ($1/MTok input, $5/MTok
output):

| Hook Type | Pass Rate   | Total Cost | Cost/Test | Avg Time | Verdict           |
| --------- | ----------- | ---------- | --------- | -------- | ----------------- |
| Forced    | 84% (42/50) | $0.3367    | $0.0067   | 7.2s     | Most consistent   |
| LLM-Eval  | 80% (40/50) | $0.3030    | $0.0061   | 6.0s     | Best cost/speed   |
| Simple    | 20% (10/50) | $0.2908    | $0.0058   | 6.7s     | ❌ Too unreliable |

**Key findings**:

- Simple hook completely fails at multi-skill tasks (Form/Route: 0%,
  Data Loading: 0%)
- Forced hook never completely failed a category (most consistent)
- LLM eval is cheaper/faster but can completely miss certain prompts

Both forced and LLM eval are **massively better** than the 20% simple
hook baseline.

## The winner (sort of): forced eval hook

The forced eval hook hit 84% overall, with perfect scores on three out
of five prompt types. Here's what makes it work:

<Details button_text="forced eval hook script" styles="uppercase btn-primary">

```bash
#!/bin/bash
# UserPromptSubmit hook that forces explicit skill evaluation

cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Step 1 - EVALUATE (do this in your response):
For each skill in <available_skills>, state: [skill-name] - YES/NO - [reason]

Step 2 - ACTIVATE (do this immediately after Step 1):
IF any skills are YES → Use Skill(skill-name) tool for EACH relevant skill NOW
IF no skills are YES → State "No skills needed" and proceed

Step 3 - IMPLEMENT:
Only after Step 2 is complete, proceed with implementation.

CRITICAL: You MUST call Skill() tool in Step 2. Do NOT skip to implementation.
The evaluation (Step 1) is WORTHLESS unless you ACTIVATE (Step 2) the skills.

Example of correct sequence:
- research: NO - not a research task
- svelte5-runes: YES - need reactive state
- sveltekit-structure: YES - creating routes

[Then IMMEDIATELY use Skill() tool:]
> Skill(svelte5-runes)
> Skill(sveltekit-structure)

[THEN and ONLY THEN start implementation]
EOF
```

</Details>

## Why this works

The difference between the simple hook and the forced eval hook is the
**commitment mechanism**.

**Simple instruction** (20-40% success):

```bash
echo 'INSTRUCTION: If the prompt matches any available skill keywords,
use Skill(skill-name) to activate it.'
```

This is a passive suggestion. Claude sees it, acknowledges it
mentally, then completely ignores it and barrels ahead with
implementation. It's background noise.

**Forced eval** (84% success):

```bash
Step 1 - EVALUATE: For each skill, state YES/NO with reason
Step 2 - ACTIVATE: Use Skill() tool NOW
Step 3 - IMPLEMENT: Only after activation

CRITICAL: The evaluation is WORTHLESS unless you ACTIVATE the skills.
```

This creates a three-step process where Claude has to:

1. **Show its work** - Explicitly evaluate each skill
2. **Make a commitment** - State YES/NO for each
3. **Follow through** - Can't skip to implementation without
   activating

The aggressive language helps too. Words like "MANDATORY",
"WORTHLESS", "CRITICAL" make it harder for Claude to just... ignore
it.

It's basically the programming equivalent of making someone sign a
contract before they can proceed. Once Claude writes "YES - need
reactive state" in its response, it's committed to activating that
skill.

**The caveat**: It's not perfect (84%), and it uses more tokens than
the simple hook since the prompt is larger. But 84% vs 20%? I'll take
that tradeoff.

## The LLM eval hook (cheaper but can fail spectacularly)

The LLM eval hook is fascinating - it uses the Claude API to
_pre-evaluate_ which skills match before Claude Code even sees the
prompt:

<Details button_text="llm eval hook (excerpt)" styles="uppercase btn-primary">

```bash
#!/bin/bash
# Calls Claude API to evaluate which skills match

EVAL_PROMPT=$(cat <<EOF
Return ONLY a JSON array of skill names that match this request.

Request: ${USER_PROMPT}

Skills:
${AVAILABLE_SKILLS}
Format: ["skill-name"] or []
EOF
)

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 200,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": $(echo "$EVAL_PROMPT" | jq -Rs .)
    }]
  }")

# Extract skills and instruct Claude to activate them
```

</Details>

This costs about $0.0004 per prompt (0.04 cents) using Haiku 4.5.

**The good**:

- 10% cheaper per prompt ($0.0606 vs $0.0673)
- 17% faster (5.0s vs 5.4s latency)
- Hit 100% on Server Actions (vs 40% for forced eval)
- Sometimes adds "smart" related skills the forced hook misses

**The bad**:

- Completely failed on Form/Route Creation (0/10) - missed
  svelte5-runes every time
- More variable - can make smarter decisions but can also miss
  entirely
- Requires API key and external API call on every prompt

The LLM eval hook is "smarter" when it works, but it can fail
spectacularly. The forced eval is more consistent, even if slightly
less intelligent about which skills to activate.

## How to use the forced eval hook

If you want to try this yourself:

1. Create `.claude/hooks/skill-forced-eval-hook.sh` in your project
   (or globally in `~/.claude/hooks/`)
2. Copy the forced eval script from above
3. Make it executable: `chmod +x skill-forced-eval-hook.sh`
4. Add to `.claude/settings.json`:

```json
{
	"hooks": {
		"UserPromptSubmit": [
			{
				"hooks": [
					{
						"type": "command",
						"command": ".claude/hooks/skill-forced-eval-hook.sh"
					}
				]
			}
		]
	}
}
```

Now when you prompt Claude, you'll see it explicitly evaluate each
skill before proceeding. It's verbose (Claude lists every skill with
YES/NO reasoning), but it gets 84% activation vs 20% for the simple
hook.

## Which hook should you use?

**Use forced eval if**:

- You want the most consistent activation (84%)
- You don't mind verbose output (Claude lists all skills before
  working)
- You want a pure client-side solution (no API calls)

**Use LLM eval if**:

- You want cheaper/faster responses (10% cost, 17% speed improvement)
- Your prompts are straightforward (single skill scenarios)
- You're okay with occasional complete failures (like the 0% on
  Form/Route)
- You have an Anthropic API key set up

**Use simple instruction if**:

- You like disappointment and coin flips 😅

For me, I'm using the forced eval hook. The 84% success rate is worth
the verbosity, and I don't have to worry about API keys or external
dependencies.

**If you're using the claude-skills-cli**: Both hooks are available.
Generate them with:

```bash
pnpm exec claude-skills-cli add-hook
# Choose "forced-eval" or "llm-eval" when prompted
```

The
[claude-skills-cli](https://github.com/spences10/claude-skills-cli)
repo has both implementations.

## The testing framework

If you want to run your own tests, the framework's in the
[svelte-claude-skills](https://github.com/spences10/svelte-claude-skills)
repo. It includes:

- SQLite database schema for tracking results
- Testing scripts (both CLI and web UI)
- Multiple hook configurations to compare
- Views for analysing hook effectiveness

You can run tests with:

```bash
cd scripts
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
node test-hooks.js --hook-config forced --iterations 10
```

Or use the web UI at `/hooks-testing` to see real-time results as
tests run.

## Bottom line

Skills _should_ activate autonomously based on descriptions. They
don't. The "simple instruction" approach gives you 20% success - a
coin flip.

After testing 200+ prompts across multiple configurations, I found two
approaches that actually work:

- **Forced eval hook**: 84% success, more consistent, no external
  dependencies
- **LLM eval hook**: 80% success, 10% cheaper/faster, but can fail
  spectacularly

Both are **massively better** than the 20% baseline. Neither is
perfect.

The forced eval hook works by creating a commitment mechanism - Claude
has to evaluate each skill explicitly and state YES/NO before it can
proceed with implementation. It's verbose (you'll see the evaluation
in every response), but it's consistent.

For me, 84% vs 20% is worth the verbosity. Your mileage may vary
depending on whether you value consistency (forced) or cost/speed (LLM
eval).

If you've got better approaches or findings from your own testing, I'd
genuinely love to hear about them. Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10).

The full testing data's in the
[repo](https://github.com/spences10/svelte-claude-skills) if you want
to poke around. Happy skill hunting! 😂
