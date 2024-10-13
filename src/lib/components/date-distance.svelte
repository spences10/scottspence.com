<script lang="ts">
	import { formatDistance } from 'date-fns'

	let { date } = $props<{ date: number | string | Date }>()

	let distance = $derived(
		formatDistance(new Date(Date.now()), new Date(date)),
	)
</script>

<span data-testid="date-distance">{distance}</span>
