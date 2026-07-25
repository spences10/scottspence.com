<!--
	button flip example taken from
	https://codesandbox.io/s/svelte-kit-demo-typescript-slxxe
-->
<script lang="ts">
	import { number_crunch } from '$lib/utils'
	import { Spring } from 'svelte/motion'

	let {
		count,
		font_size = 'text-2xl',
		emoji,
		value,
		disabled,
		aria_label,
	}: {
		count: number
		font_size?: string
		emoji: string
		value: string
		disabled: boolean
		aria_label: string
	} = $props()

	const base_width = 2
	const padding = 3
	const character_width = 1
	const displayed_count = Spring.of(() => count)
	let offset = $derived(modulo(displayed_count.current, 1))
	let crunched_number = $derived(number_crunch(count))
	let button_width = $derived(
		base_width +
			padding +
			character_width * crunched_number.length +
			'rem',
	)

	function modulo(n: number, m: number) {
		return ((n % m) + m) % m
	}
</script>

<button
	name="reaction"
	type="submit"
	{value}
	{disabled}
	class="btn relative overflow-hidden rounded-box lowercase shadow-xl btn-primary"
	style:width={button_width}
	title={count > 1000 ? `${value} ${count}` : ''}
	aria-label={aria_label}
>
	<div
		class="absolute left-14 h-full"
		style="transform: translate(0, {100 * offset}%)"
	>
		<div
			class="absolute flex h-full items-center {font_size}"
			style="top: -100%"
			style:width={button_width}
			aria-hidden="true"
		>
			<strong class="font-bold">
				{number_crunch(Math.floor(displayed_count.current + 1))}
			</strong>
		</div>
		<div
			class="absolute flex h-full items-center {font_size}"
			style:width={button_width}
		>
			<strong class="font-bold">
				{number_crunch(Math.floor(displayed_count.current))}
			</strong>
		</div>
	</div>
	<div class="absolute left-2 flex h-full items-center">
		<span class={font_size}>{emoji}</span>
	</div>
</button>
