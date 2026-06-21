---
date: 2026-06-21
title: How I Stop LLMs Drifting In Production Codebases
tags: ['llm', 'pi', 'my-pi', 'svelte', 'guide']
published: false
---

<!-- cSpell:ignore LLMs SvelteKit my-pi oxlint guardrails worktree handoff handoffs allowlist toolcall toolcalls FTS PRs mockup -->

The problem I care about with LLM coding is drift: one plausible
shortcut gets copied, then future sessions start treating it as how
the app works. I've used AI coding tools every day as a team lead on
large private client codebases, across features, bug fixes, refactors,
reviews, and more recently a finance workflow processing more than
$20m a month in capital. When the app has audit trails, permissions,
calculations, generated documents, client workflows, and operational
handoffs, "prompt harder" is not an engineering system. The answer is
guardrails in the repo: checks, docs, lint rules, tool-call blockers,
and handoff validation that stop the model drifting before the mistake
becomes normal.

For me, drift looks like this:

- one lazy `$effect` turns into three more lazy `$effect`s
- a route imports the database directly because it saw another route
  do something similar
- broad cache invalidation appears because it is easier than
  understanding the dependency graph
- demo data, placeholder IDs, and temporary glue quietly become
  production-shaped behaviour
- the next session treats all of that as precedent

This post is the practical version of that system. I'll cover the
layers I use, why they exist, where they should be strict, where they
should start as warnings, and a few examples toward the end that you
can steal without building my exact setup.

## Prompting harder is not the solution

If the only thing stopping the model from making a mess is you typing
"please follow the architecture" again, you do not have a workflow.
You have a babysitting job.

LLMs are very good at local optimisation. They look at the current
file, the nearest import, the most obvious pattern, and the shape of
the user's request. Then they move fast.

That is useful when the local pattern is good.

It is dog shite when the local pattern is temporary, legacy, copied
from a spike, or just wrong.

So the guardrails have to live in places the model cannot politely
forget:

- the tool boundary, before code is written
- lint rules, while the diff is still small
- architecture checks, before bad imports become normal
- docs retrieval, before the model invents business rules
- validation scripts, before a handoff says "done"

That is the difference between advice and pressure.

Advice says "try not to use `$effect`".

Pressure says "this `.svelte` file was not modified because the write
contained `$effect`; rewrite it with `$derived`, an event handler, an
action, or a lifecycle API".

One of those scales. The other one becomes review debt.

## The receipts

I queried my Pi session history for one private production codebase
where I've been deliberately building this system.

Across 350 sessions:

- boundary checks appeared in 199 sessions
- boundary checks failed in 39 sessions
- boundary checks passed in 65 sessions after fixes
- LSP diagnostics appeared in 224 sessions
- Svelte checks appeared in 208 sessions
- local docs retrieval appeared in 271 sessions
- project skill files appeared in 278 sessions

Those numbers are not a benchmark. They're just receipts that the
rails were in the normal path, not some dusty document nobody used.

The useful bit is that the failures were real. The checks caught
things like:

- route files importing database access directly instead of calling a
  server service or command
- browser-side route code mutating domain objects directly
- route files generating business identifiers locally instead of using
  server commands or database identifiers
- demo data and placeholder identities leaking into production-shaped
  paths
- remote function files putting schemas and handlers in the wrong
  place
- route components and state modules getting too large and mixed
  concern
- broad cache invalidation instead of targeted invalidation
- file naming and identifier naming drift
- unexplained Svelte effects

That is what I want from AI-assisted development.

Not a model that never makes mistakes. That does not exist.

I want a system where common mistakes are cheap, loud, and boring to
fix.

## Guardrail 1: block bad writes before they land

The most obvious example for me is Svelte's `$effect`.

LLMs love `$effect`.

It looks familiar to them. It smells like React's effect hook. It is
an easy escape hatch when the model has not bothered to understand
whether the value should be derived, handled in an event, pushed into
a action, or dealt with through lifecycle code.

The problem is that once `$effect` lands, it becomes a pattern. The
next session sees it. Then another one copies it. Then the codebase
has five bits of hidden synchronisation and everyone is pretending
that is fine.

So I added a guardrail to `my-pi` for this:

```sh
pi install npm:@spences10/pi-svelte-guardrails
```

The package watches agent tool calls. If an agent tries to write,
edit, or bash-write a `.svelte` file containing `$effect`, the tool
call can be blocked before the file is created or modified.

