<script lang="ts">
	import { page } from '$app/state'
	import { get_popular_posts } from '$lib/data/popular-posts.remote'
	import { Eye } from '$lib/icons'
	import { name, SITE_LINKS, SOCIAL_LINKS } from '$lib/info'
	import { number_crunch } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import { onMount } from 'svelte'
	import LiveVisitors from './live-visitors.svelte'

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
		popular_posts[selected_period].slice(0, 6),
	)

	onMount(async () => {
		popular_posts = await get_popular_posts()
	})
</script>

<footer
	class="footer sm:footer-horizontal bg-primary text-primary-content p-10"
>
	<nav>
		<h6 class="footer-title">Popular Posts</h6>
		{#each posts as post}
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

		<LiveVisitors />
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
