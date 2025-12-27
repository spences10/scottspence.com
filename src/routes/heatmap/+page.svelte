<script lang="ts">
	interface Props {
		data: any
	}

	let { data: page_data }: Props = $props()
	const data = $derived(page_data.data)
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
