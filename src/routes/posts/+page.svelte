<script lang="ts">
	import { page } from '$app/state'
	import { PostCard } from '$lib/components'
	import { description, name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'
	import type { PageData } from './$types'

	const { data } = $props<{ data: PageData }>()
	const posts = $state(data.posts)

	let search_query = $state(page.url.searchParams.get('search') || '')

	let filtered_posts = $derived.by(() => {
		// First filter out private posts
		const public_posts = posts.filter(
			(post: { is_private: boolean }) => !post.is_private,
		)

		// Then apply search filter if there's a search query
		if (search_query === '') return public_posts

		return public_posts.filter((post: Post) => {
			return (
				post.title
					.toLowerCase()
					.includes(search_query.toLowerCase()) ||
				(Array.isArray(post.tags) &&
					post.tags.some((tag) =>
						tag.toLowerCase().includes(search_query.toLowerCase()),
					)) ||
				post.preview
					.toLowerCase()
					.includes(search_query.toLowerCase())
			)
		})
	})

	const seo_config = create_seo_config({
		title: `Welcome! - ${name}`,
		description,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Thoughts Pamphlet`,
		),
		url: `${website}/posts`,
		slug: 'posts',
	})
</script>

<Head {seo_config} />

<div class="mb-10">
	<label for="search" class="label mb-2 text-sm">
		<span class="label-text">
			Search {filtered_posts.length} posts...
		</span>
	</label>
	<input
		data-testid="search"
		id="search"
		class="input input-bordered input-primary input-lg w-full"
		type="text"
		placeholder="Search..."
		bind:value={search_query}
	/>
</div>

{#each filtered_posts as post (post.slug)}
	<PostCard {post} />
{/each}
