<!-- copy icon from Lucide (ISC), Copyright (c) 2026 Lucide Icons and Contributors -->
<script lang="ts">
	interface Props {
		height?: string;
		width?: string;
		classes?: string;
	}

	let {
		height = '16px',
		width = '16px',
		classes = '',
	}: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="2"
	stroke="currentColor"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={classes}
	{height}
	{width}
>
	<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
	<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
