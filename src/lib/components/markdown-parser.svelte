<script lang="ts">
	import { marked } from 'marked'
	interface Props {
		markdownContent?: string
		rows?: number
	}

	let { markdownContent = $bindable(''), rows = 3 }: Props = $props()

	let markdown = $derived(marked(markdownContent))
</script>

<div class="prose mb-10 xs:grid xs:grid-cols-2 xs:gap-10">
	<textarea
		{rows}
		bind:value={markdownContent}
		class="h-full w-full resize-none rounded-box border border-base-100 bg-base-200 p-2"
	></textarea>

	<div class="w-full">{@html markdown}</div>
</div>
