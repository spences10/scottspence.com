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
		<span class="text-base font-medium">{label}</span>
	</label>
	<select
		{id}
		bind:value={selected}
		class="select select-sm rounded-box w-full text-sm"
	>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</fieldset>
