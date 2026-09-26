<!-- list-ordered icon from Lucide (ISC), Copyright (c) 2026 Lucide Icons and Contributors -->
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
	<path d="M11 5h10" />
	<path d="M11 12h10" />
	<path d="M11 19h10" />
	<path d="M4 4h1v5" />
	<path d="M4 9h2" />
	<path
		d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"
	/>
</svg>
