<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="small-note text-xs uppercase">
	{@render children?.()}
</div>

<style>
	.small-note {
		line-height: 1.5;
	}

	/* mdsvex next renders paragraphs inside component snippets. Keep
	   their spacing and type within the note, without a negative offset. */
	.small-note :global(p) {
		margin-block: 0;
		font: inherit;
	}
</style>
