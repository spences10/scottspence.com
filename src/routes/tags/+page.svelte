<script lang="ts">
	import { description, name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let { tags, posts_by_tag } = data

	let query = $state('')

	let filtered_tags = $derived(
		tags.filter((tag: string) => {
			if (query === '') return true
			return tag.toLowerCase().includes(query.toLowerCase())
		}),
	)

	const seo_config = create_seo_config({
		title: `Posts by tag - ${name}`,
		description,
		open_graph_image: og_image_url(name, `scottspence.com`, `Tags`),
		url: `${website}/tags`,
		slug: 'tags',
	})
</script>

<Head {seo_config} />

<h1 class="mb-5 text-5xl font-bold">Posts by Tag</h1>

<div class="form-control mb-10">
	<label for="search" class="label">
		<span class="label-text">Search tags...</span>
	</label>
	<input
		type="text"
		bind:value={query}
		id="search"
		placeholder="Search"
		class="input input-bordered input-primary"
	/>
</div>

<ul class="mb-20 flex flex-wrap justify-start">
	{#each filtered_tags as tag (tag)}
		<li class="my-4 text-xl">
			<a
				class="link mr-6 transition hover:text-primary"
				href={`tags/${tag}`}
			>
				{tag} ({posts_by_tag[tag].length})
			</a>
		</li>
	{/each}
</ul>