The important part is the timing.

This is not a review comment after the bad code exists. It is not a
note in a style guide. It is not "remember, please prefer `$derived`".

It is the tool saying no.

The config shape is deliberately boring:

```txt
mode: block
rule: block_svelte_effect
allow:
  - examples/**
  - legacy/**
```

That gives you three useful adoption modes:

- `block` when the repo is ready to enforce it
- `warn` when you want to observe the drift first
- `off` when the project intentionally allows the pattern

The blocked message also matters. It should tell the model exactly
what happened:

```txt
The file was not created or modified. Rewrite the change without
$effect. Prefer $derived, event handlers, actions, or lifecycle APIs.
Do not report success until the replacement file is actually written.
```

That last sentence is doing work.

Agents are very good at saying "done" after a failed tool call. The
guardrail has to make the failed write explicit so the model continues
the task instead of summarising imaginary progress.

And this is not Svelte-specific as an idea. Anyone can build the same
kind of Pi plugin for their own stack:

```ts
if (tool_name === 'write' || tool_name === 'edit') {
	if (
		target_path.ends_with('.svelte') &&
		content.includes('$effect')
	) {
		return {
			block: true,
			reason:
				'Rewrite without $effect. Use derived state or an event handler.',
		}
	}
}
```

Swap `$effect` for whatever your team keeps fighting:

- forbidden framework APIs
- deprecated imports
- unsafe server/client boundaries
- direct database access
- broad cache invalidation
- generated files agents should not touch

The point is not that `$effect` is evil. The point is that repeated
review comments are a bad way to enforce rules you already know you
want.

## Guardrail 2: make project taste executable

Tool-call blocking is great for patterns you want to stop immediately.
For everything else, I like custom lint rules.

Generic linting catches generic mistakes. It does not know your
project's taste.

It does not know that your project-owned identifiers should be
`snake_case`, that file names should be kebab-case, that broad cache
invalidation should not be used casually, or that a Svelte effect
needs an explanation if it is genuinely allowed.

So encode that.

A tiny project lint plugin can enforce rules like:

```txt
project/snake-case-identifiers
project/kebab-case-file-names
project/require-effect-explanation
project/no-invalidate-all
```

The `$effect` rule can be more nuanced at the lint layer than the tool
layer. For example, if your repo allows effects in rare cases, require
a nearby comment explaining the browser-side side effect:

```txt
Allowed effect: sync a browser-only subscription after the component is
mounted. Prefer derived state or event handlers everywhere else.
```

That comment requirement does two things.

First, it makes the human author justify the escape hatch.

Second, it gives future LLM sessions a better example to copy. The
model sees that effects are not just thrown around. They come with a
reason.

Same thing for broad invalidation. The model does not need a
philosophical discussion about cache invalidation. It needs the repo
to reject the lazy option and point at the expected one.

That is not fancy. That is why it works.

## Guardrail 3: boundary checks for architecture drift

Lint rules are good for per-file patterns.

Architecture drift usually needs more context.

For that, I like a boring `tools/check-boundaries.ts` script that runs
as part of `pnpm check`.

The script scans tracked source files and fails on project-specific
boundary violations. Things like:

```txt
routes must not import database internals
packages must not import from apps
client route code must not mutate domain entities
schema, migration, and seed SQL must live in the database package
remote function files must delegate to colocated helpers
services must not import commands
commands must not depend on page/read services
```

That sounds heavy until you realise most of it is just string checks,
file paths, and a bit of TypeScript AST traversal.

A blunt first version is enough:

```ts
const forbidden_imports = [
	{
		from_path: /^src\/routes\//,
		specifier: /^\$lib\/server\/db|^@acme\/db/,
		message:
			'Routes must not import database access directly; call a server service or command.',
	},
]
```

Then wire it into the normal path:

```json
{
	"scripts": {
		"check:boundaries": "node tools/check-boundaries.ts",
		"check": "pnpm check:boundaries && pnpm -r --if-present check"
	}
}
```

Now the model cannot honestly claim the work is complete if it crossed
a boundary.

The best boundary checks are usually born from pain. Do not sit down
and design a perfect architecture rule engine. Start with the thing
the model keeps doing wrong.

For me, useful checks have included the following.

### Direct database access from routes

Routes are tempting. The model is already in a `+page.server.ts` file,
it sees a data need, and it reaches for the database.

