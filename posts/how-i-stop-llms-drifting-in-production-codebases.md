---
date: 2026-06-21
updated: 2026-08-25
title: How I Stop LLMs Drifting In Production Codebases
tags: ['pi', 'my-pi', 'svelte', 'guide', 'notes']
published: true
---

<!-- cSpell:ignore LLMs SvelteKit my-pi oxlint guardrails worktree handoff handoffs allowlist toolcall toolcalls FTS PRs mockup pravatar -->

The problem I care about with LLM coding is drift: one plausible
shortcut gets copied, then future sessions start treating it as how
the app works. I've used AI coding tools every day as a team lead on
large private client codebases, across features, bug fixes, refactors,
reviews, and more recently a finance workflow processing more than
$20m a month in capital. When the app has audit trails, permissions,
calculations, generated documents, client workflows, and operational
handoffs, "prompt harder" is not an engineering system. What works for
me is guardrails in the repo: checks, docs, lint rules, tool-call
blockers, and handoff validation that stop the model drifting before
the mistake becomes normal. It is the guardrail layer of the broader
[agentic engineering workflow](/posts/agentic-engineering-practical-guide)
I now use.

That starts with establishing good patterns first. LLMs are pattern
followers before they are engineers. They look for the nearest example
that appears to work, then continue from there. If the repo is full of
clean service boundaries, narrow components, cited docs, targeted
invalidation, and boring validation commands, the model has something
useful to copy. If the repo is full of shortcuts, the model will copy
those too, just faster.

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

For a long time the only thing stopping the model from making a mess
was me typing "please follow the architecture" again. That is not a
workflow. That is me supervising a process, and I have already done
enough of that.

LLMs are very good at local optimisation. They look at the current
file, the nearest import, the most obvious pattern, and the shape of
the request. Then they move fast. That is useful when the local
pattern is good, and dog shite when the local pattern is temporary,
legacy, copied from a spike, or just wrong.

So I moved the guardrails to places the model cannot politely forget:

- the tool boundary, before code is written
- lint rules, while the diff is still small
- architecture checks, before bad imports become normal
- docs retrieval, before the model invents business rules
- validation scripts, before a handoff says "done"

That is the difference between advice and pressure. Advice says "try
not to use `$effect`". Pressure says "this `.svelte` file was not
modified because the write contained `$effect`; rewrite it with
`$derived`, an event handler, an action, or a lifecycle API". One of
those scales, the other becomes review debt.

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
rails were in the normal path.

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

That is what I want from AI-assisted development. Not a model that
never makes mistakes, because that does not exist, but a system where
common mistakes are cheap, loud, and boring to fix.

## Guardrail 1: block bad writes before they land

The most obvious example for me is Svelte's `$effect`. LLMs love it.
It looks familiar to them, it smells like React's effect hook, and it
is an easy escape hatch when the model has not worked out whether the
value should be derived, handled in an event, pushed into an action,
or dealt with through lifecycle code.

The problem is that once `$effect` lands, it becomes a pattern. The
next session sees it. Then another one copies it. Then the codebase
has five examples of using it, which sets the pattern going forward.

I watched this happen in a production session. The agent found two
components using `$state` and `$effect`, treated them as the
established pattern, then used the same approach in three more
components. A few minutes later, another `$effect` appeared to move a
value into form state.

The individual changes looked reasonable in isolation. The problem was
the direction of travel. Each new example made the pattern look more
intentional to the next session, which meant I was having the same
conversation again instead of improving the codebase.

So I added a guardrail to `my-pi` for this:

```sh
pi install npm:@spences10/pi-svelte-guardrails
```

The package watches agent tool calls. If an agent tries to write,
edit, or bash-write a `.svelte` file containing `$effect`, the tool
call can be blocked before the file is created or modified.

The important part is the timing. This is not a review comment after
the bad code exists. It's not a hook to "remember, please prefer
`$derived`". It is the harness not allowing the code to be written.

The config shape:

