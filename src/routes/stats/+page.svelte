<script lang="ts">
	import { get_live_stats_breakdown } from '$lib/analytics/live-analytics.remote'
	import {
		get_period_stats,
		type FilterMode,
		type PeriodStats,
		type StatsPeriod,
	} from '$lib/analytics/period-stats.remote'
	import { InformationCircle } from '$lib/icons'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { number_crunch, og_image_url } from '$lib/utils'
	import { Head } from 'svead'
	import { onMount } from 'svelte'

	// Live stats state
	type LiveStats = {
		active_visitors: number
		recent_visitors: number
		active_pages: { path: string; viewers: number }[]
		countries: { country: string; visitors: number }[]
		browsers: { browser: string; visitors: number }[]
		devices: { device_type: string; visitors: number }[]
		top_paths: { path: string; views: number; visitors: number }[]
	}

	let live_stats = $state<LiveStats | null>(null)
	let live_loading = $state(true)

	// Period stats state
	let period_stats = $state<PeriodStats | null>(null)
	let period_loading = $state(false)
	let selected_stats_period = $state<StatsPeriod>('today')
	let selected_filter_mode = $state<FilterMode>('humans')

	const fetch_live_data = async () => {
		try {
			live_stats = await get_live_stats_breakdown()
		} catch (e) {
			console.error('[stats] Failed to fetch live data:', e)
		} finally {
			live_loading = false
		}
	}

	const format_path = (path: string) => {
		if (path === '/') return 'Home'
		if (path.startsWith('/posts/')) {
			return path.replace('/posts/', '').replaceAll('-', ' ')
		}
		return path.slice(1).replaceAll('-', ' ').replaceAll('/', ' / ')
	}

	// Country code to flag emoji
	const country_flag = (code: string) => {
		if (!code || code.length !== 2) return '🌍'
		const offset = 127397
		return String.fromCodePoint(
			...code
				.toUpperCase()
				.split('')
				.map((c) => c.charCodeAt(0) + offset),
		)
	}

	// Device emoji
	const device_icon = (type: string) => {
		const icons: Record<string, string> = {
			desktop: '🖥️',
			mobile: '📱',
			tablet: '📱',
		}
		return icons[type?.toLowerCase()] ?? '💻'
	}

	// Period button labels
	const period_labels: Record<StatsPeriod, string> = {
		today: 'Today',
		yesterday: 'Yesterday',
		week: '7 days',
		month: '30 days',
		year: '12 months',
	}

	const fetch_period_data = async (
		period: StatsPeriod,
		filter_mode: FilterMode,
	) => {
		period_loading = true
		try {
			period_stats = await get_period_stats({ period, filter_mode })
		} catch (e) {
			console.error('[stats] Failed to fetch period data:', e)
		} finally {
			period_loading = false
		}
	}

	// Reactive: fetch when period or filter mode changes
	$effect(() => {
		fetch_period_data(selected_stats_period, selected_filter_mode)
	})

	onMount(() => {
		fetch_live_data()
		const interval = setInterval(fetch_live_data, 10000) // 10s refresh
		return () => clearInterval(interval)
	})

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
	const site_stats = $derived(data.site_stats)
	const current_month = $derived(data.current_month)
	const current_year = $derived(data.current_year)
	const error = $derived(data.error)

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

