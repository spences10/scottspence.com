<script lang="ts">
	interface Props {
		data: any
	}

	let { data }: Props = $props()
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
