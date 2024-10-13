<script lang="ts">
	interface Props {
		id: string
		label: string
		selected: string
		options: string[]
	}

	let { id, label, selected = $bindable(), options }: Props = $props()
</script>

<fieldset>
	<legend class="sr-only">{label}</legend>
	<label for={id} class="label">
		<span class="label-text text-base">{label}</span>
	</label>
	<select
		{id}
		bind:value={selected}
		class="select select-bordered select-sm mb-5 text-sm"
	>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</fieldset>
