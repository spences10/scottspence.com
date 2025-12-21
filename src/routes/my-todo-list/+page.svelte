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
		title: `My Todo List - ${name}`,
		description: `My list of todo items. Updated irregularly, check last updated date.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`My todo list.`,
		),
		url: `${website}/my-todo-list`,
		slug: 'my-todo-list',
	})
</script>

<Head {seo_config} />

<div class="all-prose">
	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
