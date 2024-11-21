<script lang="ts">
	import Bluesky from '$lib/icons/bluesky.svelte'

	interface Props {
		button_text?: string
		post_text?: string
		button_class?: string
	}

	let {
		button_text = '',
		post_text = '',
		button_class = '',
	}: Props = $props()
</script>

<a
	class="btn btn-lg inline-flex items-center gap-2 {button_class}"
	rel="noreferrer noopener"
	target="_blank"
	href={`https://bsky.app/intent/compose?text=${encodeURI(post_text)}`}
	aria-label={`Post on Bluesky: ${post_text}`}
>
	<span>{button_text}</span>
	<Bluesky flutter={true} />
</a>
