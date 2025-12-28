<script lang="ts">
	import { page } from '$app/state'
	import { get_popular_posts } from '$lib/data/popular-posts.remote'
	import { number_crunch } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import { onMount } from 'svelte'

	type PopularPostsPeriod = keyof PopularPosts
	let selected_period: PopularPostsPeriod = $state(
		'popular_posts_yearly',
	)

	let popular_posts: PopularPosts = $state({
		popular_posts_daily: [],
		popular_posts_monthly: [],
		popular_posts_yearly: [],
	})

	let posts: PopularPost[] = $derived(
		popular_posts[selected_period].slice(0, 4),
	)

	onMount(async () => {
		popular_posts = await get_popular_posts()
	})
</script>

{#if posts.length}
	<div class="xs:-mx-30 m-0 mb-20 lg:-mx-40">
		<p class="mb-8 text-xl">
			Take a look at some popular content from me...
			<select
				bind:value={selected_period}
				class="select select-sm border-secondary w-40 border"
			>
				<option value="popular_posts_daily">Views today</option>
				<option value="popular_posts_monthly">Views this month</option
				>
				<option value="popular_posts_yearly">Views this year</option>
			</select>
		</p>

		<div
			class="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
		>
			{#each posts as post}
				<a
					data-sveltekit-reload
					href={page.url.origin + post.pathname}
					onclick={() =>
						Fathom.trackEvent(`popular post click: ${post.title}`)}
					class="h-full"
				>
					<aside
						class="card rounded-box border-secondary hover:text-accent h-full border p-5 font-bold shadow-lg transition"
					>
						<h3 class="mb-5 text-2xl">
							{post.title}
						</h3>
						<div class="mt-5">
							<span class="text-primary absolute bottom-0 mb-4">
								Views: {number_crunch(post.pageviews)}
							</span>
						</div>
					</aside>
				</a>
			{/each}
		</div>
	</div>
{/if}
