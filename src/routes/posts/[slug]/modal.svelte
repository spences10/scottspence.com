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
</script>

<dialog
	class="max-w-2xl rounded-box"
	bind:this={modal}
	id="add_link_modal"
	{onclose}
>
	{@render children()}
</dialog>