That is exactly how route files become orchestration soup.

The guardrail says routes call services or commands. Database access
lives behind the server boundary where it can be tested, authorised,
and reused.

### Domain mutation in browser-side route code

A model will quite happily mutate the local object if it makes the UI
update.

That might make a demo feel alive, but on a real app it skips the
server command, audit event, permissions, validation, and persistence
path.

So the boundary check looks for assignments and mutating array methods
on known domain roots in route files. If it finds them, it fails with
a boring message:

```txt
Route files must not mutate domain objects; use server commands.
```

Again, not clever. Useful.

### Demo data leaking into real paths

LLMs love placeholder data. Fake email domains, avatar services,
synthetic attachments, seeded arrays in route components. Fine for a
mockup. Dangerous when the file is production-shaped.

A guardrail can block those patterns unless the file has an explicit
allow comment with a replacement note.

That turns demo leakage from "oops, missed it in review" into "the
check failed before handoff".

### Remote function shape

If you're using SvelteKit remote functions, the model will often put
schemas, handlers, and remote bindings wherever it happens to be
editing.

A boundary check can enforce the shape:

```txt
*.remote.ts may only export remote bindings
*.remote.ts imports only the framework server API and its helper
schemas and handlers live in a colocated helper
helpers have colocated tests
```

That keeps the server-safe shape predictable. More importantly, it
keeps future examples clean for the next agent session.

### Architecture advisories

Not everything should be a hard failure on day one.

For large route components and state modules, I prefer advisories
first:

```txt
route component complexity: 350 lines, 7 state declarations, 5 forms,
8 buttons; consider extracting actions, state, or sections
```

The check can pass while still making the smell visible. Later, when
the team is ready, a strict mode can promote advisories to hard
failures:

```sh
STRICT_ARCHITECTURE=1 pnpm check:boundaries
```

That gives you a ratchet. Warn first. Fix opportunistically. Enforce
once the pattern is understood.

## Guardrail 4: make docs queryable and citable

Docs are not enough.

I know that sounds grim, but it is true. LLMs skim. They read the
first heading, decide they understand the architecture, then
confidently invent the rest.

The useful pattern is not "we have docs".

The useful pattern is "the agent has a repeatable way to retrieve the
right docs before making a risky change".

I do not care whether that is SQLite FTS, ripgrep, a wiki, embeddings,
or something else. The mechanics can be simple:

```sh
pnpm docs:search "permission model"
pnpm docs:context "server command audit events"
pnpm docs:show docs/specs/permissions.md:42
```

The important part is the rule around it:

> If the work touches business rules, permissions, data flow, release
> behaviour, or calculations, cite the source-of-truth doc before
> implementing.

Not "I checked the docs".

The actual file. The actual section. The actual decision.

This catches a lot of hallucinated implementation because the model
has to ground the change in something outside its own confident
waffle.

It also gives reviewers a much better handoff:

```txt
Changed the approval command to follow docs/specs/approval-flow.md,
section "Broker approval handoff". Validation now happens before the
audit event is written, matching the documented lifecycle.
```

That is reviewable.

Compare that with:

```txt
Updated the approval flow.
```

No thanks.

## Guardrail 5: skills for repeated work

A skill is not a magic prompt. It is a small playbook for a repeated
workflow.

The bad version is:

```txt
# Be a good developer

Write clean code. Follow best practices. Test your work.
```

That is useless.

The useful version is narrow:

```txt
# Service layer changes

Use this when changing server data access.

- Routes read request context and call services.
- Services own read models and orchestration.
- Commands own mutations and audit events.
- Do not put SQL in route files.
- Add or update tests for command behaviour.
- Run `pnpm check:boundaries` before handoff.
```

Now the model has a concrete lane.

The reason this matters is that LLM sessions do not share judgement.
One session might learn the right pattern after three failed attempts,
but unless you write it down, the next session starts from vibes
again.

Project skills turn those little lessons into reusable operating
procedure.

That is especially useful for:

- branch and worktree flow
- service-layer changes
- module boundaries
- Svelte reactivity
- release verification
- fixture generation
- docs and traceability updates
- avoiding another session's in-progress work

Again, the point is not more words. The point is fewer repeated
mistakes.

## Guardrail 6: handoff checks that stop fake done

Agents love a confident handoff.

