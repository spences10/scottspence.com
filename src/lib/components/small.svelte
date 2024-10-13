<script lang="ts">
	let { children }: { children: any } = $props()
</script>

<div class="!-mt-10 uppercase">
	<small class="text-xs">{@render children?.()}</small>
</div>
