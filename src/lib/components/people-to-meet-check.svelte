<script lang="ts">
	interface Props {
		met?: boolean
	}

	let { met = false }: Props = $props()

	let noBorder = `rounded-box flex border-1 h-5 mr-2 w-5 block relative items-center justify-start overflow-hidden`
	let border = `border border-primary ${noBorder}`
</script>

<span class={met ? noBorder : border}>
	{#if met}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="bg-primary text-primary-content block h-5 w-5 fill-current"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
</span>
