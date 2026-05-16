<script lang="ts">
	import { differenceInDays, format } from 'date-fns'

	const { post }: { post: Post } = $props()
</script>

<div class="relative">
	<div
		class="absolute inset-0 rounded-box bg-linear-to-r from-primary to-secondary blur-sm"
	></div>
	<div class="relative">
		<article
			class="card mb-10 bg-base-100 p-5 transition first:pt-0 hover:text-accent"
		>
			<a href={`/posts/${post.slug}`}>
				<div>
					<h2 class="mt-5 mb-2 text-3xl font-black text-balance">
						{post.title}
					</h2>
					<div class="mb-4 text-sm font-bold text-accent uppercase">
						<time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
						&bull;
						<span>{post.reading_time_text}</span>
						{#if differenceInDays(new Date(), new Date(post.date)) < 31}
							<span
								class="relative -top-0.5 ml-1 badge bg-primary badge-sm text-primary-content hover:bg-secondary hover:text-secondary-content"
							>
								new
							</span>
						{/if}
					</div>
				</div>
				<div class="all-prose">
					{@html post.preview_html || post.preview}
				</div>
			</a>
		</article>
	</div>
</div>
