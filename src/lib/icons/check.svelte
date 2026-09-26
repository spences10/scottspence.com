<!-- check icon from Lucide (ISC), Copyright (c) 2026 Lucide Icons and Contributors -->
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
	<path d="M20 6 9 17l-5-5" />
</svg>
