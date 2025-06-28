<script lang="ts">
	import Bluesky from '$lib/icons/bluesky.svelte'

	interface Props {
		selected_text: string
		post_title: string
		post_url: string
		x: number
		y: number
		visible: boolean
	}

	let { selected_text, post_title, post_url, x, y, visible }: Props =
		$props()

	let bluesky_text = $derived(
		`"${selected_text}"\n\nFrom: ${post_title}\n${post_url}\nvia @scottspence.dev`,
	)
</script>

{#if visible && selected_text.trim()}
	<div
		class="absolute transition-opacity duration-200"
		style="left: {x}px; top: {y}px;"
	>
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-2 shadow-lg"
		>
			<a
				class="btn btn-sm btn-primary inline-flex items-center gap-2"
				rel="noreferrer noopener"
				target="_blank"
				href={`https://bsky.app/intent/compose?text=${encodeURIComponent(bluesky_text)}`}
				aria-label="Share selected text on Bluesky"
			>
				<span>Share</span>
				<Bluesky flutter={true} class_props="text-primary-content" />
			</a>
		</div>
	</div>
{/if}
