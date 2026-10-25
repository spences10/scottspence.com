<script lang="ts">
	import { formatDistanceStrict } from 'date-fns';

	let { date }: { date: number | string | Date } = $props();

	let distance = $derived.by(() =>
		formatDistanceStrict(new Date(Date.now()), new Date(date)),
	);
</script>

<span data-testid="date-distance">{distance}</span>
