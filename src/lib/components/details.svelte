<script lang="ts">
	import type { Snippet } from 'svelte'
	import { slide } from 'svelte/transition'
	interface Props {
		buttonText?: string
		isOpen?: boolean
		styles?: string
		children?: Snippet
	}

	let {
		buttonText = '',
		isOpen = $bindable(false),
		styles = '',
		children,
	}: Props = $props()
</script>

<div>
	<button
		class="btn {styles} shadow-xl"
		onclick={() => (isOpen = !isOpen)}
		data-testid="details-button"
	>
		{isOpen ? `Close` : buttonText}
	</button>
	{#if isOpen}
		<div transition:slide|global data-testid="details-content">
			{@render children?.()}
		</div>
	{/if}
</div>
