<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';

	type ModeId = 'tools' | 'client' | 'server';
	type Wire = 0 | 1 | 2; // model↔pi, pi↔mcp, mcp↔providers
	type Packet = {
		wire: Wire;
		dir: 1 | -1; // 1 = rightward/downward, -1 = back towards the model
		start: number;
		count: number;
		kind: 'call' | 'raw' | 'summary' | 'script';
		label: string;
	};

	const nodes = [
		{ id: 'model', name: 'Model', detail: 'the LLM' },
		{ id: 'pi', name: 'Pi', detail: 'harness' },
		{ id: 'mcp', name: 'MCP', detail: 'Omnisearch' },
		{ id: 'providers', name: 'Providers', detail: 'Tavily, Exa' },
	] as const;

	const wire_names = [
		'Model ↔ Pi',
		'Pi ↔ MCP server',
		'MCP server ↔ providers',
	];

	const modes: {
		id: ModeId;
		name: string;
		runs_at: number;
		blurb: string;
	}[] = [
		{
			id: 'tools',
			name: 'Individual MCP tools',
			runs_at: 0,
			blurb:
				'The model is the loop. Every result comes back to it, and it writes the next call.',
		},
		{
			id: 'client',
			name: 'Pi code mode',
			runs_at: 1,
			blurb:
				'The model writes one script. Pi runs it and calls each MCP tool for it.',
		},
		{
			id: 'server',
			name: 'Server code mode',
			runs_at: 2,
			blurb:
				'The model writes one script. One MCP execution runs it beside the provider adapters.',
		},
	];

	let mode = $state<ModeId>('tools');
	let pages = $state(4);
	let parallel = $state(false);
	let discover = $state(false);

	function build(
		mode: ModeId,
		pages: number,
		parallel: boolean,
		discover: boolean,
	) {
		const packets: Packet[] = [];
		let t = 0;
		const push = (
			wire: Wire,
			dir: 1 | -1,
			kind: Packet['kind'],
			label: string,
			count = 1,
			at = t,
		) => packets.push({ wire, dir, start: at, count, kind, label });

		// Each provider call is a search, then pages extractions.
		// In parallel mode, extractions share a wave once search is done.
		const waves = parallel
			? [1, pages]
			: [1, ...Array.from({ length: pages }, () => 1)];
		const wave_label = (i: number, n: number) =>
			i === 0
				? 'search'
				: n > 1
					? `extract × ${n}`
					: `extract page ${i}`;

		if (mode === 'tools') {
			waves.forEach((n, i) => {
				const what = wave_label(i, n);
				push(0, 1, 'call', `Model writes the ${what} call`, n);
				t++;
				push(
					1,
					1,
					'call',
					`Pi sends the ${what} call to the MCP server`,
					n,
				);
				t++;
				push(
					2,
					1,
					'call',
					`MCP server calls the provider: ${what}`,
					n,
				);
				t++;
				push(2, -1, 'raw', `Provider returns the ${what} result`, n);
				t++;
				push(
					1,
					-1,
					'raw',
					`MCP server returns the full ${what} result`,
					n,
				);
				t++;
				push(
					0,
					-1,
					'raw',
					`The full ${what} result lands in the model's context`,
					n,
				);
				t++;
			});
			return packets;
		}

		if (discover) {
			if (mode === 'client') {
				push(0, 1, 'call', 'Model asks Pi for the tool signatures');
				t++;
				push(0, -1, 'summary', 'Pi answers from local tool metadata');
				t++;
			} else {
				push(0, 1, 'call', 'Model looks up the code-mode signatures');
				t++;
				push(1, 1, 'call', 'Pi calls the MCP search tool');
				t++;
				push(
					1,
					-1,
					'summary',
					'MCP server returns matching signatures',
				);
				t++;
				push(
					0,
					-1,
					'summary',
					'Signatures land in the model’s context',
				);
				t++;
			}
		}

		push(
			0,
			1,
			'script',
			'Model writes the whole workflow as one script',
		);
		t++;

		if (mode === 'client') {
			waves.forEach((n, i) => {
				const what = wave_label(i, n);
				push(
					1,
					1,
					'call',
					`The script calls the ${what} tool through MCP`,
					n,
				);
				t++;
				push(
					2,
					1,
					'call',
					`MCP server calls the provider: ${what}`,
					n,
				);
				t++;
				push(2, -1, 'raw', `Provider returns the ${what} result`, n);
				t++;
				push(
					1,
					-1,
					'raw',
					`The full ${what} result stays in Pi’s script`,
					n,
				);
				t++;
			});
		} else {
			push(
				1,
				1,
				'script',
				'Pi sends the script to the MCP execute tool',
			);
			t++;
			waves.forEach((n, i) => {
				const what = wave_label(i, n);
				push(
					2,
					1,
					'call',
					`The script calls the provider: ${what}`,
					n,
				);
				t++;
				push(
					2,
					-1,
					'raw',
					`The ${what} result stays in the server’s script`,
					n,
				);
				t++;
			});
			push(1, -1, 'summary', 'MCP server returns only the summaries');
			t++;
		}

		push(
			0,
			-1,
			'summary',
			'Only the summaries land in the model’s context',
		);
		return packets;
	}

	function stats(packets: Packet[]) {
		const crossings = [0, 0, 0];
		let raw_to_model = 0;
		let model_turns = 0;
		for (const p of packets) {
			crossings[p.wire] += p.count;
			if (p.wire === 0 && p.dir === 1) model_turns++;
			if (p.wire === 0 && p.dir === -1 && p.kind === 'raw')
				raw_to_model += p.count;
		}
		const steps = Math.max(...packets.map((p) => p.start + 1));
		return { crossings, raw_to_model, model_turns, steps };
	}

	let packets = $derived(build(mode, pages, parallel, discover));
	let total = $derived(stats(packets).steps);
	let comparison = $derived(
		modes.map((m) => ({
			...m,
			...stats(build(m.id, pages, parallel, discover)),
		})),
	);
	let current_mode = $derived(modes.find((m) => m.id === mode)!);

	// Playback. `t` is in steps; whole numbers are packet boundaries.
	let t = $state(Infinity);
	let playing = $state(false);
	let stepping = $state(false);
	let frame = 0;
	let last = 0;
	const step_ms = 420;

	let now = $derived(Math.min(t, total));
	let active = $derived(
		packets.filter((p) => now >= p.start && now < p.start + 1),
	);
	let done = $derived(packets.filter((p) => now >= p.start + 1));
	let crossed = $derived(
		[0, 1, 2].map((w) =>
			done
				.filter((p) => p.wire === w)
				.reduce((sum, p) => sum + p.count, 0),
		),
	);
	let context = $derived(
		done.filter((p) => p.wire === 0 && p.dir === -1),
	);
	let context_raw = $derived(
		context
			.filter((p) => p.kind === 'raw')
			.reduce((s, p) => s + p.count, 0),
	);
	let context_summary = $derived(
		context
			.filter((p) => p.kind !== 'raw')
			.reduce((s, p) => s + p.count, 0),
	);
	let caption = $derived(
		now >= total
			? `Done in ${total} steps. ${stats(packets).raw_to_model ? `${stats(packets).raw_to_model} full results reached the model.` : 'Only summaries reached the model.'}`
			: active.length
				? active[active.length - 1].label
				: 'Ready',
	);
	let busy_nodes = $derived(
		new Set(active.map((p) => (p.dir === 1 ? p.wire + 1 : p.wire))),
	);

	function stop() {
		cancelAnimationFrame(frame);
		playing = false;
	}

	function tick(ts: number) {
		if (!last) last = ts;
		t = Math.min(total, t + (ts - last) / step_ms);
		last = ts;
		if (t < total) frame = requestAnimationFrame(tick);
		else playing = false;
	}

	function play() {
		stepping = false;
		if (playing) return stop();
		if (prefersReducedMotion.current) {
			t = total;
			return;
		}
		if (t >= total) t = 0;
		playing = true;
		last = 0;
		frame = requestAnimationFrame(tick);
	}

	function step() {
		stop();
		stepping = true;
		// Land half-way along the wire so the packet is visible without motion.
		const next = t >= total ? 0 : Math.floor(t + 0.5) + 0.5;
		t = Math.min(total, next);
	}

	function reset_view() {
		stop();
		stepping = false;
		t = Infinity;
	}

	function rewind() {
		stop();
		stepping = false;
		t = 0;
	}

	$effect(() => () => cancelAnimationFrame(frame));
