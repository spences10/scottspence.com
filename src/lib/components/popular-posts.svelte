<script lang="ts">
	import { page } from '$app/state'
	import { track_click } from '$lib/analytics/track-click.remote'
	import { get_popular_posts } from '$lib/data/popular-posts.remote'
	import { number_crunch } from '$lib/utils'

	type PopularPostsPeriod = keyof PopularPosts
	let selected_period: PopularPostsPeriod = $state(
		'popular_posts_yearly',
	)

	const popular_posts_query = get_popular_posts()
</script>

{#await popular_posts_query then popular_posts}
	{@const posts = popular_posts[selected_period].slice(0, 4)}
	{#if posts.length}
		<div class="xs:-mx-30 m-0 mb-20 lg:-mx-40">
			<p class="mb-8 text-xl">
				Take a look at some popular content from me...
				<select
					bind:value={selected_period}
					onchange={() => {
						const labels: Record<PopularPostsPeriod, string> = {
							popular_posts_daily: 'today',
							popular_posts_monthly: 'this month',
							popular_posts_yearly: 'this year',
						}
						track_click({
							event_name: `popular posts period: ${labels[selected_period]}`,
						})
					}}
					class="select select-sm border-secondary w-40 border"
				>
					<option value="popular_posts_daily">Views today</option>
					<option value="popular_posts_monthly"
						>Views this month</option
					>
					<option value="popular_posts_yearly">Views this year</option
					>
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
							track_click({
								event_name: `popular post click: ${post.title}`,
							})}
						class="h-full"
					>
						<aside
							class="card rounded-box border-secondary hover:text-accent h-full border p-5 font-bold shadow-lg transition"
						>
							<h3 class="mb-5 line-clamp-3 text-2xl text-balance">
								{post.title}
							</h3>
							<div class="mt-5">
								<span
									class="text-primary absolute bottom-0 mb-4 tabular-nums"
								>
									Views: {number_crunch(post.pageviews)}
								</span>
							</div>
						</aside>
					</a>
				{/each}
			</div>
		</div>
	{/if}
{/await}
