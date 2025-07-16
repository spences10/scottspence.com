<script lang="ts">
	import { page } from '$app/state'
	import { number_crunch } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import { get_popular_posts } from '../../routes/popular-posts.remote'

	let selected_period: 'day' | 'month' | 'year' = $state('year')
	let popular_posts_query = $state(get_popular_posts(undefined))
</script>

{#if popular_posts_query.error}
	<div class="alert alert-error">
		<p>
			Error loading popular posts: {popular_posts_query.error.message}
		</p>
	</div>
{:else if popular_posts_query.pending}
	<div class="loading loading-spinner loading-lg mx-auto"></div>
{:else if popular_posts_query.current && popular_posts_query.current.length > 0}
	<div class="xs:-mx-30 m-0 mb-20 lg:-mx-40">
		<p class="mb-8 text-xl">
			Take a look at some popular content from me...
			<select
				bind:value={selected_period}
				class="select select-sm border-secondary w-40 border"
			>
				<option value="day">Views today</option>
				<option value="month">Views this month</option>
				<option value="year">Views this year</option>
			</select>
		</p>

		<div
			class="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
		>
			{#each popular_posts_query.current
				.filter((p) => p.period === selected_period)
				.slice(0, 4) as post}
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
