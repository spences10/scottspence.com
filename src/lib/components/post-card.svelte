<script lang="ts">
	import { differenceInDays, format } from 'date-fns'

	const { post }: { post: Post } = $props()
</script>

<div class="relative">
	<div
		class="absolute -inset-0 rounded-box bg-gradient-to-r from-primary to-secondary blur-sm"
	></div>
	<div class="relative">
		<article
			class="card mb-10 bg-base-100 p-5 transition first:pt-0 hover:text-accent"
		>
			<a href={`/posts/${post.slug}`}>
				<div>
					<h2 class="mb-1 mt-5 text-3xl font-black">
						{#if typeof post.title === 'string' && post.title.includes('<mark>')}
							{@html post.title}
						{:else}
							{post.title}
						{/if}
					</h2>
					<div class="mb-4 text-sm font-bold uppercase text-accent">
						<time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
						&bull;
						<span>{post.reading_time_text}</span>
						{#if differenceInDays(new Date(), new Date(post.date)) < 31}
							<span
								class="badge bg-primary text-primary-content hover:bg-secondary hover:text-secondary-content"
							>
								new
							</span>
						{/if}
					</div>
				</div>
				<div class="all-prose">
					{#if typeof post.preview === 'string' && post.preview.includes('<mark>')}
						{@html post.preview}
					{:else}
						{@html post.preview}
					{/if}
				</div>
			</a>
		</article>
	</div>
</div>

<style lang="postcss">
	:global(mark) {
		@apply rounded bg-primary px-1 text-primary-content;
	}
</style>
