<script lang="ts">
	import type { Snippet } from 'svelte'
	import { slide } from 'svelte/transition'
	interface Props {
		button_text?: string
		is_open?: boolean
		styles?: string
		children?: Snippet
	}

	let {
		button_text = '',
		is_open = $bindable(false),
		styles = '',
		children,
	}: Props = $props()
</script>

<div>
	<button
		class="btn {styles} shadow-xl"
		onclick={() => (is_open = !is_open)}
		data-testid="details-button"
	>
		{is_open ? `Close` : button_text}
	</button>
	{#if is_open}
		<div transition:slide|global data-testid="details-content">
			{@render children?.()}
		</div>
	{/if}
</div>
