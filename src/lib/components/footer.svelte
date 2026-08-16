<script lang="ts">
	import { track_click } from '#lib/analytics/track-click.remote.js';
	import { get_popular_posts } from '#lib/data/popular-posts.remote.js';
	import { Eye } from '#lib/icons/index.js';
	import { name, SITE_LINKS, SOCIAL_LINKS } from '#lib/info.js';
	import { number_crunch } from '#lib/utils/index.js';
	import { page } from '$app/state';
	import LiveVisitors from './live-visitors.svelte';

	const popular_posts_query = get_popular_posts();
</script>

<footer
	class="footer bg-primary p-10 text-primary-content sm:footer-horizontal"
>
	<nav>
		<h6 class="footer-title">Popular Posts</h6>
		{#await popular_posts_query then popular_posts}
			{@const posts = popular_posts.popular_posts_yearly.slice(0, 6)}
			{#each posts as post}
				<p>
					<a
						data-sveltekit-reload
						class="link text-primary-content link-hover"
						href={page.url.origin + post.pathname}
					>
						{post.title}
					</a>
					<span
						class="tooltip relative cursor-pointer font-bold tooltip-secondary text-primary-content"
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
		{/await}

		<LiveVisitors />
	</nav>

	<nav>
		<h6 class="footer-title">Site Links</h6>
		{#each SITE_LINKS as link}
			<a
				href={`/${link.slug}`}
				onclick={() =>
					track_click({
						event_name: link.slug,
						path: page.url.pathname,
					})}
				class="link text-primary-content link-hover"
			>
				{link.title}
			</a>
		{/each}
	</nav>

	<nav>
		<h6 class="footer-title">Socials</h6>
		{#each SOCIAL_LINKS as social}
			<a
				class="link text-primary-content link-hover"
				href={social.link}
				target="_blank"
				rel="noopener noreferrer"
			>
				{social.title}
			</a>
		{/each}
	</nav>
</footer>
<div class="divider m-0 divider-secondary bg-primary"></div>
<div class="bg-primary p-4 text-primary-content">
	<p class="text-center">
		Copyright &copy; 2017 - {`${new Date().getFullYear()}`} - All rights
		reserved
		{name}
	</p>
</div>
