<script lang="ts">
	import { page } from '$app/state'
	import { Eye } from '$lib/icons'
	import { name, SITE_LINKS, SOCIAL_LINKS } from '$lib/info'
	import { visitors_store } from '$lib/stores'
	import { number_crunch } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import { get_popular_posts } from '../../routes/popular-posts.remote'
	import CurrentVisitorsData from './current-visitors-data.svelte'

	let selected_period: 'day' | 'month' | 'year' = 'year'
	let show_current_visitor_data = $state(false)

	// Load popular posts using remote function
	let popular_posts = $state(get_popular_posts(selected_period))

	// Update when period changes
	$effect(() => {
		popular_posts = get_popular_posts(selected_period)
	})

	let total_visitors = $state(0)
	$effect(() => {
		if ($visitors_store && $visitors_store.visitor_data) {
			total_visitors = $visitors_store.visitor_data.reduce(
				(total, visitor) => total + visitor.recent_visitors,
				0,
			)
		}
	})
</script>

<footer
	class="footer sm:footer-horizontal bg-primary text-primary-content p-10"
>
	<nav>
		<h6 class="footer-title">Popular Posts</h6>
		{#await popular_posts}
			<div class="loading loading-dots loading-sm"></div>
		{:then posts}
			{#each posts
				.filter((p) => p.period === selected_period)
				.slice(0, 6) as post}
				<p>
					<a
						data-sveltekit-reload
						class="link link-hover text-primary-content"
						href={page.url.origin + post.pathname}
					>
						{post.title}
					</a>
					<span
						class="tooltip tooltip-secondary text-primary-content relative cursor-pointer font-bold"
						data-tip={`
                        Visits: ${number_crunch(post.visits)},
                        Pageviews: ${number_crunch(post.pageviews)}
                        `}
					>
						<Eye />
						{number_crunch(post.pageviews)}
					</span>
				</p>
			{/each}
		{:catch error}
			<p class="text-sm opacity-70">Failed to load popular posts</p>
		{/await}

		{#if total_visitors > 0}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				onmouseenter={() => (show_current_visitor_data = true)}
				onmouseleave={() => (show_current_visitor_data = false)}
				class="inline-block cursor-pointer"
			>
				<p
					class="bg-secondary text-secondary-content rounded-box mt-2 px-4 py-2 tracking-wide shadow-lg"
				>
					There's currently
					<span class="font-bold">
						{total_visitors}
					</span>
					live {total_visitors === 1 ? 'visitor' : 'visitors'}
				</p>
				{#if show_current_visitor_data}
					<CurrentVisitorsData />
				{/if}
			</span>
		{/if}
	</nav>

	<nav>
		<h6 class="footer-title">Site Links</h6>
		{#each SITE_LINKS as link}
			<a
				href={`/${link.slug}`}
				onclick={() => Fathom.trackEvent(link.slug)}
				class="link link-hover text-primary-content"
			>
				{link.title}
			</a>
		{/each}
	</nav>

	<nav>
		<h6 class="footer-title">Socials</h6>
		{#each SOCIAL_LINKS as social}
			<a
				class="link link-hover text-primary-content"
				href={social.link}
				target="_blank"
				rel="noopener noreferrer"
			>
				{social.title}
			</a>
		{/each}
	</nav>
</footer>
<div class="divider divider-secondary bg-primary m-0"></div>
<div class="bg-primary text-primary-content p-4">
	<p class="text-center">
		Copyright &copy; 2017 - {`${new Date().getFullYear()}`} - All rights
		reserved
		{name}
	</p>
</div>