Sometimes it is deserved. Sometimes the last command failed, there are
untracked files everywhere, and the model is still saying "all set".

So the handoff needs rails too.

A simple `docs/agent-handoff.md` can do a lot:

```txt
Before handing off:

1. Run `git status --short`.
2. State which files changed and why.
3. Run the narrowest relevant check.
4. Run the full project check before claiming done.
5. Run LSP diagnostics for changed TypeScript/Svelte files.
6. Mention warnings, skipped checks, or known risks.
```

This is not glamorous. It works because it removes ambiguity.

For release-shaped work, bundle the checks:

```json
{
	"scripts": {
		"release:verify": "pnpm check && pnpm build && pnpm test:unit && pnpm evals:synthetic"
	}
}
```

If the app has generated artefacts, exported client builds, generated
infrastructure, or sanitised release repos, add verification scripts
for those too.

Examples I like:

- `audit:route-data` to find duplicated service loads between layouts
  and pages
- `config:check` to validate runtime mode and required env names
  without printing secret values
- `release:verify-export` to ensure internal docs, agent files, build
  output, and private keys did not leak into a client-facing export
- synthetic evals for repeatable ingestion or AI/data behaviour
- fixture generation so the model tests with controlled data instead
  of inventing whatever it needs

That is the layer most teams skip.

They add lint, maybe tests, then still let the agent summarise the
work with no proof. The final handoff is part of the system. Treat it
like one.

## Examples you can steal this week

You do not need to build a whole internal platform.

Start with one guardrail per failure mode.

### Stop one repeated framework mistake

If agents keep writing a pattern you hate, block or warn on it at the
tool boundary.

For Svelte, that might be `$effect` in `.svelte` writes.

For another stack it might be:

- effect hooks without clear dependencies
- direct fetch calls outside your API client
- importing server-only modules from client code
- writing to generated files
- using a deprecated component library path

Start in `warn` mode if you are nervous. Move to `block` when the
false positives are understood.

### Add one architecture check

Pick the rule you are tired of repeating in review.

```txt
Routes must not import database internals.
```

Implement that one. Wire it into `pnpm check`. Do not wait for the
perfect AST version.

A slightly blunt check that catches a real mistake is better than a
beautiful architecture diagram the model ignores.

### Require explanations for escape hatches

Some patterns are allowed, but only with context.

That is where explanation rules help:

```txt
If `$effect` is used, a nearby comment must explain the browser-side
side effect. Prefer derived state or event handlers otherwise.
```

This makes the exception visible and gives future agents a better
example.

### Make docs retrieval mandatory for risky work

Add a rule:

```txt
For permissions, calculations, release behaviour, audit events, or data
flow changes, cite the source-of-truth doc before implementing.
```

Then enforce it in review and handoff. If there is no source-of-truth
doc, that is the finding.

### Add advisories before hard failures

If a rule is useful but too noisy, make it an advisory first.

Large route component? Advisory.

Too many actions in a route server file? Advisory.

Huge state module? Advisory.

Then add a strict mode when you are ready.

This keeps the system humane. Guardrails should reduce review debt,
not create a different flavour of misery.

## The trade-off

Guardrails can be annoying.

They will catch things that are technically fine. They will need
allowlists. They will occasionally block a clever solution because the
rule is deliberately boring.

That is the trade.

But I'll take a few boring false positives over a codebase where every
AI session gets to invent the architecture again.

The trick is to keep the rules close to observed failure modes.

Do not encode your entire engineering philosophy. Encode the stuff the
model actually keeps getting wrong.

When a review comment repeats three times, consider making it a rule.
When a rule is noisy, make it an advisory. When an advisory keeps
catching real problems, promote it. When a rule stops earning its
keep, delete it.

This is not bureaucracy. It is maintenance of the path.

## The point

LLMs make teams faster, but speed compounds the system around it.

If your repo has no memory, no source of truth, no examples, no
validation, and no automated way to say "no, that crosses a boundary",
the model will still move fast.

It will just move fast in every direction.

The goal is not to stop the LLM writing code.

The goal is to stop it turning every local shortcut into tomorrow's
architecture.

Put the guardrails where the model has to hit them:

- before bad code is written
- before bad imports become normal
- before docs are invented from vibes
- before handoff claims success
- before the next session copies the mistake

That is how you keep the useful part of AI-assisted development
without drowning the team in cleanup.

Make the right path easier to follow than the wrong one.
