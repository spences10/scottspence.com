<script lang="ts">
	import Bluesky from '$lib/icons/bluesky.svelte'

	interface Props {
		buttonText?: string
		postText?: string
	}

	let { buttonText = '', postText = '' }: Props = $props()
</script>

<a
	class="btn btn-lg"
	rel="noreferrer noopener"
	target="_blank"
	href={`https://bsky.app/intent/compose?text=${encodeURI(postText)}`}
	aria-label={`Post on Bluesky: ${postText}`}
>
	<div class="flex items-center" role="presentation">
		<span class="mr-3">{buttonText}</span>
		<Bluesky />
	</div>
</a>