```txt
mode: block
rule: block_svelte_effect
allow:
  - examples/**
  - legacy/**
```

That gives me three adoption modes:

- `block` when the repo is ready to enforce it
- `warn` when I want to observe the drift first
- `off` when the project intentionally allows the pattern

The blocked message also matters. It should tell the model exactly
what happened:

```txt
The file was not created or modified. Rewrite the change without
$effect. Prefer $derived, event handlers, actions, or lifecycle APIs.
Do not report success until the replacement file is actually written.
```

The wording came from testing the first version. The guardrail blocked
the write correctly, but the agent still reported that it had created
the file. In another test, it started investigating the block rather
than carrying on with one of the suggested alternatives.

That showed me the message needed to do more than explain the rule. It
also needed to describe the result of the tool call and give the agent
a clear next step. The code stopped the write; the extra context
helped the agent recover and continue the task.

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
		};
	}
}
```

Swap `$effect` for whatever the team keeps fighting over:

- forbidden framework APIs
- deprecated imports
- unsafe server/client boundaries
- direct database access
- broad cache invalidation
- generated files agents should not touch

I don't think `$effect` is evil. I think repeated prompts are a bad
way for me to enforce a rule I already know I want.

## Guardrail 2: make project taste executable

Tool-call blocking is great for patterns I want to stop immediately.
For everything else, I like custom lint rules.

Generic linting catches generic mistakes. It does not know the
project's taste: that project-owned identifiers should be
`snake_case`, that file names should be kebab-case, that broad cache
invalidation should not be used casually, or that a Svelte effect
needs an explanation if it is genuinely allowed. So I encode that.

Mine is an oxlint JS plugin with four rules:

```json
{
	"jsPlugins": ["./tools/oxlint-project-plugin.ts"],
	"rules": {
		"project/snake-case-identifiers": "error",
		"project/kebab-case-file-names": "error",
		"project/require-effect-explanation": "error",
		"project/no-invalidate-all": "error"
	}
}
```

The smallest one catches the broad-invalidation problem from that
list:

```ts
const no_invalidate_all = create_rule((context) => ({
	Identifier(node) {
		if (node.name !== 'invalidateAll') return;
		context.report({
			node,
			message:
				'Do not use invalidateAll; invalidate a targeted dependency/query instead.',
		});
	},
}));
```

The `$effect` rule can be more nuanced at the lint layer than the tool
layer. The tool boundary blocks the write outright. Lint lets the
effect through if there is a real explanation next to it:

```ts
const require_effect_explanation = create_rule((context) => ({
	CallExpression(node) {
		const callee = node['callee'];
		if (!is_identifier(callee) || callee.name !== '$effect') return;

		const comment_text = previous_comment_text(context, node);
		const has_explanation =
			/(\$effect|effect|allowed|browser|dom|sync|subscription|timer|analytics)/i.test(
				comment_text,
			) && comment_text.trim().length >= 24;

		if (has_explanation) return;
		context.report({
			node: callee,
			message:
				'$effect requires a nearby comment explaining the allowed browser-side side effect. Prefer $derived/event handlers otherwise.',
		});
	},
}));
```

`previous_comment_text` is just `sourceCode.getCommentsBefore(node)`
filtered to comments within three lines of the call. Two thresholds
are the whole rule: the comment has to match something effect-shaped,
and it has to be at least 24 characters. Without that length check
`// effect` would count as a justification.

So this passes:

```ts
// Allowed effect: sync a browser-only subscription after mount.
$effect(() => {
	const unsubscribe = client.subscribe(handle_update);
	return unsubscribe;
});
```

And `// effect` does not.

That comment requirement does two things. It makes the human author
justify the escape hatch, and it gives future LLM sessions a better
example to copy: the model sees that effects are not thrown around,
they come with a reason.

Same thing for broad invalidation. The model does not need a
philosophical discussion about cache invalidation. It needs the repo
to reject the lazy option and point at the expected one.

## Guardrail 3: boundary checks for architecture drift

Lint rules are good for per-file patterns. Architecture drift usually
needs more context.

