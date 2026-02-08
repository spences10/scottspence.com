---
date: 2026-02-08
title: Measuring Claude Code Skill Activation With Sandboxed Evals
tags: ['claude', 'claude-code', 'testing', 'daytona', 'skills']
is_private: false
---

<!-- cspell:ignore Evals daytonaio Seleznov obra -->

Remember
[that post](/posts/how-to-make-claude-code-skills-activate-reliably)
where I tested skill activation with the Claude API and got the
forced-eval hook to 84%? That was running against Haiku 4.5 with
synthetic API calls. Good for iteration speed, but it wasn't testing
the actual thing. It was testing a simulation of the thing.

So I built an eval harness that runs `claude -p` commands inside
isolated Daytona sandboxes. Same skills, same hooks, but against the
actual Claude Code binary.

The results are a bit different from last time.

## What changed

The original test used the Claude Messages API with Haiku 4.5 to
simulate what Claude Code does.

This time, each test runs `claude -p` inside a Daytona sandbox with
the skills and hooks already set up. The harness:

1. Spins up a fresh Daytona sandbox per hook config (vanilla, forced
   eval, LLM eval, simple instruction)
2. Uploads the four Svelte skills and whichever hook script is being
   tested
3. Writes the `.claude/settings.json` with the hook wiring
4. Runs each of the 22 test prompts through `claude -p` with
   `--output-format stream-json`
5. Parses the JSONL stream for `Skill()` tool_use events
6. Kills the process after 20 seconds (I only care about whether it
   _activated_ a skill, not the full response)

That last bit was the key optimisation. A full Claude Code turn can
take 400+ seconds if it starts trying to 'fix' the issue. I don't need
any of that. I just need to know, did it call `Skill()` or not? The 20
second window captures that.

## The five configs

Same four hooks from the previous post, plus a new one:

