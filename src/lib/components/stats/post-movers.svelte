<script lang="ts">
	import { get_post_movers } from '#lib/data/post-trends.remote.js';
	import StatRow from './stat-row.svelte';

	const movers = $derived(await get_post_movers());

	const short_date = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC',
		});
	const pct = (m: PostMover) =>
		m.previous > 0
			? `${m.change > 0 ? '+' : '−'}${Math.round((Math.abs(m.change) / m.previous) * 100)}%`
			: 'new';

	const max_change = $derived(
		Math.max(
			0,
			...[...(movers?.risers ?? []), ...(movers?.fallers ?? [])].map(
				(m) => Math.abs(m.change),
			),
		),
	);
	const columns = $derived(
		movers
			? [
					{ title: 'Biggest falls', rows: movers.fallers },
					{ title: 'Biggest rises', rows: movers.risers },
				]
			: [],
	);
</script>

{#if movers && (movers.risers.length > 0 || movers.fallers.length > 0)}
	<section class="mt-12" aria-labelledby="post-movers-heading">
		<header class="mb-4">
			<h2 id="post-movers-heading" class="text-2xl font-bold">
				Risers and fallers
			</h2>
			<p class="text-sm text-base-content/70">
				Change in views over the last {movers.window_days} days ({short_date(
					movers.recent_from,
				)} – {short_date(movers.last_date)}) against the {movers.window_days}
				days before. Posts published in that time are left out.
			</p>
		</header>

		<div class="grid gap-4 md:grid-cols-2">
			{#each columns as column (column.title)}
				<div class="rounded-box bg-base-200 p-4">
					<h3 class="mb-2 text-sm font-semibold">{column.title}</h3>
					{#if column.rows.length === 0}
						<p class="text-sm text-base-content/60">None.</p>
					{/if}
					{#each column.rows as mover (mover.slug)}
						<StatRow
							label={mover.title}
							value={Math.abs(mover.change)}
							max_value={max_change}
							href={`/posts/${mover.slug}`}
							prefix={pct(mover)}
							label_class="ml-1"
						/>
					{/each}
				</div>
			{/each}
		</div>
	</section>
{/if}
