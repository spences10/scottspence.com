<script lang="ts">
	import { name, website } from '#lib/info.js';
	import {
		create_seo_config,
		person_id,
		person_schema,
	} from '#lib/seo/index.js';
	import { og_image_url } from '#lib/utils/index.js';
	import { Head, SchemaOrg, type SchemaOrgProps } from 'svead';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let Copy = $derived(data.Copy);

	const url = `${website}/about`;
	const seo_config = create_seo_config({
		title: `About ${name} — Product Engineer and Svelte Consultant`,
		description: `Learn about ${name}'s work in production AI systems, coding-agent infrastructure, MCP tools, SvelteKit, engineering leadership, and developer education.`,
		open_graph_image: og_image_url(name, `scottspence.com`, `About`),
		slug: 'about',
		append_site_name: false,
	});

	const schema_org_config = {
		'@context': 'https://schema.org',
		'@graph': [
			person_schema,
			{
				'@type': 'ProfilePage',
				'@id': `${url}#profile`,
				url,
				name: `About ${name}`,
				mainEntity: { '@id': person_id },
			},
		],
	} as unknown as SchemaOrgProps['schema'];
</script>

<Head {seo_config} />
<SchemaOrg schema={schema_org_config} />

<div class="all-prose">
	<h1>About</h1>

	<Copy />
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