</script>

<section
	class="not-prose boundaries rounded-xl border border-base-content/20 bg-base-100 p-4 text-base-content antialiased sm:p-6"
	aria-labelledby="code-mode-boundaries-title"
>
	<header class="grid gap-2">
		<p
			class="text-sm font-semibold tracking-wide text-base-content/70 uppercase"
		>
			Illustration · counts, not timings
		</p>
		<h3
			id="code-mode-boundaries-title"
			class="text-xl font-semibold text-balance"
		>
			Which boundaries does each call cross?
		</h3>
		<p class="text-pretty">
			Search once, extract {pages}
			{pages === 1 ? 'page' : 'pages'}, return short summaries. Pick
			where the loop runs and watch what crosses each line.
		</p>
	</header>

	<fieldset class="mt-5" onchange={reset_view}>
		<legend class="sr-only">Where the loop runs</legend>
		<div class="modes" role="presentation">
			{#each modes as m (m.id)}
				<label class="mode" class:selected={mode === m.id}>
					<input
						class="sr-only"
						type="radio"
						name="code-mode-boundaries-mode"
						value={m.id}
						bind:group={mode}
					/>
					<span class="font-semibold">{m.name}</span>
					<span class="text-sm opacity-75"
						>Loop runs in {nodes[m.runs_at].name}</span
					>
				</label>
			{/each}
		</div>
	</fieldset>

	<p class="mt-3 min-h-12 text-pretty">{current_mode.blurb}</p>

	<!-- Diagram -->
	<div
		class="diagram mt-2"
		role="img"
		aria-label={`${current_mode.name}: ${wire_names.map((w, i) => `${w} ${stats(packets).crossings[i]} crossings`).join(', ')}.`}
	>
		{#each nodes as node, i (node.id)}
			<div
				class="node"
				class:runs={current_mode.runs_at === i}
				class:busy={busy_nodes.has(i)}
			>
				{#if current_mode.runs_at === i}
					<div class="runs-badge">
						{i === 0 ? 'loop' : 'script'}
					</div>
				{/if}
				<div class="font-semibold">{node.name}</div>
				<div class="text-sm opacity-75">{node.detail}</div>
			</div>
			{#if i < 3}
				<div class="wire" data-wire={i}>
					<div class="line"></div>
					{#each active.filter((p) => p.wire === i) as p (p.start + p.kind + p.dir)}
						{@const prog = Math.min(1, now - p.start)}
						<span
							class="packet"
							data-kind={p.kind}
							style:--p={p.dir === 1 ? prog : 1 - prog}
						>
							{#if p.count > 1}<b>×{p.count}</b>{/if}
						</span>
					{/each}
					<div class="tally tabular-nums">
						<span class="text-lg font-semibold">{crossed[i]}</span>
						<span class="text-xs opacity-75"
							>{crossed[i] === 1 ? 'crossing' : 'crossings'}</span
						>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<div class="context mt-5">
		<div
			class="flex flex-wrap items-baseline justify-between gap-x-4"
		>
			<span class="font-medium">In the model’s context</span>
			<span class="text-sm tabular-nums opacity-75"
				>{context_raw} full {context_raw === 1 ? 'result' : 'results'} ·
				{context_summary}
				{context_summary === 1 ? 'summary' : 'summaries'}</span
			>
		</div>
		<div class="context-stack mt-2" aria-hidden="true">
			{#each context as p, k (k)}
				{#each { length: p.count } as _, j (j)}
					<span data-kind={p.kind}></span>
				{/each}
			{/each}
		</div>
	</div>

	<ul
		class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm"
		aria-label="Packet legend"
	>
		<li class="flex items-center gap-2">
			<span class="swatch" data-kind="call"></span> Call
		</li>
		<li class="flex items-center gap-2">
			<span class="swatch" data-kind="script"></span> Script
		</li>
		<li class="flex items-center gap-2">
			<span class="swatch" data-kind="raw"></span> Full result
		</li>
		<li class="flex items-center gap-2">
			<span class="swatch" data-kind="summary"></span> Summary
		</li>
	</ul>

	<p
		class="caption mt-4 min-h-12 rounded-lg bg-base-200 px-4 py-3"
		aria-live={stepping ? 'polite' : 'off'}
	>
		<span class="font-medium tabular-nums"
			>Step {Math.min(Math.ceil(now), total)} / {total}</span
		>
		· {caption}
	</p>

	<div class="mt-4 flex flex-wrap items-center gap-3">
		<button
			class="btn min-h-12 btn-primary"
			type="button"
			onclick={play}
		>
			{playing ? 'Pause' : now >= total ? 'Play' : 'Resume'}
		</button>
		<button
			class="btn min-h-12 btn-outline"
			type="button"
			onclick={step}
		>
			Step
		</button>
		<button
			class="btn min-h-12 btn-ghost"
			type="button"
			onclick={rewind}
			disabled={now === 0}
		>
			Rewind
		</button>
	</div>

	<div class="controls mt-6 grid gap-4" oninput={reset_view}>
		<label
			for="code-mode-boundaries-pages"
			class="grid gap-2 font-medium"
		>
			<span
				>Pages to extract: <output class="tabular-nums"
					>{pages}</output
				></span
			>
			<input
				class="range w-full range-sm"
				id="code-mode-boundaries-pages"
				type="range"
				min="1"
				max="10"
				step="1"
				bind:value={pages}
			/>
		</label>
		<div class="grid gap-1">
			<label class="flex min-h-12 items-center gap-3">
				<input
					class="checkbox shrink-0 checkbox-sm"
					type="checkbox"
					bind:checked={parallel}
				/>
				<span>Extract pages in parallel</span>
			</label>
			<label class="flex min-h-12 items-center gap-3">
				<input
					class="checkbox shrink-0 checkbox-sm"
					type="checkbox"
					bind:checked={discover}
				/>
				<span>Look up code-mode signatures first</span>
			</label>
		</div>
	</div>

	<div class="mt-6 overflow-x-auto">
		<table class="table table-sm tabular-nums">
			<caption class="mb-2 text-left text-base font-semibold">
				All three, same job
			</caption>
			<thead>
				<tr>
					<th scope="col"></th>
					<th scope="col">Model turns</th>
					<th scope="col">Pi ↔ MCP</th>
					<th scope="col">Provider calls</th>
					<th scope="col">Full results to model</th>
					<th scope="col">Steps</th>
				</tr>
			</thead>
			<tbody>
				{#each comparison as row (row.id)}
					<tr class:bg-base-200={row.id === mode}>
						<th scope="row" class="font-medium whitespace-nowrap"
							>{row.name}</th
						>
						<td>{row.model_turns}</td>
						<td>{row.crossings[1]}</td>
						<td>{row.crossings[2] / 2}</td>
						<td>{row.raw_to_model}</td>
						<td>{row.steps}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="mt-4 text-pretty">
		Provider requests never drop. Code mode moves the loop away from
		the model; where the loop runs decides which lines stop carrying
		traffic.
	</p>

	<details class="mt-5 border-t border-base-content/20 pt-4">
		<summary class="min-h-12 cursor-pointer font-medium"
			>What this simplifies</summary
		>
		<ul class="mt-3 grid list-disc gap-3 pl-5 text-sm">
			<li>
				A step is one hop across one line. Steps show dependency
				order, not seconds: a model turn takes far longer than a local
				MCP hop, and MCP may be local stdio rather than a network.
			</li>
			<li>
				Model turns count each time the model has to write something.
				With individual tools in parallel mode, all extract calls go
				in one turn.
			</li>
			<li>
				Parallel mode assumes unlimited concurrency and no rate
				limits. Search always finishes before extraction starts.
			</li>
			<li>
				Signature lookup is one extra round: Pi answers from local
				metadata; server code mode asks the MCP server. Real lookups
				may take more.
			</li>
			<li>
				Both scripts return only summaries. Individual tools could
				also filter on the client. Retries, failures and the model’s
				final answer are left out.
			</li>
		</ul>
	</details>
</section>

<style>
	.boundaries {
		container-type: inline-size;
		--line: color-mix(
			in oklab,
			var(--color-base-content) 30%,
			transparent
		);
	}

	.modes {
		display: grid;
		gap: 0.5rem;
	}

	.mode {
		display: grid;
		gap: 0.125rem;
		min-height: 3rem;
		padding: 0.625rem 0.875rem;
		border: 1px solid
			color-mix(in oklab, var(--color-base-content) 20%, transparent);
		border-radius: 0.5rem;
		cursor: pointer;
		transition:
			border-color 150ms,
			background-color 150ms;
	}

	.mode.selected {
		border-color: var(--color-primary);
		background: color-mix(
			in oklab,
			var(--color-primary) 12%,
			transparent
		);
	}

	.mode:has(:focus-visible) {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Diagram: vertical on narrow screens, horizontal when there's room */
	.diagram {
		display: grid;
		grid-template-columns: 1fr;
		padding-top: 0.75rem;
	}

	.node {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border: 1px solid
			color-mix(in oklab, var(--color-base-content) 25%, transparent);
		border-radius: 0.625rem;
		background: var(--color-base-100);
		white-space: nowrap;
		transition:
			box-shadow 200ms,
			border-color 200ms;
	}

	.node.runs {
		border-color: var(--color-primary);
		box-shadow: inset 0 0 0 1px var(--color-primary);
	}

	.node.busy {
		box-shadow:
			inset 0 0 0 1px
				color-mix(
					in oklab,
					var(--color-base-content) 25%,
					transparent
				),
			0 0 0 4px
				color-mix(in oklab, var(--color-secondary) 40%, transparent);
	}

	.node.runs.busy {
		box-shadow:
			inset 0 0 0 1px var(--color-primary),
			0 0 0 4px
				color-mix(in oklab, var(--color-secondary) 40%, transparent);
	}

	.runs-badge {
		position: absolute;
		top: 0;
		right: 0.75rem;
		translate: 0 -50%;
		padding: 0.0625rem 0.5rem;
		border-radius: 999px;
		background: var(--color-primary);
		color: var(--color-primary-content);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.25rem;
	}

	.context-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		min-height: 1.75rem;
		padding: 0.25rem;
		border-radius: 0.375rem;
		background: var(--color-base-200);
	}

	.context-stack span {
		height: 1.25rem;
		border-radius: 3px;
		animation: drop-in 250ms ease-out;
	}

	.context-stack span[data-kind='raw'] {
		width: 3rem;
	}

	.context-stack span[data-kind='summary'] {
		width: 0.625rem;
	}

	@keyframes drop-in {
		from {
			opacity: 0;
			scale: 0.6;
		}
	}

	.wire {
		position: relative;
		height: 4rem;
	}

	.line {
		position: absolute;
		left: 1.5rem;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--line);
	}

	.packet {
		position: absolute;
		z-index: 1;
		left: calc(1.5rem + 1px);
		top: calc(var(--p) * 100%);
		translate: -50% -50%;
		display: grid;
		place-items: center;
		min-width: 1.125rem;
		height: 1.125rem;
		border-radius: 999px;
		color: var(--color-base-100);
		font-size: 0.6875rem;
		line-height: 1;
		box-shadow: 0 0 0 3px var(--color-base-100);
	}

	.packet b {
		padding-inline: 0.3rem;
	}

	.packet[data-kind='raw'] {
		min-width: 2rem;
		height: 1.375rem;
		border-radius: 0.25rem;
	}

	.tally {
		position: absolute;
		left: 3rem;
		top: 50%;
		translate: 0 -50%;
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		white-space: nowrap;
	}

	[data-kind='call'] {
		background: var(--color-primary);
	}

	[data-kind='script'] {
		background: var(--color-accent);
	}

	[data-kind='raw'] {
		background: var(--color-error);
	}

	[data-kind='summary'] {
		background: var(--color-success);
	}

	.swatch {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 999px;
	}

	.swatch[data-kind='raw'] {
		width: 1.25rem;
		border-radius: 0.2rem;
	}

	@container (min-width: 36rem) {
		.modes {
			grid-template-columns: repeat(3, 1fr);
		}

		.controls {
			grid-template-columns: 1fr 1fr;
			align-items: center;
			gap: 2rem;
		}

		.diagram {
			grid-template-columns:
				max-content minmax(0, 1fr) max-content minmax(0, 1fr)
				max-content minmax(0, 1fr) max-content;
			align-items: stretch;
			padding-bottom: 2.25rem;
		}

		.node {
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0;
			min-height: 4.5rem;
			padding-inline: 0.75rem;
		}

		.runs-badge {
			right: auto;
			left: 50%;
			translate: -50% -50%;
		}

		.wire {
			height: auto;
			min-width: 4rem;
		}

		.line {
			left: 0;
			right: 0;
			top: 50%;
			bottom: auto;
			width: auto;
			height: 2px;
			translate: 0 -50%;
		}

		.packet {
			left: calc(var(--p) * 100%);
			top: 50%;
		}

		.tally {
			left: 50%;
			top: calc(50% + 0.875rem);
			translate: -50% 0;
			flex-direction: column;
			align-items: center;
			gap: 0;
			line-height: 1.1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mode,
		.node {
			transition: none;
		}

		.context-stack span {
			animation: none;
		}
	}
</style>