| Config          | How it works                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **none**        | No hook. Baseline control.                                                                                    |
| **simple**      | One-line echo: "If the prompt matches skill keywords, use Skill()"                                            |
| **forced-eval** | Multi-step bash script that tells Claude to evaluate each skill YES/NO then activate                          |
| **llm-eval**    | Calls Haiku via the API to pre-classify which skills match, then tells Claude to activate those specific ones |
| **type-prompt** | Native `type: "prompt"` hook (built into Claude Code's hook system) with similar instructions to forced-eval  |

The `type-prompt` config is new. Instead of a shell script that echoes
text, it uses Claude Code's native prompt hook type (apparently). This
is why I did this second round of evaluations, to test out this
natively.

## Run 1 results

| Config         | Activation   | Correct      | Avg Latency |
| -------------- | ------------ | ------------ | ----------- |
| none (control) | 55% (12/22)  | 55% (12/22)  | 8.7s        |
| simple         | 59% (13/22)  | 59% (13/22)  | 8.6s        |
| forced-eval    | 100% (22/22) | 100% (22/22) | 10.7s       |
| llm-eval       | 100% (22/22) | 100% (22/22) | 6.4s        |
| type-prompt    | 55% (12/22)  | 55% (12/22)  | 9.6s        |

Four things jumped out.

## The baseline is 55%, not 0%

When I first tested skill activation
[back in November](/posts/claude-code-skills-dont-auto-activate) with
Haiku 4.5, it was basically zero without a hook. Claude just ignored
skills entirely and barrelled ahead with implementation.

With Sonnet 4.5, the baseline jumps to 55% with zero intervention.
That's likely a model capability difference rather than something that
improved over time. Sonnet is just better at noticing skills exist.

## Both structured hooks hit 100%

Both forced-eval and llm-eval achieved perfect activation _and_
perfect accuracy across all 22 test cases. Every prompt triggered the
correct skill.

In the previous Haiku 4.5 tests, forced-eval hit 84% and llm-eval hit
80%. Running against Sonnet 4.5 with the real Claude Code environment
pushes both to 100%.

This makes sense. Sonnet 4.5 is a more capable model than Haiku, and
the real Claude Code environment gives it the full system prompt and
tool definitions. The hooks just needed to nudge it in the right
direction, and the stronger model did the rest.

## When Claude activates, it always picks correctly

Look at the activation vs correct columns. They're identical for every
config. There's no case where Claude activated a skill but picked the
wrong one. The problem is purely about _activation_ (does it call
`Skill()` at all?), not _selection_ (does it pick the right skill?).

This means the skill descriptions are working well. Claude understands
which skill matches which query. It just sometimes doesn't think to
check.

## type-prompt doesn't help

The native `type: "prompt"` hook performed identically to no hook at
all (55% vs 55%). It gets the same kind of instruction as forced-eval,
just delivered through Claude Code's built-in prompt hook mechanism
instead of a shell script.

My guess is that the prompt hook's output gets weighted differently
than shell hook output. I've seen it do this in the past where the
information will be deprioritised in the `<system-reminder>` as
background noise.

## llm-eval is fastest despite the extra API call

llm-eval averaged 6.4 seconds vs 10.7 for forced-eval. That's 40%
faster, despite making an extra API call to Haiku before Claude even
starts.

Why? Because llm-eval tells Claude _exactly which skills_ to activate.
There's no evaluation step in the response. Claude just gets "activate
svelte-runes and sveltekit-data-flow" and does it immediately. The
forced-eval hook makes Claude evaluate each skill YES/NO in its
response text before activating, which adds tokens and thinking time.

## Run 2: confirmation

One run is an anecdote. Two runs is... slightly more than an anecdote.
I ran the full harness again to check whether Run 1 was a fluke.

| Config         | Run 1 Correct | Run 2 Correct |
| -------------- | ------------- | ------------- |
| none (control) | 55% (12/22)   | 50% (11/22)   |
| simple         | 59% (13/22)   | 50% (11/22)   |
| forced-eval    | 100% (22/22)  | 100% (22/22)  |
| llm-eval       | 100% (22/22)  | 100% (22/22)  |
| type-prompt    | 55% (12/22)   | 41% (9/22)    |

The structured hooks held at 100% across both runs. The unstructured
configs (none, simple, type-prompt) bounced around in the 41-59%
range, which is what you'd expect from something that's basically a
coin flip with a slight bias.

The variance in the baseline configs is worth noting. 55% in Run 1,
50% in Run 2. That's a 5-point swing with no change in setup. If
you're relying on Claude activating skills without a hook, you're
subject to that kind of noise.

The forced-eval and llm-eval hooks eliminate that variance entirely.
100% both times, no exceptions.

## Harder prompts

The standard 22 test cases are straightforward. Each one maps cleanly
to a single skill. Real usage isn't that clean. So I ran a
head-to-head between forced-eval and llm-eval on 24 harder prompts:
ambiguous queries, multi-skill scenarios, and crucially, prompts that
have nothing to do with Svelte at all.

That last category matters. The standard tests only check whether
hooks activate the _right_ skill. They never check whether hooks
activate when they _shouldn't_. Five of the 24 prompts were things
like general TypeScript questions or React queries where the correct
answer is "no skill needed."

| Metric                            | forced-eval | llm-eval    |
| --------------------------------- | ----------- | ----------- |
| Overall accuracy                  | 75% (18/24) | 67% (16/24) |
| True negatives (no-skill prompts) | 100% (5/5)  | 20% (1/5)   |
| False positives                   | 0           | 4           |

llm-eval hallucinated on the non-Svelte queries. When asked about
React hooks or general TypeScript patterns, it would return skill
names that sounded plausible but didn't exist, or worse, it'd
recommend a Svelte skill for a non-Svelte question. Four out of five
times it told Claude to activate a skill when it shouldn't have.

forced-eval got all five true negatives correct. When Claude evaluates
each skill YES/NO against the prompt, it can see that none of them
match and correctly says "no skills needed." The commitment mechanism
works in both directions: it forces activation when skills match _and_
forces restraint when they don't.

This is the meaningful difference between the two approaches. On
standard prompts they're both perfect. On edge cases, forced-eval's
explicit evaluation step gives it precision that llm-eval's
pre-classification can't match.

## The harness architecture

The harness runs from a TypeScript orchestrator using the
`@daytonaio/sdk`. For each hook config:

1. Create a fresh Daytona sandbox with `ANTHROPIC_API_KEY` injected
2. Upload the skills directory (tar'd and extracted)
3. Upload hook scripts and `settings.json`
4. Upload a monitor script that wraps `claude -p`
5. For each of the 22 test cases, run the monitor script with the
   query
6. Parse JSONL stdout for Skill tool_use events
7. Aggregate results and tear down the sandbox

The monitor script is minimal:

```bash
timeout -k 5 "$TIMEOUT" claude -p "$QUERY" \
  --output-format stream-json --verbose --max-turns 1 \
  --allowedTools Skill --permission-mode bypassPermissions \
  > "$OUTPUT" 2>/dev/null
```

`--max-turns 1` prevents Claude from going off on multi-turn tangents.
`--allowedTools Skill` restricts it to only the Skill tool. The 20s
timeout with `--kill-after 5` ensures I get clean exits.

The JSONL parser looks for `tool_use` blocks with `name: "Skill"` and
extracts the skill name from the input. It handles four different
patterns because the stream-json format nests things differently
depending on timing.

## What it cost

Total spend across all runs: **$5.59**.

| Model             | Cost  | What for                                  |
| ----------------- | ----- | ----------------------------------------- |
| Claude Sonnet 4.5 | $5.20 | Sandbox test runs (the `claude -p` calls) |
| Claude Haiku 4.5  | $0.34 | Harness orchestration                     |
| Claude Haiku 3.5  | $0.04 | llm-eval hook pre-classification calls    |

The bulk of the cost is the test runs themselves. Each `claude -p`
call burns Sonnet tokens even though I kill it after 20 seconds.
Across 5 configs, 22 test cases, and 2 full runs plus the
head-to-head, that's roughly 250 individual Claude invocations.

The llm-eval hook's Haiku 3.5 calls are negligible. $0.04 for all the
pre-classification across every llm-eval test. That's the whole point
of the approach: use a tiny model to route, let the big model execute.

## What the failures tell me

I dug into the per-test breakdown across both runs and there's a clear
pattern in what gets missed without hooks. It's not random. It's
keyword-dependent.

Prompts with explicit skill keywords activate reliably even without a
hook. Ask about `$state` or `command()` or `.remote.ts` and Claude
activates the right skill basically every time. But rephrase the same
concept without the keyword and it falls over.

| Prompt style        | Example                                  | Baseline activation |
| ------------------- | ---------------------------------------- | ------------------- |
| Has keyword         | "How do I use $state in Svelte 5?"       | ~100%               |
| Generic phrasing    | "How do form actions work in SvelteKit?" | ~20-40%             |
| Indirect/conceptual | "My component re-renders too much"       | ~0%                 |

The most unreliable test cases (missed 80%+ without hooks) were things
like `$derived`, `$effect`, `bindable props`, `load function`,
`form actions`, `server load function`, `file-based routing`, `SSR`,
and `+page.svelte vs +layout.svelte`. None of those contain the actual
skill name in the prompt.

Meanwhile, `command()`, `.remote.ts`, and `$state` sailed through
every config because they're distinctive enough tokens that Claude
matches them to the right skill without being told.

So Claude isn't doing semantic matching at the activation layer. It's
doing something closer to keyword matching. It knows what each skill
is _for_ (selection is always correct), but it doesn't reliably
_notice_ that a skill is relevant unless the prompt contains obvious
trigger tokens. The forced-eval hook fixes this by making Claude
explicitly check each skill description against the prompt before it
does anything else.

## Which hook should you use?

If you're on Sonnet 4.5 and your prompts are straightforward,
honestly? You might not need a hook at all. The baseline is around 50%
and climbing with each model release.

If you want reliability, **forced-eval is the winner**. It hits 100%
on standard prompts across both runs, and it's the only hook that
correctly avoids false positives on non-matching queries. Zero
hallucinated skill activations. No API key required. The only downside
is it's slightly slower because Claude has to evaluate each skill in
its response.

**llm-eval** is faster (6.4s vs 10.7s) and equally perfect on standard
prompts, but it hallucinates on edge cases. If a query doesn't match
any skill, llm-eval will still recommend one 80% of the time. That's
fine if all your prompts are squarely within your skill domains. If
you get a mix of relevant and irrelevant prompts, you'll get spurious
skill activations.

Both are in the
[svelte-claude-skills](https://github.com/spences10/svelte-claude-skills)
repo under `.claude/hooks/`.

## Bottom line

Both the forced-eval and llm-eval hooks hit 100% on standard prompts
across two full runs on Sonnet 4.5.

The difference shows up on edge cases. forced-eval's commitment
mechanism (evaluate, commit, activate) gives it perfect precision:
zero false positives on non-matching queries. llm-eval is faster but
hallucinates skill recommendations when nothing matches. For that
reason, **forced-eval is my recommendation**. No API key, no external
dependencies, 100% activation, zero false positives.

The whole eval cost $5.59 across ~250 Claude invocations. Not bad for
a proper answer to "which hook actually works?"
