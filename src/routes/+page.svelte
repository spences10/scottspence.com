<script lang="ts">
	import { Head, SchemaOrg, type SchemaOrgProps } from 'svead';

	import {
		LandingHero,
		PeopleToMeet,
	} from '#lib/components/index.js';
	import { description, website } from '#lib/info.js';
	import {
		default_seo_config,
		person_schema,
		website_schema,
	} from '#lib/seo/index.js';

	import type { SeoConfig } from 'svead';

	const seo_config: SeoConfig = {
		...default_seo_config,
		title: 'Scott Spence — Product Engineer and Svelte Consultant',
		description,
		url: website,
		website,
	};

	const schema_org_config = {
		'@context': 'https://schema.org',
		'@graph': [website_schema, person_schema],
	} as unknown as SchemaOrgProps['schema'];

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let Copy = $derived(data.Copy);
</script>

<Head {seo_config} />
<SchemaOrg schema={schema_org_config} />

<LandingHero />

<article class="all-prose mb-10">
	<Copy />
</article>

<PeopleToMeet />

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
