<script lang="ts">
	import { ErrorCircle, SuccessCircle } from '$lib/icons'
	import type { Newsletter } from '$lib/newsletters'
	import { format } from 'date-fns'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	const published_newsletters = $derived(
		data.newsletters?.filter((n: Newsletter) => n.published) || [],
	)
</script>

<svelte:head>
	<title>Newsletter Confirmation - Scott Spence</title>
</svelte:head>

<!-- Success/Error Alert Banner -->
{#if data.status === 'success'}
	<div class="alert alert-success mb-8" role="alert">
		<SuccessCircle/>
		<span>{data.message}</span>
	</div>
{:else}
	<div class="alert alert-error mb-8" role="alert">
		<ErrorCircle />
		<span>{data.message}</span>
	</div>
{/if}

<!-- Newsletter List -->
{#if published_newsletters.length > 0}
	<div class="mb-10">
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
							class="text-base-content/70 text-sm"
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
