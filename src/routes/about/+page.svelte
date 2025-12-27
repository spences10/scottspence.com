<script lang="ts">
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let Copy = $derived(data.Copy)

	const seo_config = create_seo_config({
		title: `About - ${name}`,
		description: `Some info about ${name}`,
		open_graph_image: og_image_url(name, `scottspence.com`, `About`),
		url: `${website}/about`,
		slug: 'about',
	})
</script>

<Head {seo_config} />

<div class="all-prose">
	<h1>About</h1>

	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