For that, I like a `tools/check-boundaries.ts` script that runs as
part of `pnpm check`.

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

Most of that is just string checks, file paths, and a bit of
TypeScript AST traversal. There is no clever rule engine underneath.
It walks every import in every tracked file and runs a flat list of
`if` statements:

```ts
export function check_import_boundary(
	context: BoundaryContext,
	file: string,
	specifier: string,
) {
	if (
		is_web_route(file) &&
		(specifier === 'pg' ||
			specifier.startsWith('$lib/server/db/') ||
			specifier.startsWith('@acme/db'))
	) {
		report(
			context,
			file,
			specifier,
			'web routes must not import database access directly; call a server service or command',
		);
	}

	if (
		is_service_module(file) &&
		specifier.startsWith('$lib/server/commands/')
	) {
		report(
			context,
			file,
			specifier,
			'services are read/model assembly modules and must not import commands',
		);
	}

	if (/^@acme\/[^/]+\/src\//.test(specifier)) {
		report(
			context,
			file,
			specifier,
			'use the package public entrypoint instead of a deep @acme import',
		);
	}
}
```

`is_web_route` and `is_service_module` are path predicates in a
`path-rules.ts` file, and they are exactly as dumb as they sound.
Workspace-to-workspace rules need one extra step, resolving the
relative specifier before comparing:

```ts
if (!specifier.startsWith('.')) return;
const target = new URL(
	specifier,
	`file://${process.cwd()}/${file}`,
).pathname
	.slice(process.cwd().length + 1)
	.replace(/\/[^/]*$/, '');

