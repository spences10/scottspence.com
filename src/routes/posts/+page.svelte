<script lang="ts">
	import { PostCard } from '#lib/components/index.js';
	import { name, website } from '#lib/info.js';
	import { create_seo_config } from '#lib/seo/index.js';
	import { command_palette_state } from '#lib/state/command-palette.svelte.js';
	import { og_image_url } from '#lib/utils/index.js';
	import { Head } from 'svead';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
	const posts = $derived(data.posts);

	let public_posts = $derived(
		posts.filter(
			(post: { is_private: boolean }) => post && !post.is_private,
		),
	);

	const seo_config = create_seo_config({
		title: `AI Engineering, Coding Agents and Svelte Articles — ${name}`,
		description: `Practical articles by ${name} about coding agents, MCP tools, production AI systems, SvelteKit, developer tooling, and engineering leadership.`,
		append_site_name: false,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Thoughts Pamphlet`,
		),
		url: `${website}/posts`,
		slug: 'posts',
	});
</script>

<Head {seo_config} />

<div class="mb-10">
	<label for="search" class="label mb-2 text-sm">
		<span class="label-text">
			Search {public_posts.length} posts...
		</span>
	</label>
	<input
		data-testid="search"
		id="search"
		class="input-bordered input w-full cursor-pointer input-lg input-primary"
		type="text"
		placeholder="Search... (Ctrl+K)"
		readonly
		onclick={() => command_palette_state.open()}
	/>
</div>

<!-- hacky bs to stop the post loading on hover -->
<div data-sveltekit-preload-data="false">
	{#each public_posts as post (post.slug)}
		<PostCard {post} />
	{/each}
</div>
