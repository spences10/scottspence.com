<script lang="ts">
	import { track_click } from '$lib/analytics/track-click.remote'

	interface RelatedPost {
		slug: string
		title: string
	}

	interface Props {
		related_posts: RelatedPost[]
	}

	let { related_posts }: Props = $props()
</script>

{#if related_posts.length}
	<div class="xs:-mx-30 m-0 mb-20 lg:-mx-40">
		<p class="mb-8 text-xl">Related posts...</p>

		<div
			class="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
		>
			{#each related_posts as post}
				<a
					data-sveltekit-reload
					href={`/posts/${post.slug}`}
					onclick={() =>
						track_click({
							event_name: `related post click: ${post.title}`,
						})}
					class="h-full"
				>
					<aside
						class="card rounded-box border-secondary hover:text-accent h-full border p-5 font-bold shadow-lg transition"
					>
						<h3 class="mb-5 text-2xl">
							{post.title}
						</h3>
					</aside>
				</a>
			{/each}
		</div>
	</div>
{/if}
