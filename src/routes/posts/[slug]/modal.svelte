<script lang="ts">
	let {
		modal = $bindable(),
		children,
		onclose,
	}: {
		children: any
		modal: HTMLDialogElement
		onclose: () => void
	} = $props()

	const handle_keydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === 'Space') {
			onclose()
		}
	}
</script>

<dialog class="modal modal-middle" bind:this={modal} {onclose}>
	<div class="modal-box max-w-2xl">
		<div class="modal-content">
			{@render children()}
		</div>
	</div>
	<button
		type="button"
		class="modal-backdrop"
		onclick={onclose}
		onkeydown={handle_keydown}
		aria-label="Close modal"
	></button>
</dialog>

<style>
	.modal-middle {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-box {
		position: relative;
		margin: auto;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		border: none;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
</style>
