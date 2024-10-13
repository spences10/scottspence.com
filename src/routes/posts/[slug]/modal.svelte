<script lang="ts">
	let {
		modal = $bindable(),
		children,
	}: { children: any; modal: HTMLDialogElement } = $props()
</script>

<dialog
	class="max-w-2xl rounded-box"
	bind:this={modal}
	id="add_link_modal"
>
	{@render children()}
</dialog>
