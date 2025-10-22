<script lang="ts">
	import { format } from 'date-fns'
	import { NewsletterSignup } from '$lib/components'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { newsletter_subscriber_count_store } from '$lib/stores/index.js'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'
	import type { Newsletter } from '$lib/newsletters'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let { Copy, newsletters } = data

	$newsletter_subscriber_count_store =
		data?.newsletter_subscriber_count

	// Filter to only show published newsletters
	const published_newsletters = $derived(
		newsletters.filter((n: Newsletter) => n.published),
	)

	const seo_config = create_seo_config({
		title: `Newsletter, get updates on what I'm working on - ${name}`,
		description: `Keep up to date with what content I'm creating with my newsletter.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Newsletter`,
		),
		url: `${website}/newsletter`,
		slug: 'newsletter',
	})
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
				<article class="card bg-base-100 hover:bg-base-200 p-6 transition">
					<a href={`/newsletter/${newsletter.slug}`}>
						<h3 class="text-2xl font-bold mb-2">
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
