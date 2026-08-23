<script lang="ts">
	import { name, website } from '#lib/info.js';
	import { create_seo_config } from '#lib/seo/index.js';
	import { og_image_url } from '#lib/utils/index.js';
	import { Head } from 'svead';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let Copy = $derived(data.Copy);

	const seo_config = create_seo_config({
		title: `${name}'s AI Engineering and Svelte Portfolio`,
		description: `Explore ${name}'s production AI systems, coding-agent infrastructure, MCP tools, SvelteKit products, and open-source developer tooling.`,
		append_site_name: false,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Scott Spence Portfolio`,
		),
		url: `${website}/portfolio`,
		slug: 'portfolio',
	});
</script>

<Head {seo_config} />

<div class="all-prose">
	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
