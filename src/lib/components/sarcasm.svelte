<script lang="ts">
	interface Props {
		sarky?: string
	}

	let { sarky = '' }: Props = $props()

	let transformedText = $state('')

	$effect.pre(() => {
		transformedText = sarky
			.split('')
			.map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
			.join('')
	})
</script>

<span class="font-semibold">
	{transformedText}
</span>
