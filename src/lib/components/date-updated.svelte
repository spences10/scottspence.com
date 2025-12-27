<script lang="ts">
	import { format } from 'date-fns'

	interface Props {
		date: string | null | undefined
		small?: string
	}

	let { date, small = '' }: Props = $props()
	const last_build_date = new Date()
	const buildDate = $derived(
		date
			? format(new Date(date), 'MMMM do yyyy')
			: format(new Date(last_build_date), 'MMMM do yyyy'),
	)
</script>

<small>
	{#if small}
		<span class="text-xs">{buildDate}</span>
	{:else}
		<span class="text-base">{buildDate}</span>
	{/if}
</small>
