<script lang="ts">
	import { NewsletterSignup } from '#lib/components/index.js';
	import { name, website } from '#lib/info.js';
	import type { Newsletter } from '#lib/newsletters.js';
	import { create_seo_config } from '#lib/seo/index.js';
	import { og_image_url } from '#lib/utils/index.js';
	import { format } from 'date-fns';
	import { Head } from 'svead';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let Copy = $derived(data.Copy);
	let newsletters = $derived(data.newsletters);

	// Filter to only show published newsletters
	const published_newsletters = $derived(
		newsletters.filter((n: Newsletter) => n.published),
	);

	const seo_config = create_seo_config({
		title: `Coding Agents, MCP, and Svelte Newsletter — ${name}`,
		description: `Occasional first-hand notes from ${name} about coding agents, MCP tools, production AI systems, SvelteKit, and open-source developer tooling.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Newsletter`,
		),
		url: `${website}/newsletter`,
		slug: 'newsletter',
	});
</script>

<Head {seo_config} />

<div class="all-prose">
	<Copy />
</div>

<NewsletterSignup />

<!-- Newsletter Articles -->
{#if published_newsletters.length > 0}
	<div class="mt-16 mb-10">
		<h2 class="mb-8 text-4xl font-black">Past Newsletters</h2>
		<div class="space-y-6">
			{#each published_newsletters as newsletter (newsletter.slug)}
				<article
					class="card border border-primary bg-base-100 p-6 transition hover:bg-base-200"
				>
					<a href={`/newsletter/${newsletter.slug}`}>
						<h3 class="mb-2 text-2xl font-bold">
							{newsletter.title}
						</h3>
						<time
							class="text-sm text-base-content/70"
							datetime={new Date(newsletter.date).toISOString()}
						>
							{format(new Date(newsletter.date), 'MMMM d, yyyy')}
						</time>
					</a>
				</article>
			{/each}
		</div>
	</div>
{/if}

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>
