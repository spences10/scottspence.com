<script lang="ts">
	import { onMount } from 'svelte'

	interface Props {
		diagram: string
	}

	let { diagram }: Props = $props()

	let container = $state<HTMLDivElement | null>(null)
	let rendered = $state(false)
	let error = $state<string | null>(null)

	// Night Owl theme colours from prism.css
	const night_owl_theme = {
		theme: 'base' as const,
		themeVariables: {
			// Background
			primaryColor: '#19212e',
			primaryBorderColor: 'rgb(127, 219, 202)',
			primaryTextColor: '#d6deeb',

			// Secondary (nodes)
			secondaryColor: '#1d3b53',
			secondaryBorderColor: 'rgb(199, 146, 234)',
			secondaryTextColor: '#d6deeb',

			// Tertiary
			tertiaryColor: '#19212e',
			tertiaryBorderColor: 'rgb(130, 170, 255)',
			tertiaryTextColor: '#d6deeb',

			// Lines and labels
			lineColor: 'rgb(127, 219, 202)',
			textColor: '#d6deeb',

			// Background
			background: '#19212e',
			mainBkg: '#1d3b53',
			nodeBorder: 'rgb(127, 219, 202)',
			clusterBkg: '#19212e',
			clusterBorder: 'rgb(199, 146, 234)',
			titleColor: '#d6deeb',
			edgeLabelBackground: '#19212e',

			// Fonts
			fontFamily:
				"'Victor Mono', Consolas, Monaco, 'Andale Mono', monospace",
		},
	}

	onMount(async () => {
		try {
			const mermaid = (await import('mermaid')).default

			mermaid.initialize({
				startOnLoad: false,
				securityLevel: 'loose',
				...night_owl_theme,
			})

			const source = diagram.trim()
			if (source && container) {
				const { svg } = await mermaid.render(
					`mermaid-${crypto.randomUUID()}`,
					source,
				)
				container.innerHTML = svg
				rendered = true
			}
		} catch (e) {
			error =
				e instanceof Error ? e.message : 'Failed to render diagram'
			rendered = true
		}
	})
</script>

{#if error}
	<div class="bg-error/20 text-error my-4 rounded p-4">
		<p class="font-bold">Mermaid error:</p>
		<pre class="text-sm">{error}</pre>
	</div>
{:else}
	<div
		bind:this={container}
		class="my-4 flex justify-center overflow-x-auto"
		class:hidden={!rendered}
	></div>

	{#if !rendered}
		<div class="my-4 flex justify-center">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{/if}
{/if}
