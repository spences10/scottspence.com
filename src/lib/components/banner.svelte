<script lang="ts">
	import { track_click } from '$lib/analytics/track-click.remote'
	import {
		InformationCircle,
		LightBulb,
		Megaphone,
		WarningTriangle,
	} from '$lib/icons'

	interface Props {
		options?: BannerOptions
	}

	export interface BannerOptions {
		type: 'info' | 'tip' | 'warning' | 'announcement'
		message: string
		track_event?: string
	}

	let {
		options = {
			type: 'info',
			message: '',
		},
	}: Props = $props()

	function handle_click(event: MouseEvent | KeyboardEvent) {
		const target = event.target as HTMLElement
		if (target.tagName === 'A' && options.track_event) {
			const link_text = target.textContent?.trim() || ''
			const event_name = link_text
				? `${options.track_event}: ${link_text}`
				: options.track_event
			track_click({ event_name })
		}
	}

	const ICONS = {
		info: InformationCircle,
		tip: LightBulb,
		warning: WarningTriangle,
		announcement: Megaphone,
	}

	const COLORS = {
		info: { bg: 'bg-info', text: '!text-info-content' },
		tip: { bg: 'bg-info', text: '!text-info-content' },
		warning: { bg: 'bg-warning', text: '!text-warning-content' },
		announcement: { bg: 'bg-success', text: '!text-success-content' },
		promotion: { bg: 'bg-success', text: '!text-success-content' },
	}

	const colors = $derived(COLORS[options.type] ?? COLORS['info'])
	const bg = $derived(colors.bg)
	const text = $derived(colors.text)
	const banner_classes = $derived(`${bg} ${text} px-12 py-4`)
	const Icon = $derived(ICONS[options.type] ?? InformationCircle)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	role="banner"
	class="all-prose rounded-box prose-a:text-info-content relative mt-8 shadow-lg {banner_classes}"
	onclick={handle_click}
	onkeydown={handle_click}
>
	<div
		class="{bg} border-base-300 absolute -top-3 -left-3 rounded-full border-4 p-1"
	>
		<Icon />
	</div>
	<div class="flex">
		<span class="">
			{@html options.message}
		</span>
	</div>
</div>
