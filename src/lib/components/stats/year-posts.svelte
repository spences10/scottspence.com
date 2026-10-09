<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { onMount, settled } from 'svelte';
	import PostRidges, { type Ridge } from './post-ridges.svelte';
	import {
		month_labels,
		type HistoricalMetric,
		type SiteStat,
	} from './stats.svelte';

	interface Props {
		site_stats: SiteStat[];
		current_year: string;
	}

	let { site_stats, current_year }: Props = $props();

	const ridge_count = 8;

	let metric = $state<HistoricalMetric>('views');

	// The chart only renders in the browser, and waits for the period
	// stats above to settle: mounted during a pending async batch, its
	// derived state is recomputed on every read and locks the page up
	let mounted = $state(false);
	onMount(async () => {
		await settled();
		mounted = true;
	});

	// The months of this year with any post traffic, in order
	const months = $derived(
		[
			...new Set(
				site_stats.flatMap((post) =>
					post.monthly_stats
						.filter((stat) =>
							stat.year_month.startsWith(`${current_year}-`),
						)
						.map((stat) => stat.year_month),
				),
			),
		].sort(),
	);

	const month_label = (year_month: string) =>
		month_labels[Number(year_month.split('-')[1]) - 1];

	// The year's most read posts, month by month
	const top_posts = $derived(
		site_stats
			.map((post) => {
				const by_month = new Map(
					post.monthly_stats.map((stat) => [stat.year_month, stat]),
				);
				const values = months.map((year_month) => {
					const stat = by_month.get(year_month);
					return (
						(metric === 'views'
							? stat?.views
							: stat?.unique_visitors) ?? 0
					);
				});
				return {
					slug: post.slug,
					title: post.title,
					values,
					total: values.reduce((sum, value) => sum + value, 0),
				};
			})
			.filter((post) => post.total > 0)
			.sort((a, b) => b.total - a.total)
			.slice(0, ridge_count),
	);

	const ridges = $derived(
		top_posts.map((post): Ridge => ({
			slug: post.slug,
			title: post.title,
			points: post.values.map((value, index) => ({
				index,
				label: `${month_label(months[index])} ${current_year}`,
				value,
			})),
		})),
	);

	const metric_label = $derived(
		metric === 'views' ? 'Views' : 'Visitors',
	);
</script>

<!-- A ridge needs a second month to run to -->
{#if months.length > 1 && top_posts.length > 0}
	<section aria-labelledby="year-posts-heading" class="mb-12">
		<div
			class="mb-4 flex flex-wrap items-end justify-between gap-4 border-t border-base-300 pt-8"
		>
			<div>
				<h2 id="year-posts-heading" class="text-3xl font-bold">
					Popular posts in {current_year}
				</h2>
				<p class="text-sm opacity-80">
					The {top_posts.length} most read posts this year, month by month.
				</p>
			</div>

			<div class="join" role="group" aria-label="Posts metric">
				<button
					class="btn join-item btn-sm {metric === 'views'
						? 'btn-primary'
						: ''}"
					aria-pressed={metric === 'views'}
					onclick={() => (metric = 'views')}
				>
					Views
				</button>
				<button
					class="btn join-item btn-sm {metric === 'visitors'
						? 'btn-secondary'
						: ''}"
					aria-pressed={metric === 'visitors'}
					onclick={() => (metric = 'visitors')}
				>
					Visitors
				</button>
			</div>
		</div>

		<div class="rounded-box bg-base-200 p-4 sm:p-6">
			{#if mounted}
				<PostRidges {ridges} {metric} wide />
			{:else}
				<div class="h-64 sm:h-120"></div>
			{/if}

			<details class="mt-2 text-sm">
				<summary class="cursor-pointer text-xs opacity-80">
					View as table
				</summary>
				<div class="mt-2 overflow-x-auto">
					<table class="table table-xs">
						<caption class="sr-only">
							{metric_label} by month for the most read posts of
							{current_year}
						</caption>
						<thead>
							<tr>
								<th scope="col">Post</th>
								{#each months as year_month (year_month)}
									<th scope="col" class="text-right">
										{month_label(year_month)}
									</th>
								{/each}
								<th scope="col" class="text-right">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each top_posts as post (post.slug)}
								<tr>
									<th scope="row" class="font-normal">
										<a href="/posts/{post.slug}" class="link-hover">
											{post.title}
										</a>
									</th>
									{#each post.values as value, index (months[index])}
										<td class="text-right tabular-nums">
											{number_crunch(value)}
										</td>
									{/each}
									<td class="text-right font-semibold tabular-nums">
										{number_crunch(post.total)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</details>
		</div>
	</section>
{/if}
