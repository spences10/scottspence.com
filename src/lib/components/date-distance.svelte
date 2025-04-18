<script lang="ts">
	import { formatDistanceStrict } from 'date-fns'

	let { date } = $props<{ date: number | string | Date }>()

	let distance = $derived.by(() =>
		formatDistanceStrict(new Date(Date.now()), new Date(date)),
	)
</script>

<span data-testid="date-distance">{distance}</span>
