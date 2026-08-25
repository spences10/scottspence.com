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
		title: `What ${name} Is Working on Now`,
		description: `Current product engineering, coding-agent infrastructure, open-source work, writing, and community activity from ${name}.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`What I'm doing now.`,
		),
		url: `${website}/now`,
		slug: 'now',
	});
</script>

<Head {seo_config} />

<div class="all-prose">
	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
