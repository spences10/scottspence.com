<script lang="ts">
	import { Head } from 'svead';
	import { name, website } from '$lib/info';
	import { create_seo_config } from '$lib/seo';
	import { og_image_url } from '$lib/utils';

	interface Props {
		data: {
			site_stats: any[];
			current_month: string;
			current_year: number;
		};
	}

	let { data } = $props<Props>();
	const { site_stats, current_month, current_year } = data;

	let selected_period = $state('all_time');
	let selected_year = $state(current_year);
	let selected_month = $state(current_month);

	const seo_config = create_seo_config({
		title: `Site Analytics - ${name}`,
		description: `View analytics and statistics for ${name}'s blog posts and articles`,
		open_graph_image: og_image_url(
			name,
			'scottspence.com',
			'Site Analytics',
		),
		url: `${website}/stats`,
		slug: 'stats',
	});

	let filtered_analytics = $derived.by(() => {
		// First map the data with appropriate stats
		const mapped_data = site_stats.map((post) => {
			let current_stats;

			if (selected_period === 'monthly') {
				current_stats = post.monthly_stats.find(
					(m) => m.year_month === selected_month,
				) || { views: 0, unique_visitors: 0 };
			} else if (selected_period === 'yearly') {
				current_stats = post.yearly_stats.find(
					(y) => y.year === selected_year,
				) || { views: 0, unique_visitors: 0 };
			} else {
				current_stats = post.all_time_stats;
			}

			return {
				...post,
				current_stats,
			};
		});

		// Filter out items with no views and sort by views descending
		return mapped_data
			.filter(
				(post) =>
					post.current_stats.views > 0 ||
					post.current_stats.unique_visitors > 0,
			)
			.sort((a, b) => b.current_stats.views - a.current_stats.views);
	});
</script>

<Head {seo_config} />

<!-- <pre>{JSON.stringify(data.site_stats, null, 2)}</pre> -->

<div class="mb-12 space-y-6 p-4">
	<div class="flex flex-wrap gap-4">
		<select
			bind:value={selected_period}
			class="select select-bordered w-full max-w-xs"
		>
			<option value="all_time">All Time</option>
			<option value="yearly">Yearly</option>
			<option value="monthly">Monthly</option>
		</select>

		{#if selected_period === 'yearly'}
			<select
				bind:value={selected_year}
				class="select select-bordered w-full max-w-xs"
			>
				{#each [...new Set(site_stats.flatMap((p) => p.yearly_stats
								.filter((y) => y.year < current_year)
								.map((y) => y.year)))]
					.sort()
					.reverse() as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		{/if}

		{#if selected_period === 'monthly'}
			<select
				bind:value={selected_month}
				class="select select-bordered w-full max-w-xs"
			>
				{#each [...new Set(site_stats.flatMap((p) => p.monthly_stats
								.filter((m) => {
									const [year, month] = m.year_month
										.split('-')
										.map(Number);
									return year < current_year || (year === current_year && month < current_month);
								})
								.map((m) => m.year_month)))]
					.sort()
					.reverse() as month}
					<option value={month}>{month}</option>
				{/each}
			</select>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>Title</th>
					<th class="text-right">Views</th>
					<th class="text-right">Unique Visitors</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered_analytics as post}
					<tr class="hover">
						<td>
							<a href="/posts/{post.slug}" class="link-hover link">
								{post.title}
							</a>
						</td>
						<td class="text-right">
							{post.current_stats.views.toLocaleString()}
						</td>
						<td class="text-right">
							{post.current_stats.unique_visitors.toLocaleString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
