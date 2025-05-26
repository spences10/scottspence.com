<script lang="ts">
	import { InformationCircle } from '$lib/icons'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { number_crunch, og_image_url } from '$lib/utils'
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

	// Calculate summary statistics
	let summary_stats = $derived.by(() => {
		const total_views = filtered_stats.reduce(
			(sum, post) => sum + post.stats.views,
			0,
		)
		const total_visitors = filtered_stats.reduce(
			(sum, post) => sum + post.stats.unique_visitors,
			0,
		)
		const total_posts = filtered_stats.length
		const avg_views =
			total_posts > 0 ? Math.round(total_views / total_posts) : 0
		const avg_visitors =
			total_posts > 0 ? Math.round(total_visitors / total_posts) : 0

		return {
			total_views,
			total_visitors,
			total_posts,
			avg_views,
			avg_visitors,
		}
	})

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

	// Generate trend data for top 3 posts
	let trend_data = $derived.by(() => {
		if (selected_period === 'all_time') return []

		const top_posts = filtered_stats.slice(0, 3)
		return top_posts.map((post) => {
			let data_points: { period: string; views: number }[] = []

			if (selected_period === 'yearly') {
				data_points = post.yearly_stats
					.filter((y) => Number(y.year) < Number(current_year))
					.sort((a, b) => a.year.localeCompare(b.year))
					.map((y) => ({ period: y.year, views: y.views }))
			} else if (selected_period === 'monthly') {
				data_points = post.monthly_stats
					.filter((m) => {
						const [year] = m.year_month.split('-').map(Number)
						return year < Number(current_year)
					})
					.sort((a, b) => a.year_month.localeCompare(b.year_month))
					.slice(-12) // Last 12 months
					.map((m) => ({ period: m.year_month, views: m.views }))
			}

			return {
				title: post.title,
				slug: post.slug,
				data_points,
			}
		})
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
				aria-label="Select time period:"
			>
				<option value="all_time">All Time</option>
				<option value="yearly">Yearly</option>
				<option value="monthly">Monthly</option>
			</select>

			{#if selected_period === 'yearly'}
				<select
					bind:value={selected_year}
					class="select select-bordered w-full max-w-xs"
					aria-label="Select year:"
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
					aria-label="Select month:"
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

		<!-- Summary Statistics Cards -->
		<div
			class="stats stats-vertical border-secondary md:stats-horizontal mb-8 w-full border shadow-lg"
		>
			<div class="stat">
				<div class="stat-title">Total Views</div>
				<div class="stat-value text-primary">
					{number_crunch(summary_stats.total_views)}
				</div>
				<div class="stat-desc">
					Across {summary_stats.total_posts} posts
				</div>
			</div>

			<div class="stat">
				<div class="stat-title">Total Visitors</div>
				<div class="stat-value text-secondary">
					{number_crunch(summary_stats.total_visitors)}
				</div>
				<div class="stat-desc">Unique visitors</div>
			</div>

			<div class="stat">
				<div class="stat-title">Average Views</div>
				<div class="stat-value text-accent">
					{number_crunch(summary_stats.avg_views)}
				</div>
				<div class="stat-desc">Per post</div>
			</div>

			<div class="stat">
				<div class="stat-title">Average Visitors</div>
				<div class="stat-value text-info">
					{number_crunch(summary_stats.avg_visitors)}
				</div>
				<div class="stat-desc">Per post</div>
			</div>
		</div>

		<!-- Simple Trend Visualization for Top Posts -->
		{#if trend_data.length > 0 && selected_period !== 'all_time'}
			<div class="mb-8">
				<h3 class="mb-4 text-xl font-bold">
					Trend Overview - Top 3 Posts
				</h3>
				<div class="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
					{#each trend_data as post_trend}
						<div class="card bg-base-200 h-48 shadow-lg">
							<div class="card-body flex h-full flex-col p-4">
								<h4
									class="card-title line-clamp-2 flex-shrink-0 text-sm"
								>
									{post_trend.title}
								</h4>
								<div
									class="mt-auto mb-2 flex h-16 flex-grow items-end gap-1"
								>
									{#each post_trend.data_points as point, i}
										{@const max_views = Math.max(
											...post_trend.data_points.map((p) => p.views),
										)}
										{@const height =
											max_views > 0
												? (point.views / max_views) * 100
												: 0}
										<div
											class="bg-primary hover:bg-accent tooltip tooltip-accent tooltip-top min-h-[4px] flex-1 rounded-t transition-colors duration-200"
											style="height: {Math.max(height, 6)}%"
											data-tip="{point.period}: {point.views} views"
										></div>
									{/each}
								</div>
								<div
									class="text-base-content/70 flex-shrink-0 text-xs"
								>
									{post_trend.data_points.length} data points
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

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
					{#each filtered_stats as post, index}
						{@const ratio =
							post.stats.unique_visitors > 0
								? (
										post.stats.views / post.stats.unique_visitors
									).toFixed(1)
								: 'N/A'}
						<tr class="hover">
							<td>
								<a href="/posts/{post.slug}" class="link-hover link">
									{post.title}
								</a>
							</td>
							<td class="text-right font-mono">
								<div
									class="tooltip tooltip-accent tooltip-top"
									data-tip="Views/Visitors Ratio: {ratio}"
								>
									{number_crunch(post.stats.views)}
								</div>
							</td>
							<td class="text-right font-mono">
								{number_crunch(post.stats.unique_visitors)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
