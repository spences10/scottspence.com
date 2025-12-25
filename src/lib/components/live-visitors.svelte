<script lang="ts">
	import { format_countries } from '$lib/analytics/analytics.helpers'
	import { get_active_visitors } from '$lib/analytics/analytics.remote'
	import { Eye } from '$lib/icons'
	import { cubicOut } from 'svelte/easing'
	import { fade, slide } from 'svelte/transition'

	let expanded = $state(false)
	let show_bots = $state(false)
	const data = get_active_visitors({ limit: 10 })

	$effect(() => {
		const interval = setInterval(() => data.refresh(), 5_000)
		return () => clearInterval(interval)
	})

	const device_emoji = (device: string) => {
		if (device === 'mobile') return '📱'
		if (device === 'tablet') return '📟'
		return '🖥️'
	}

	const browser_emoji = (browser: string) => {
		const b = browser.toLowerCase()
		if (b.includes('chrome')) return '🌐'
		if (b.includes('firefox')) return '🦊'
		if (b.includes('safari')) return '🧭'
		if (b.includes('edge')) return '🔷'
		return '🌍'
	}

	const format_path = (path: string, title?: string) => {
		if (title) return title
		if (path === '/') return 'Home'
		return path.replace(/^\//, '').replace(/-/g, ' ')
	}
</script>

<div class="inline-block">
	<svelte:boundary>
		{#snippet pending()}
			<span class="btn btn-sm btn-ghost loading loading-spinner"
			></span>
		{/snippet}

		{@const result = await data}
		{@const current = show_bots ? result.bots : result.humans}
		{@const has_traffic =
			result.humans.total > 0 || result.bots.total > 0}

		{#if has_traffic}
			<button
				onclick={() => (expanded = !expanded)}
				class="btn btn-secondary btn-sm gap-2 shadow-lg"
				aria-expanded={expanded}
			>
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
					></span>
					<span
						class="relative inline-flex h-2 w-2 rounded-full bg-green-500"
					></span>
				</span>
				<span class="font-bold">{result.humans.total}</span>
				live {result.humans.total === 1 ? 'visitor' : 'visitors'}
				{#if result.bots.total > 0}
					<span class="opacity-60">(+{result.bots.total} 🤖)</span>
				{/if}
				<svg
					class="h-4 w-4 transition-transform duration-200"
					class:rotate-180={expanded}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if expanded}
				<div
					transition:slide={{ duration: 300, easing: cubicOut }}
					class="rounded-box border-secondary bg-base-100 mt-2 overflow-hidden border shadow-xl"
				>
					<div
						in:fade={{ duration: 200, delay: 100 }}
						class="p-4 text-sm"
					>
						<!-- Toggle between humans and bots -->
						{#if result.bots.total > 0}
							<div class="mb-4 flex justify-center">
								<div class="join">
									<button
										class="join-item btn btn-sm"
										class:btn-active={!show_bots}
										onclick={() => (show_bots = false)}
									>
										👤 Humans
										<span class="badge badge-sm ml-1">
											{result.humans.total}
										</span>
									</button>
									<button
										class="join-item btn btn-sm"
										class:btn-active={show_bots}
										onclick={() => (show_bots = true)}
									>
										🤖 Bots
										<span class="badge badge-sm ml-1">
											{result.bots.total}
										</span>
									</button>
								</div>
							</div>
						{/if}

						{#if current.total === 0}
							<p class="text-base-content/50 text-center">
								No {show_bots ? 'bot' : 'human'} traffic right now
							</p>
						{:else}
							<!-- Countries -->
							{#if current.countries.length > 0}
								<section class="mb-4">
									<h4
										class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold tracking-wide uppercase"
									>
										<span>🌍</span>
										{show_bots ? 'Crawling from' : 'Visiting from'}
									</h4>
									<p class="text-lg">
										{format_countries(current.countries)}
									</p>
								</section>
							{/if}

							<!-- Devices & Browsers -->
							<section class="mb-4 grid grid-cols-2 gap-4">
								{#if current.devices.length > 0}
									<div>
										<h4
											class="text-secondary mb-2 text-xs font-bold tracking-wide uppercase"
										>
											{show_bots ? 'Bot Types' : 'Devices'}
										</h4>
										<div class="flex flex-wrap gap-2">
											{#each current.devices as { name, count }}
												<span class="badge badge-outline gap-1">
													{show_bots ? '🤖' : device_emoji(name)}
													{count}
												</span>
											{/each}
										</div>
									</div>
								{/if}
								{#if current.browsers.length > 0}
									<div>
										<h4
											class="text-secondary mb-2 text-xs font-bold tracking-wide uppercase"
										>
											{show_bots ? 'User Agents' : 'Browsers'}
										</h4>
										<div class="flex flex-wrap gap-2">
											{#each current.browsers as { name, count }}
												<span
													class="badge badge-outline gap-1"
													class:text-xs={show_bots}
												>
													{show_bots ? '' : browser_emoji(name)}
													{count}
													{name}
												</span>
											{/each}
										</div>
									</div>
								{/if}
							</section>

							<!-- Referrers -->
							{#if current.referrers.length > 0}
								<section class="mb-4">
									<h4
										class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold tracking-wide uppercase"
									>
										<span>🔗</span>
										{show_bots ? 'Source' : 'Came from'}
									</h4>
									<div class="flex flex-wrap gap-2">
										{#each current.referrers as { name, count }}
											<span class="badge badge-primary gap-1">
												<span class="font-bold">{count}</span>
												{name}
											</span>
										{/each}
									</div>
								</section>
							{/if}

							<!-- Pages -->
							{#if current.pages.length > 0}
								<section>
									<h4
										class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold tracking-wide uppercase"
									>
										<Eye />
										{show_bots ? 'Crawling' : 'Viewing now'}
									</h4>
									<ul class="space-y-1">
										{#each current.pages as { path, count, title }}
											<li class="flex items-center justify-between">
												<a
													href={path}
													class="link link-hover flex-1 truncate"
												>
													{format_path(path, title)}
												</a>
												<span class="badge badge-sm badge-ghost ml-2">
													{count}
												</span>
											</li>
										{/each}
									</ul>
								</section>
							{/if}
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</svelte:boundary>
</div>
