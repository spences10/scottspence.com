<script lang="ts">
	import Bluesky from '$lib/icons/bluesky.svelte'
	import Kagi from '$lib/icons/kagi.svelte'
	import Perplexity from '$lib/icons/perplexity.svelte'

	interface Props {
		selected_text: string
		post_title: string
		post_url: string
		x: number
		y: number
		visible: boolean
	}

	interface ButtonConfig {
		label: string
		component: any
		href: (
			text: string,
			post_title: string,
			post_url: string,
		) => string
		aria_label: (text: string) => string
		variant: string
	}

	let { selected_text, post_title, post_url, x, y, visible }: Props =
		$props()

	let bluesky_text = $derived(
		`"${selected_text}"\n\nFrom: ${post_title}\n${post_url}\nvia @scottspence.dev`,
	)

	let button_configs: ButtonConfig[] = [
		{
			label: 'Share',
			component: Bluesky,
			href: () =>
				`https://bsky.app/intent/compose?text=${encodeURIComponent(bluesky_text)}`,
			aria_label: () => 'Share selected text on Bluesky',
			variant: 'btn-primary',
		},
		{
			label: 'Perplexity',
			component: Perplexity,
			href: (text) =>
				`https://www.perplexity.ai/search?q=${encodeURIComponent(text)}`,
			aria_label: (text) => 'Search selected text on Perplexity',
			variant: 'btn-secondary',
		},
		{
			label: 'Kagi',
			component: Kagi,
			href: (text) =>
				`https://kagi.com/search?q=${encodeURIComponent(text)}`,
			aria_label: (text) => 'Search selected text on Kagi',
			variant: 'btn-accent',
		},
	]
</script>

{#if visible && selected_text.trim()}
	<div
		class="absolute z-10 transition-opacity duration-200"
		style="left: {x}px; top: {y}px; transform: translateX(-50%);"
	>
		<div
			class="bg-base-300 border-base-300 rounded-box border p-2 shadow-lg"
		>
			<div class="flex gap-2">
				{#each button_configs as config}
					{@const Component = config.component}
					<a
						class="btn btn-sm {config.variant} inline-flex items-center gap-2"
						rel="noreferrer noopener"
						target="_blank"
						href={config.href(selected_text, post_title, post_url)}
						aria-label={config.aria_label(selected_text)}
					>
						<span>{config.label}</span>
						<Component
							flutter={config.label === 'Share'}
							class_props=""
							aria_label={config.label}
						/>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