<!-- Page header with live indicator -->
<div class="mb-8 flex items-center justify-between">
	<h1 class="text-3xl font-bold">Site Stats</h1>
	{#if !live_loading && live_stats}
		<div class="flex items-center gap-2">
			<div class="inline-grid *:[grid-area:1/1]">
				<div
					class="status status-primary h-3 w-3 animate-ping [animation-duration:2s]"
				></div>
				<div class="status status-primary h-3 w-3"></div>
			</div>
			<span class="text-primary text-lg font-bold tabular-nums">
				{live_stats.active_visitors}
			</span>
			<span class="text-base-content/60 text-sm">now</span>
		</div>
	{/if}
</div>

<!-- Live dashboard grid -->
{#if live_loading}
	<div class="flex items-center justify-center py-12">
		<div class="loading loading-spinner loading-lg"></div>
	</div>
{:else if live_stats}
	<!-- Stats cards row -->
	<div
		class="stats stats-vertical border-secondary md:stats-horizontal mb-8 w-full border shadow-lg"
	>
		<div class="stat">
			<div class="stat-title">Active Now</div>
			<div class="stat-value text-primary">
				{live_stats.active_visitors}
			</div>
			<div class="stat-desc">Current visitors</div>
		</div>
		<div class="stat">
			<div class="stat-title">Last 5 mins</div>
			<div class="stat-value text-secondary">
				{live_stats.recent_visitors}
			</div>
			<div class="stat-desc">Unique visitors</div>
		</div>
		<div class="stat">
			<div class="stat-title">Countries</div>
			<div class="stat-value text-accent">
				{live_stats.countries.length}
			</div>
			<div class="stat-desc">Represented</div>
		</div>
		<div class="stat">
			<div class="stat-title">Active Pages</div>
			<div class="stat-value text-info">
				{live_stats.top_paths.length}
			</div>
			<div class="stat-desc">Being viewed</div>
		</div>
	</div>

	<!-- Main grid: Countries + Active Pages -->
	<div class="mb-8 grid gap-6 lg:grid-cols-2">
		<!-- Countries -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Visitors by Country</h2>
				{#if live_stats.countries.length > 0}
					<ul class="space-y-2">
						{#each live_stats.countries as c}
							<li class="flex items-center justify-between">
								<span class="flex items-center gap-2">
									<span class="text-xl">
										{country_flag(c.country)}
									</span>
									<span class="uppercase">{c.country}</span>
								</span>
								<span class="badge badge-ghost tabular-nums">
									{c.visitors}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data yet</p>
				{/if}
			</div>
		</div>

		<!-- Active Pages -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Top Pages</h2>
				{#if live_stats.top_paths.length > 0}
					<ul class="space-y-2">
						{#each live_stats.top_paths.slice(0, 8) as page}
							<li class="flex items-center justify-between gap-2">
								<a
									href={page.path}
									class="link-hover link min-w-0 flex-1 truncate text-sm capitalize"
								>
									{format_path(page.path)}
								</a>
								<span
									class="badge badge-primary badge-sm tabular-nums"
								>
									{page.visitors}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No activity</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Secondary grid: Browsers + Devices -->
	<div class="mb-8 grid gap-6 md:grid-cols-2">
		<!-- Browsers -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Browsers</h2>
				{#if live_stats.browsers.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each live_stats.browsers as b}
							<div class="badge badge-outline gap-1">
								{b.browser}
								<span class="text-primary font-bold">
									{b.visitors}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>

		<!-- Devices -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Devices</h2>
				{#if live_stats.devices.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each live_stats.devices as d}
							<div class="badge badge-outline gap-1">
								<span>{device_icon(d.device_type)}</span>
								{d.device_type}
								<span class="text-primary font-bold">
									{d.visitors}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>
	</div>

	<p class="text-base-content/50 mb-8 text-center text-xs">
		Live data refreshes every 10 seconds
	</p>
{/if}

<!-- Period Stats Section -->
<div class="divider mb-8">Period Stats</div>

<!-- Filter info alert -->
<div class="alert mb-6">
	<InformationCircle />
	<div class="text-sm">
		<p>
			<strong>Bot filtering:</strong> Detects bots via user-agent patterns
			(crawlers, scripts) and behaviour analysis (20+ hits/page or 100+
			total/day). Historical data is filtered overnight; current day filtering
			is applied in real-time.
		</p>
	</div>
</div>

<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
	<!-- Period selector -->
	<div class="flex flex-wrap items-center gap-2">
		{#each ['today', 'yesterday', 'week', 'month', 'year'] as period (period)}
			<button
				class="btn btn-sm {selected_stats_period === period
					? 'btn-primary'
					: 'btn-ghost'}"
				onclick={() =>
					(selected_stats_period = period as StatsPeriod)}
			>
				{period_labels[period as StatsPeriod]}
			</button>
		{/each}
	</div>

	<!-- Filter mode toggle -->
	<div class="join">
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'humans'
				? 'btn-success'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'humans')}
		>
			Humans
		</button>
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'bots'
				? 'btn-warning'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'bots')}
		>
			Bots
		</button>
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'all'
				? 'btn-info'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'all')}
		>
			All
		</button>
	</div>
</div>

{#if period_loading}
	<div class="flex items-center justify-center py-8">
		<div class="loading loading-spinner loading-md"></div>
	</div>
{:else if period_stats}
	<!-- Period summary cards -->
	<div
		class="stats stats-vertical border-secondary md:stats-horizontal mb-4 w-full border shadow-lg"
	>
		<div class="stat">
			<div class="stat-title">
				{selected_filter_mode === 'bots' ? 'Bot Views' : 'Views'}
			</div>
			<div
				class="stat-value {selected_filter_mode === 'bots'
					? 'text-warning'
					: 'text-primary'}"
			>
				{number_crunch(period_stats.views)}
			</div>
			<div class="stat-desc">{period_stats.period_label}</div>
		</div>
		<div class="stat">
			<div class="stat-title">
				{selected_filter_mode === 'bots'
					? 'Bot Visitors'
					: 'Unique Visitors'}
			</div>
			<div
				class="stat-value {selected_filter_mode === 'bots'
					? 'text-warning'
					: 'text-secondary'}"
			>
				{number_crunch(period_stats.unique_visitors)}
			</div>
			<div class="stat-desc">{period_stats.period_label}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Countries</div>
			<div class="stat-value text-accent">
				{period_stats.countries.length}
			</div>
			<div class="stat-desc">Represented</div>
		</div>
		<div class="stat">
			<div class="stat-title">Pages</div>
			<div class="stat-value text-info">
				{period_stats.top_pages.length}
			</div>
			<div class="stat-desc">With traffic</div>
		</div>
	</div>

	<!-- Bot stats summary (shown when viewing humans) -->
	{#if selected_filter_mode === 'humans' && period_stats.bot_views > 0}
		<div class="bg-base-200 mb-8 rounded-lg p-3 text-sm">
			<span class="text-warning font-semibold"
				>Bot traffic filtered:</span
			>
			{number_crunch(period_stats.bot_views)} views from {period_stats.bot_visitors}
			detected bots
			<span class="text-base-content/60">
				({Math.round(
					(period_stats.bot_views /
						(period_stats.views + period_stats.bot_views)) *
						100,
				)}% of total)
			</span>
		</div>
	{:else}
		<div class="mb-4"></div>
	{/if}

	<!-- Period grids -->
	<div class="mb-8 grid gap-6 lg:grid-cols-2">
		<!-- Countries -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Top Countries</h2>
				{#if period_stats.countries.length > 0}
					<ul class="space-y-2">
						{#each period_stats.countries as c}
							<li class="flex items-center justify-between">
								<span class="flex items-center gap-2">
									<span class="text-xl">
										{country_flag(c.country)}
									</span>
									<span class="uppercase">{c.country}</span>
								</span>
								<span class="badge badge-ghost tabular-nums">
									{c.visitors}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>

		<!-- Top Pages -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Top Pages</h2>
				{#if period_stats.top_pages.length > 0}
					<ul class="space-y-2">
						{#each period_stats.top_pages.slice(0, 8) as page}
							<li class="flex items-center justify-between gap-2">
								<a
									href={page.path}
									class="link-hover link min-w-0 flex-1 truncate text-sm capitalize"
								>
									{format_path(page.path)}
								</a>
								<span
									class="badge badge-primary badge-sm tabular-nums"
								>
									{page.visitors}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Browsers + Devices -->
	<div class="mb-8 grid gap-6 md:grid-cols-2">
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Browsers</h2>
				{#if period_stats.browsers.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each period_stats.browsers as b}
							<div class="badge badge-outline gap-1">
								{b.browser}
								<span class="text-primary font-bold">
									{b.visitors}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>

		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Devices</h2>
				{#if period_stats.devices.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each period_stats.devices as d}
							<div class="badge badge-outline gap-1">
								<span>{device_icon(d.device_type)}</span>
								{d.device_type}
								<span class="text-primary font-bold">
									{d.visitors}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Historical section -->
{#if site_stats.length > 0}
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
			<div class="mb-8">
				<h3 class="mb-4 text-xl font-bold">Total Visitors by Year</h3>
				<div class="card bg-base-200 shadow-lg">
					<div class="card-body p-6">
						<div class="mb-4 flex h-64 items-end gap-2">
							{#each all_time_yearly_visitors as year_data}
								{@const max_visitors = Math.max(
									...all_time_yearly_visitors.map((y) => y.visitors),
								)}
								{@const height_px =
									max_visitors > 0
										? Math.max(
												(year_data.visitors / max_visitors) * 240,
												8,
											)
										: 8}
								<div class="flex flex-1 flex-col items-center gap-2">
									<div
										class="bg-secondary hover:bg-accent tooltip tooltip-accent tooltip-top w-full rounded-t transition-all duration-300 hover:scale-105"
										style="height: {height_px}px"
										data-tip="{year_data.year}: {number_crunch(
											year_data.visitors,
										)} visitors"
									></div>
									<div class="text-base-content/70 font-mono text-xs">
										{year_data.year}
									</div>
								</div>
							{/each}
						</div>
						<div class="text-center">
							<div class="text-base-content/70 text-sm">
								Hover over bars to see exact visitor counts
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

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
								<h4 class="card-title line-clamp-2 shrink-0 text-sm">
									{post_trend.title}
								</h4>
								<div
									class="mt-auto mb-2 flex h-16 grow items-end gap-1"
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
											class="bg-primary hover:bg-accent tooltip tooltip-accent tooltip-top min-h-1 flex-1 rounded-t transition-colors duration-200"
											style="height: {Math.max(height, 6)}%"
											data-tip="{point.period}: {point.views} views"
										></div>
									{/each}
								</div>
								<div class="text-base-content/70 shrink-0 text-xs">
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
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