if (
	workspace_of(file)?.startsWith('packages/') &&
	workspace_of(target)?.startsWith('apps/')
) {
	report(
		context,
		file,
		specifier,
		'packages must not import from apps',
	);
}
```

Then I wire it into the normal path:

```json
{
	"scripts": {
		"check:boundaries": "node tools/check-boundaries.ts",
		"check": "pnpm check:boundaries && pnpm -r --if-present check"
	}
}
```

With that in place, the model cannot claim the work is complete
without the check disagreeing.

My boundary checks were all born from pain. I did not sit down and
design a perfect architecture rule engine. I started with the thing
the model kept doing wrong, and the useful ones have been these.

### Direct database access from routes

Routes are tempting. The model is already in a `+page.server.ts` file,
it sees a data need, and it reaches for the database. That is exactly
how route files become orchestration soup.

The guardrail says routes call services or commands. Database access
lives behind the server boundary where it can be tested, authorised,
and reused.

### Domain mutation in browser-side route code

A model will quite happily mutate the local object if it makes the UI
update. That might make a demo feel alive, but on a real app it skips
the server command, audit event, permissions, validation, and
persistence path.

So the boundary check looks for assignments and mutating array methods
on known domain roots in route files. If it finds them, it fails with
a boring message:

```txt
Route files must not mutate domain objects; use server commands.
```

### Demo data leaking into real paths

LLMs love placeholder data. Fake email domains, avatar services,
synthetic attachments, seeded arrays in route components. Fine for a
mockup. Dangerous when the file is production-shaped.

This check is the least sophisticated thing in the repo and it has
earned its place. It is a list of regexes and a loop:

```ts
const demo_data_patterns: Array<[RegExp, string]> = [
	[
		/Placeholder capture/i,
		'placeholder capture path in route/component',
	],
	[
		/\bseed_cursor\b|\bdemo_seeds\b/i,
		'seed data construction in route/component',
	],
	[/\bnew_id\(/, 'generated business identifier in route/component'],
	[
		/i\.pravatar\.cc|example\.com/i,
		'placeholder external identity/source',
	],
];

export function check_route_demo_data(
	context: BoundaryContext,
	file: string,
	source: string,
) {
	if (!is_web_route(file)) return;
	if (file.endsWith('.test.ts')) return;
	if (source.includes('@allow-demo-data')) return;

	for (const [pattern, message] of demo_data_patterns) {
		if (pattern.test(source)) {
			report(
				context,
				file,
				pattern.toString(),
				`${message}; move business/demo data to seeds/config tables and read it through services, or add @allow-demo-data with a production replacement note`,
			);
		}
	}
}
```

The `new_id(` one matters more than it looks. A route generating its
own business identifier means the model skipped the server command
that was supposed to issue it.

The escape hatch is the `@allow-demo-data` comment, and it has to
carry a replacement note. That turns demo leakage from "oops, missed
it in review" into "the check failed before handoff".

### Remote function shape

With SvelteKit remote functions, the model will often put schemas,
handlers, and remote bindings wherever it happens to be editing. A
boundary check can enforce the shape:

```txt
*.remote.ts may only export remote bindings
*.remote.ts imports only the framework server API and its helper
schemas and handlers live in a colocated helper
helpers have colocated tests
```

That keeps the server-safe shape predictable. More importantly, it
keeps future examples clean for the next agent session.

### Architecture advisories

Not everything should be a hard failure on day one. For large route
components and state modules, I prefer advisories first.

The trick I landed on is not tripping on any single metric. I count a
few, then only advise when more than one is out of range:

```ts
const { lines, functions, state_declarations, forms, buttons } =
	svelte_complexity_metrics(context, source, source_file);

const concerns = [
	lines > 250,
	functions > 5,
	state_declarations > 6,
	forms > 2,
	buttons > 5,
].filter(Boolean).length;

if (concerns >= 2) {
	advise(
		context,
		file,
		`route component complexity (${lines} lines, ${functions} functions, ${state_declarations} $state calls, ${forms} forms, ${buttons} buttons); consider extracting actions/state/sections per docs/specs/sveltekit-entrypoint-rules.md`,
	);
}
```

A 300 line component that is otherwise simple stays quiet. A 300 line
component with eight buttons and three forms does not. The metrics
themselves are boring: `line_count`, a TypeScript AST walk counting
functions and `$state` calls, and `source.match(/<form\b/g)` for the
markup.

The advisory names the doc it wants you to read, which is the bit that
makes it useful to an agent rather than just to me.

The check can pass while still making the smell visible. Later, when
the team is ready, a strict mode promotes advisories to hard failures:

```sh
STRICT_ARCHITECTURE=1 pnpm check:boundaries
```

That gives me a ratchet: warn first, fix opportunistically, enforce
once the pattern is understood.

## Guardrail 4: make docs queryable and citable

Docs are not enough. LLMs skim. They read the first heading, decide
they understand the architecture, then confidently invent the rest.

So what I want is not "we have docs", it is "the agent has a
repeatable way to retrieve the right docs before making a risky
change".

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

Not "I checked the docs", but the actual file, the actual section, the
actual decision. That is the difference between a claim and evidence.

This catches a lot of hallucinated implementation, because the model
has to ground the change in something outside its own confident
waffle. It also gives reviewers a much better handoff:

```txt
Changed the approval command to follow docs/specs/approval-flow.md,
section "Approval handoff". Validation now happens before the
audit event is written, matching the documented lifecycle.
```

That is reviewable in a way that "updated the approval flow" never is.

## Guardrail 5: skills for repeated work

A skill is not a magic prompt. It is a small playbook for a repeated
workflow, and the value is entirely in how narrow it is. "Write clean
code, follow best practices, test your work" is wallpaper. This is
not:

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

That matters because LLM sessions do not share judgement. One session
might learn the right pattern after three failed attempts, but unless
I write it down, the next session starts from vibes again. Project
skills turn those little lessons into reusable operating procedure,
and I lean on them most for:

- branch and worktree flow
- service-layer changes
- module boundaries
- Svelte reactivity
- release verification
- fixture generation
- docs and traceability updates
- avoiding another session's in-progress work

## Guardrail 6: handoff checks that require evidence

Agents love a confident handoff. Sometimes it is deserved. Sometimes
the last command failed, there are untracked files everywhere, and the
model is still saying "all set". So the handoff needs rails too, and a
simple `docs/agent-handoff.md` does a lot of that work:

```txt
Before handing off:

1. Run `git status --short`.
2. State which files changed and why.
3. Run the narrowest relevant check.
4. Run the full project check before claiming done.
5. Run LSP diagnostics for changed TypeScript/Svelte files.
6. Mention warnings, skipped checks, or known risks.
```

Not glamorous, but it removes the ambiguity. For release-shaped work,
I bundle the checks:

```json
{
	"scripts": {
		"release:verify": "pnpm check && pnpm build && pnpm test:unit && pnpm evals:synthetic"
	}
}
```

If the app has generated artefacts, exported client builds, generated
infrastructure, or sanitised release repos, those get verification
scripts too. The ones I keep reaching for:

- `audit:route-data` to find duplicated service loads between layouts
  and pages
- `config:check` to validate runtime mode and required env names
  without printing secret values
- `release:verify-export` to ensure internal docs, agent files, build
  output, and private keys did not leak into a client-facing export
- synthetic evals for repeatable ingestion or AI/data behaviour
- fixture generation so the model tests with controlled data instead
  of inventing whatever it needs

That is the layer I skipped for longest. Lint, some tests, then still
letting the agent summarise the work with no evidence behind it. The
final handoff is part of the system, and I treat it like one now. It's
the same instinct behind
[how I work with LLMs](/posts/how-i-work-with-llms): validate the
claim, not the effort.

## Examples you can steal this week

None of this needed a whole internal platform up front. I added one
guardrail per failure mode, roughly in this order.

### Stop one repeated framework mistake

If agents keep writing a pattern you hate, block or warn on it at the
tool boundary. For Svelte, mine was `$effect` in `.svelte` writes. For
another stack it might be:

- effect hooks without clear dependencies
- direct fetch calls outside your API client
- importing server-only modules from client code
- writing to generated files
- using a deprecated component library path

Start in `warn` mode if you are nervous. Move to `block` when the
false positives are understood.

### Add one architecture check

Pick the rule you are tired of repeating in review. Mine was this one:

```txt
Routes must not import database internals.
```

Implement that one and wire it into `pnpm check`. I did not wait for
the perfect AST version. A slightly blunt check that catches a real
mistake beats a beautiful architecture diagram the model ignores.

### Require explanations for escape hatches

Some patterns are allowed, but only with context, and that is where
explanation rules help:

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

If a rule is useful but too noisy, make it an advisory first. Large
route components, too many actions in a route server file, a huge
state module: all advisories to start with. Then add a strict mode
when the team is ready.

That keeps the system humane. Guardrails should reduce review debt,
not create a different flavour of misery.

## The trade-off

Guardrails can be annoying. They catch things that are technically
fine. They need allowlists. They occasionally block a clever solution
because the rule is deliberately boring.

That is the trade, and I'll take a few boring false positives over a
codebase where every AI session gets to invent the architecture again.

The trick is keeping the rules close to observed failure modes. I do
not encode my entire engineering philosophy. I encode the stuff the
model actually keeps getting wrong.

When a review comment repeats three times, I make it a rule. When a
rule turns out to be noisy, I drop it to an advisory. When an advisory
keeps catching real problems, I promote it. When a rule stops earning
its keep, I delete it.

That is not bureaucracy. It is maintenance of the path.

## The point

LLMs make teams faster, but speed compounds the system around it.

If the repo has no memory, no source of truth, no examples, no
validation, and no automated way to say "no, that crosses a boundary",
the model will still move fast. It will just move fast in every
direction.

I am not trying to stop the LLM writing code. I am trying to stop it
turning every local shortcut into tomorrow's architecture.

So the guardrails go where the model has to hit them:

- before bad code is written
- before bad imports become normal
- before docs are invented from vibes
- before handoff claims success
- before the next session copies the mistake

That is how I keep the useful part of AI-assisted development without
drowning the team in cleanup.

Make the right path easier to follow than the wrong one.
