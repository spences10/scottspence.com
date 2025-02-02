<script lang="ts">
	import { page } from '$app/state'
	import { PostCard } from '$lib/components'
	import { description, name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { create_posts_index, search_posts } from '$lib/utils/search'
	import { Head } from 'svead'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	let { data } = $props<{ data: PageData }>()
	const posts = $state(data.posts)

	let search_query = $state(page.url.searchParams.get('search') || '')
	let search_results = $state(data.posts)
	let search_status = $state<'loading' | 'ready'>('loading')

	onMount(() => {
		create_posts_index(data.posts)
		search_status = 'ready'
	})

	$effect(() => {
		if (search_status === 'ready' && search_query) {
			search_results = search_posts(search_query)
		} else {
			search_results = data.posts
		}
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

<div class="form-control mb-10">
	<label for="search" class="label">
		<span class="label-text">
			Search {search_results.length} posts...
		</span>
	</label>
	<input
		data-testid="search"
		id="search"
		class="input input-bordered input-primary"
		type="text"
		placeholder="Search..."
		bind:value={search_query}
		autocomplete="off"
		spellcheck="false"
	/>
</div>

{#each search_results as post (post.slug)}
	<PostCard {post} />
{/each}
