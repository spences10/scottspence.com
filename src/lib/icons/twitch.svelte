<script lang="ts">
	interface Props {
		height?: string
		width?: string
	}

	let { height = '20px', width = '20px' }: Props = $props()
</script>

<svg
	role="img"
	xmlns="https://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	{height}
	{width}
	class="hover:text-primary-accent fill-current text-primary-content transition"
>
	<path
		d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
	/>
</svg>
