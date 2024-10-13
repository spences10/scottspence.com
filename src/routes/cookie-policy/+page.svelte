<script lang="ts">
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let { Copy } = data

	const seo_config = create_seo_config({
		title: `Cookie Policy - ${name}`,
		description: `${name} Cookie Policy page.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Cookie Policy`,
		),
		url: `${website}/cookie-policy`,
		slug: 'cookie-policy',
	})
</script>

<Head {seo_config} />

<div class="all-prose">
	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
