<script lang="ts">
	import { format_countries } from '$lib/analytics/analytics.helpers'
	import { get_active_visitors } from '$lib/analytics/analytics.remote'
	import { Eye } from '$lib/icons'
	import { slide, fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	let expanded = $state(false)
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
			<span class="btn btn-sm btn-ghost loading loading-spinner"></span>
		{/snippet}

		{@const result = await data}
		{#if result.total > 0}
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
				<span class="font-bold">{result.total}</span>
				live {result.total === 1 ? 'visitor' : 'visitors'}
				{#if result.bots > 0}
					<span class="opacity-60">(+{result.bots} 🤖)</span>
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
						<!-- Countries -->
						{#if result.countries.length > 0}
							<section class="mb-4">
								<h4
									class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
								>
									<span>🌍</span> Visiting from
								</h4>
								<p class="text-lg">
									{format_countries(result.countries)}
								</p>
							</section>
						{/if}

						<!-- Devices & Browsers -->
						<section class="mb-4 grid grid-cols-2 gap-4">
							{#if result.devices.length > 0}
								<div>
									<h4
										class="text-secondary mb-2 text-xs font-bold uppercase tracking-wide"
									>
										Devices
									</h4>
									<div class="flex flex-wrap gap-2">
										{#each result.devices as { name, count }}
											<span
												class="badge badge-outline gap-1"
											>
												{device_emoji(name)}
												{count}
											</span>
										{/each}
									</div>
								</div>
							{/if}
							{#if result.browsers.length > 0}
								<div>
									<h4
										class="text-secondary mb-2 text-xs font-bold uppercase tracking-wide"
									>
										Browsers
									</h4>
									<div class="flex flex-wrap gap-2">
										{#each result.browsers as { name, count }}
											<span
												class="badge badge-outline gap-1"
											>
												{browser_emoji(name)}
												{count}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</section>

						<!-- Referrers -->
						{#if result.referrers.length > 0}
							<section class="mb-4">
								<h4
									class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
								>
									<span>🔗</span> Came from
								</h4>
								<div class="flex flex-wrap gap-2">
									{#each result.referrers as { name, count }}
										<span class="badge badge-primary gap-1">
											<span class="font-bold">{count}</span
											>
											{name}
										</span>
									{/each}
								</div>
							</section>
						{/if}

						<!-- Pages -->
						{#if result.pages.length > 0}
							<section>
								<h4
									class="text-secondary mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
								>
									<Eye />
									Viewing now
								</h4>
								<ul class="space-y-1">
									{#each result.pages as { path, count, title }}
										<li
											class="flex items-center justify-between"
										>
											<a
												href={path}
												class="link link-hover flex-1 truncate"
											>
												{format_path(path, title)}
											</a>
											<span
												class="badge badge-sm badge-ghost ml-2"
											>
												{count}
											</span>
										</li>
									{/each}
								</ul>
							</section>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</svelte:boundary>
</div>
