<script lang="ts">
	import { InformationCircle } from '$lib/icons'
	import { number_crunch } from '$lib/utils'
	import { scaleBand } from 'd3-scale'
	import { Axis, Bars, Chart, Svg, Tooltip } from 'layerchart'
	import type { SiteStat, Stats } from './stats.svelte'

	interface Props {
		site_stats: SiteStat[]
		current_month: string
		current_year: string
	}

	let { site_stats, current_month, current_year }: Props = $props()

	let selected_period = $state('yearly')
	let selected_year = $state<string>('')
	let selected_month = $state('')

	// Initialize with derived values after mount
	$effect(() => {
		if (!selected_year && current_year) {
			selected_year = (Number(current_year) - 1).toString()
		}
		if (!selected_month && current_month) {
			selected_month = current_month
		}
	})

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

	// Generate all-time yearly visitor data for chart
	let all_time_yearly_visitors = $derived.by(() => {
		if (selected_period !== 'all_time') return []

		// Aggregate visitors by year across all posts
		const yearly_totals = new Map<string, number>()

		site_stats.forEach((post) => {
			post.yearly_stats
				.filter((y) => Number(y.year) < Number(current_year))
				.forEach((yearly_stat) => {
					const current_total =
						yearly_totals.get(yearly_stat.year) || 0
					yearly_totals.set(
						yearly_stat.year,
						current_total + yearly_stat.unique_visitors,
					)
				})
		})

		return Array.from(yearly_totals.entries())
			.map(([year, visitors]) => ({ year, visitors }))
			.sort((a, b) => a.year.localeCompare(b.year))
	})
</script>

<!-- Historical section -->
<div class="divider mb-8">Historical Data</div>

<div class="alert alert-info mb-6">
	<InformationCircle />
	<div class="prose prose-md text-info-content">
		<p>
			Historical analytics from previous years. Current year data
			available per-post.
		</p>
	</div>
</div>

<div class="mb-12 space-y-6 p-4">
	<div class="flex flex-wrap justify-between gap-4">
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

	<!-- All-Time Yearly Visitors Chart -->
	{#if selected_period === 'all_time' && all_time_yearly_visitors.length > 0}
		{#key all_time_yearly_visitors.length}
			<div class="mb-8">
				<h3 class="mb-4 text-xl font-bold">Total Visitors by Year</h3>
				<div class="card bg-base-200 shadow-lg">
					<div class="card-body p-6">
						<div class="h-64">
							<Chart
								data={all_time_yearly_visitors}
								x="year"
								xScale={scaleBand().padding(0.2)}
								y="visitors"
								yDomain={[0, null]}
								yNice
								padding={{ left: 48, bottom: 24 }}
								tooltip={{ mode: 'band' }}
							>
								<Svg>
									<Axis placement="left" grid rule />
									<Axis placement="bottom" />
									<Bars radius={4} class="fill-secondary" />
								</Svg>
								<Tooltip.Root>
									{#snippet children({
										data,
									}: {
										data: { year: string; visitors: number }
									})}
										<Tooltip.Header>{data.year}</Tooltip.Header>
										<Tooltip.List>
											<Tooltip.Item
												label="Visitors"
												value={number_crunch(data.visitors)}
											/>
										</Tooltip.List>
									{/snippet}
								</Tooltip.Root>
							</Chart>
						</div>
					</div>
				</div>
			</div>
		{/key}
	{/if}

	<!-- Simple Trend Visualization for Top Posts -->
	{#if trend_data.length > 0 && selected_period !== 'all_time'}
		{#key trend_data.length}
			<div class="mb-8">
				<h3 class="mb-4 text-xl font-bold">
					Trend Overview - Top 3 Posts
				</h3>
				<div class="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
					{#each trend_data as post_trend (post_trend.slug)}
						<div class="card bg-base-200 h-48 shadow-lg">
							<div class="card-body flex h-full flex-col p-4">
								<h4 class="card-title line-clamp-2 shrink-0 text-sm">
									{post_trend.title}
								</h4>
								<div class="mt-auto mb-2 h-20 grow">
									<Chart
										data={post_trend.data_points}
										x="period"
										xScale={scaleBand().padding(0.1)}
										y="views"
										yDomain={[0, null]}
										padding={{
											left: 0,
											right: 0,
											top: 4,
											bottom: 0,
										}}
										tooltip={{ mode: 'band' }}
									>
										<Svg>
											<Bars radius={2} class="fill-primary" />
										</Svg>
										<Tooltip.Root>
											{#snippet children({
												data,
											}: {
												data: { period: string; views: number }
											})}
												<Tooltip.Header>{data.period}</Tooltip.Header>
												<Tooltip.List>
													<Tooltip.Item
														label="Views"
														value={number_crunch(data.views)}
													/>
												</Tooltip.List>
											{/snippet}
										</Tooltip.Root>
									</Chart>
								</div>
								<div class="text-base-content/70 shrink-0 text-xs">
									{post_trend.data_points.length} data points
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/key}
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
				{#each filtered_stats as post}
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

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
