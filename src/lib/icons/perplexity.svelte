<script lang="ts">
	interface Props {
		height?: string
		width?: string
		class_props?: string
		aria_label?: string
	}

	let {
		height = '20px',
		width = '20px',
		class_props = '',
		aria_label,
	}: Props = $props()
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class="text-secondary-content hover:text-secondary block fill-current transition {class_props}"
	{width}
	{height}
	aria-hidden={aria_label ? undefined : 'true'}
	aria-label={aria_label}
	role={aria_label ? 'img' : undefined}
	focusable="false"
	fill="currentColor"
	viewBox="0 0 16 16"
>
	<path
		fill-rule="evenodd"
		d="M8 .188a.5.5 0 0 1 .503.5V4.03l3.022-2.92.059-.048a.51.51 0 0 1 .49-.054.5.5 0 0 1 .306.46v3.247h1.117l.1.01a.5.5 0 0 1 .403.49v5.558a.5.5 0 0 1-.503.5H12.38v3.258a.5.5 0 0 1-.312.462.51.51 0 0 1-.55-.11l-3.016-3.018v3.448c0 .275-.225.5-.503.5a.5.5 0 0 1-.503-.5v-3.448l-3.018 3.019a.51.51 0 0 1-.548.11.5.5 0 0 1-.312-.463v-3.258H2.503a.5.5 0 0 1-.503-.5V5.215l.01-.1c.047-.229.25-.4.493-.4H3.62V1.469l.006-.074a.5.5 0 0 1 .302-.387.51.51 0 0 1 .547.102l3.023 2.92V.687c0-.276.225-.5.503-.5M4.626 9.333v3.984l2.87-2.872v-4.01zm3.877 1.113 2.871 2.871V9.333l-2.87-2.897zm3.733-1.668a.5.5 0 0 1 .145.35v1.145h.612V5.715H9.201zm-9.23 1.495h.613V9.13c0-.131.052-.257.145-.35l3.033-3.064h-3.79zm1.62-5.558H6.76L4.626 2.652zm4.613 0h2.134V2.652z"
	/>
</svg>
