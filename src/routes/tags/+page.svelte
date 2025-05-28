<script lang="ts">
	import { InformationCircle } from '$lib/icons'
	import { description, name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { number_crunch, og_image_url } from '$lib/utils'
	import { Head } from 'svead'
	import { quintOut } from 'svelte/easing'
	import { fade, scale } from 'svelte/transition'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let { tags, posts_by_tag } = data

	let query = $state('')
	let sort_by = $state('post_count') // 'alphabetical', 'post_count'
	let sort_order = $state('desc') // 'asc', 'desc'

	let filtered_tags = $derived(
		tags.filter((tag: string) => {
			if (query === '') return true
			return tag.toLowerCase().includes(query.toLowerCase())
		}),
	)

	let sorted_tags = $derived.by(() => {
		const tags_with_counts = filtered_tags.map((tag: string) => ({
			name: tag,
			count: posts_by_tag[tag].length,
		}))

		return tags_with_counts.sort(
			(
				a: { name: string; count: number },
				b: { name: string; count: number },
			) => {
				let comparison = 0

				if (sort_by === 'alphabetical') {
					comparison = a.name.localeCompare(b.name)
				} else if (sort_by === 'post_count') {
					comparison = a.count - b.count
				}

				return sort_order === 'desc' ? -comparison : comparison
			},
		)
	})

	// Calculate summary statistics
	let summary_stats = $derived.by(() => {
		const total_tags = tags.length // All available tags, not just filtered
		const filtered_tags_count = filtered_tags.length // Currently displayed tags

		// Get unique posts across all tags (avoiding double counting)
		const unique_posts = new Set()
		Object.values(posts_by_tag).forEach((posts: any) => {
			posts.forEach((post: any) =>
				unique_posts.add(post.slug || post.title || post),
			)
		})
		const total_unique_posts = unique_posts.size

		// Total tag-post relationships (posts can appear in multiple tags)
		const total_tag_relationships = Object.values(
			posts_by_tag,
		).reduce((sum: number, posts: any) => sum + posts.length, 0)

		const avg_posts_per_tag =
			total_tags > 0
				? Math.round(total_tag_relationships / total_tags)
				: 0
		const max_posts = Math.max(
			...Object.values(posts_by_tag).map(
				(posts: any) => posts.length,
			),
		)
		const min_posts = Math.min(
			...Object.values(posts_by_tag).map(
				(posts: any) => posts.length,
			),
		)

		return {
			total_tags,
			filtered_tags_count,
			total_unique_posts,
			total_tag_relationships,
			avg_posts_per_tag,
			max_posts,
			min_posts,
		}
	})

	const seo_config = create_seo_config({
		title: `Posts by tag - ${name}`,
		description,
		open_graph_image: og_image_url(name, `scottspence.com`, `Tags`),
		url: `${website}/tags`,
		slug: 'tags',
	})
</script>

<Head {seo_config} />

<div class="prose prose-xl mx-auto mb-6">
	<h1>Posts by Tag</h1>
	<p>
		Explore all the topics covered on this blog. Use the controls
		below to search and sort tags by popularity or alphabetically.
	</p>
</div>

<!-- Summary Statistics Cards -->
<div
	class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
>
	<div
		class="stat bg-base-200 rounded-lg shadow"
		in:scale={{ duration: 400, delay: 0, easing: quintOut }}
	>
		<div class="stat-title">Total Tags</div>
		<div class="stat-value text-primary">
			{number_crunch(summary_stats.total_tags)}
		</div>
		<div class="stat-desc">Available topics</div>
	</div>

	<div
		class="stat bg-base-200 rounded-lg shadow"
		in:scale={{ duration: 400, delay: 100, easing: quintOut }}
	>
		<div class="stat-title">Unique Posts</div>
		<div class="stat-value text-secondary">
			{number_crunch(summary_stats.total_unique_posts)}
		</div>
		<div class="stat-desc">Across all tags</div>
	</div>

	<div
		class="stat bg-base-200 rounded-lg shadow"
		in:scale={{ duration: 400, delay: 200, easing: quintOut }}
	>
		<div class="stat-title">Average Posts</div>
		<div class="stat-value text-accent">
			{number_crunch(summary_stats.avg_posts_per_tag)}
		</div>
		<div class="stat-desc">Per tag</div>
	</div>

	<div
		class="stat bg-base-200 rounded-lg shadow"
		in:scale={{ duration: 400, delay: 300, easing: quintOut }}
	>
		<div class="stat-title">Most Popular</div>
		<div class="stat-value text-info">
			{number_crunch(summary_stats.max_posts)}
		</div>
		<div class="stat-desc">Posts in one tag</div>
	</div>
</div>

<!-- Controls -->
<div class="bg-base-200 mb-8 space-y-4 rounded-lg p-4">
	<div class="flex flex-wrap gap-4">
		<fieldset class="min-w-64 flex-1">
			<label class="label-text" for="search">Search tags...</label>
			<input
				type="text"
				bind:value={query}
				id="search"
				placeholder="Search"
				class="input input-bordered input-primary w-full"
			/>
		</fieldset>

		<fieldset class="min-w-48">
			<label class="label-text" for="sort-by">Sort by</label>
			<select
				bind:value={sort_by}
				id="sort-by"
				class="select select-bordered w-full"
				aria-label="Sort tags by:"
			>
				<option value="post_count">Post Count</option>
				<option value="alphabetical">Alphabetical</option>
			</select>
		</fieldset>

		<fieldset class="min-w-32">
			<label class="label-text" for="sort-order">Order</label>
			<select
				bind:value={sort_order}
				id="sort-order"
				class="select select-bordered w-full"
				aria-label="Sort order:"
			>
				<option value="desc">Descending</option>
				<option value="asc">Ascending</option>
			</select>
		</fieldset>
	</div>

	<div class="flex items-center gap-2">
		<span class="text-sm font-semibold">Showing:</span>
		<div class="badge badge-primary badge-lg font-mono">
			{filtered_tags.length} of {tags.length} tags
		</div>
	</div>
</div>

<!-- Tags Grid -->
<div
	class="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
	{#each sorted_tags as tag, index (tag.name)}
		{@const percentage =
			summary_stats.max_posts > 0
				? (tag.count / summary_stats.max_posts) * 100
				: 0}
		<div
			class="card bg-base-100 tag-card shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
			in:scale={{
				duration: 300,
				delay: index * 50,
				easing: quintOut,
			}}
			out:scale={{ duration: 200, easing: quintOut }}
		>
			<div class="card-body p-4">
				<div class="mb-2 flex items-center justify-between">
					<h3 class="card-title text-lg">
						<a
							class="link hover:text-primary transition-colors duration-200"
							href={`tags/${tag.name}`}
						>
							{tag.name}
						</a>
					</h3>
					<div
						class="badge badge-secondary font-mono transition-transform duration-200 hover:scale-110"
					>
						{tag.count}
					</div>
				</div>

				<!-- Visual indicator of tag popularity -->
				<div
					class="bg-base-200 mb-2 h-2 w-full overflow-hidden rounded-full"
				>
					<div
						class="bg-primary progress-bar h-2 rounded-full"
						style="width: {Math.max(percentage, 5)}%"
					></div>
				</div>

				<div
					class="text-base-content/70 text-sm transition-colors duration-200"
				>
					{tag.count}
					{tag.count === 1 ? 'post' : 'posts'}
				</div>
			</div>
		</div>
	{/each}
</div>

{#if filtered_tags.length === 0}
	<div
		class="alert alert-info mb-20"
		in:fade={{ duration: 300, delay: 200 }}
	>
		<InformationCircle />
		<span>
			No tags found matching "{query}". Try a different search term.
		</span>
	</div>
{/if}

<style>
	.tag-card {
		transform-origin: center;
		will-change: transform, box-shadow;
	}

	.tag-card:hover {
		transform: translateY(-2px) scale(1.02);
	}

	.progress-bar {
		animation: progressGrow 0.8s ease-out forwards;
		transform-origin: left;
		will-change: transform;
	}

	@keyframes progressGrow {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	/* Smooth transitions for all interactive elements */
	.tag-card .link {
		position: relative;
	}

	.tag-card .link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: currentColor;
		transition: width 0.3s ease;
	}

	.tag-card:hover .link::after {
		width: 100%;
	}

	/* Enhanced focus states for accessibility */
	.tag-card .link:focus-visible {
		outline: 2px solid hsl(var(--p));
		outline-offset: 2px;
		border-radius: 4px;
	}

	/* Smooth badge hover effect */
	.badge {
		transition: all 0.2s ease;
	}

	.tag-card:hover .badge {
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
</style>
