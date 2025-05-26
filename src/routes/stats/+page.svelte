<script lang="ts">
	import { InformationCircle } from '$lib/icons'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	interface Stats {
		views: number
		unique_visitors: number
	}

	interface MonthlyStats extends Stats {
		year_month: string
	}

	interface YearlyStats extends Stats {
		year: string
	}

	interface SiteStat {
		title: string
		slug: string
		monthly_stats: MonthlyStats[]
		yearly_stats: YearlyStats[]
		all_time_stats: Stats
	}

	let { data } = $props()
	const { site_stats, current_month, current_year, error } = data

	let selected_period = $state('yearly')
	let selected_year = $state<string>(
		(Number(current_year) - 1).toString(),
	)
	let selected_month = $state(current_month)

	// Auto-update selections when period changes
	$effect(() => {
		if (selected_period === 'yearly') {
			// Set to most recent historical year
			const available_years = [
				...new Set(
					site_stats.flatMap((p) =>
						p.yearly_stats
							.filter((y) => Number(y.year) < Number(current_year))
							.map((y) => y.year),
					),
				),
			]
				.sort()
				.reverse()
			if (available_years.length > 0) {
				selected_year = available_years[0]
			}
		} else if (selected_period === 'monthly') {
			// Set to most recent historical month
			const available_months = [
				...new Set(
					site_stats.flatMap((p) =>
						p.monthly_stats
							.filter((m) => {
								const [year] = m.year_month.split('-').map(Number)
								return year < Number(current_year)
							})
							.map((m) => m.year_month),
					),
				),
			]
				.sort()
				.reverse()
			if (available_months.length > 0) {
				selected_month = available_months[0]
			}
		}
	})

	const seo_config = create_seo_config({
		title: `Site Stats - ${name}`,
		description: `View stats for ${name}'s blog posts and articles`,
		open_graph_image: og_image_url(
			name,
			'scottspence.com',
			'Site Stats',
		),
		url: `${website}/stats`,
		slug: 'stats',
	})

	let filtered_stats = $derived.by(() =>
		site_stats
			.map((post) => {
				let stats: Stats
				if (selected_period === 'all_time') {
					stats = post.all_time_stats
				} else if (selected_period === 'yearly') {
					const yearly_stat = post.yearly_stats
						.filter((y) => Number(y.year) < Number(current_year)) // Exclude current year
						.find((y) => y.year === selected_year)
					stats = yearly_stat || { views: 0, unique_visitors: 0 }
				} else if (selected_period === 'monthly') {
					const monthly_stat = post.monthly_stats
						.filter((m) => {
							const [year] = m.year_month.split('-').map(Number)
							return year < Number(current_year) // Exclude current year
						})
						.find((m) => m.year_month === selected_month)
					stats = monthly_stat || { views: 0, unique_visitors: 0 }
				} else {
					stats = { views: 0, unique_visitors: 0 }
				}
				return { ...post, stats }
			})
			.filter((post) => post.stats.views > 0)
			.sort((a, b) => b.stats.views - a.stats.views),
	)

	// Calculate date range for display
	let date_range = $derived.by(() => {
		if (selected_period === 'all_time') {
			const years = [
				...new Set(
					site_stats.flatMap((p) =>
						p.yearly_stats
							.filter((y) => Number(y.year) < Number(current_year))
							.map((y) => y.year),
					),
				),
			].sort()
			return years.length > 0
				? `${years[years.length - 1]} - ${years[0]}`
				: ''
		} else if (selected_period === 'yearly') {
			return selected_year
		} else if (selected_period === 'monthly') {
			return selected_month
		}
		return ''
	})
</script>

<Head {seo_config} />

{#if error}
	<div class="alert alert-error mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{error}</span>
	</div>
{/if}

{#if site_stats.length === 0 && !error}
	<div class="alert alert-info mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span>No stats data available yet.</span>
	</div>
{/if}

{#if site_stats.length > 0}
	<div class="prose prose-xl mx-auto mb-6">
		<h1>Historical Site Statistics</h1>
		<p>
			This page shows historical analytics data for posts from
			previous years.
		</p>
	</div>

	<div class="alert alert-info mb-6">
		<InformationCircle />
		<div class="prose prose-md">
			<h3 class="font-bold">Looking for current year data?</h3>
			<div>
				Visit any post and click the
				<strong> "✨ View the stats for this post ✨" </strong>
				button, or check the site footer for current analytics!
			</div>
		</div>
	</div>

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
									.filter((y) => Number(y.year) < Number(current_year))
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
										const [year] = m.year_month.split('-').map(Number)
										return year < Number(current_year)
									})
									.map((m) => m.year_month)))]
						.sort()
						.reverse() as month}
						<option value={month}>{month}</option>
					{/each}
				</select>
			{/if}
		</div>

		<div class="mb-4 flex items-center gap-2">
			<span class="text-lg font-semibold">Showing data for:</span>
			<div class="badge badge-primary badge-lg font-mono">
				{date_range}
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="table-zebra table">
				<thead>
					<tr>
						<th>Title</th>
						<th class="text-right">Views</th>
						<th class="text-right">Unique Visitors</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered_stats as post}
						<tr class="hover">
							<td>
								<a href="/posts/{post.slug}" class="link-hover link">
									{post.title}
								</a>
							</td>
							<td class="text-right">
								{post.stats.views.toLocaleString()}
							</td>
							<td class="text-right">
								{post.stats.unique_visitors.toLocaleString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
