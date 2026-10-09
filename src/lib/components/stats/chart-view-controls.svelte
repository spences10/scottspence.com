<script lang="ts">
	interface Props {
		on_turn: (degrees: number) => void;
		on_reset: () => void;
		// Only charts that can lie flat offer the toggle
		flat?: boolean;
		on_flat?: () => void;
		// What the buttons act on, for charts that share a page
		label?: string;
	}

	let {
		on_turn,
		on_reset,
		flat = false,
		on_flat,
		label = 'chart',
	}: Props = $props();

	const turn_step = 45;
</script>

<div class="join" role="group" aria-label="{label} view">
	<button
		class="btn join-item btn-xs"
		aria-label="Turn {label} left"
		onclick={() => on_turn(-turn_step)}
	>
		↺
	</button>
	<button
		class="btn join-item btn-xs"
		aria-label="Turn {label} right"
		onclick={() => on_turn(turn_step)}
	>
		↻
	</button>
	{#if on_flat}
		<button
			class="btn join-item btn-xs {flat ? 'btn-primary' : ''}"
			aria-pressed={flat}
			onclick={on_flat}
		>
			Flat
		</button>
	{/if}
	<button
		class="btn join-item btn-xs"
		aria-label="Reset {label} view"
		onclick={on_reset}
	>
		Reset
	</button>
</div>
