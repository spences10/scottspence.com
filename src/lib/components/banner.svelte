<script lang="ts">
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
	}

	let {
		options = {
			type: 'info',
			message: '',
		},
	}: Props = $props()

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

	const { bg, text } = COLORS[options.type] ?? COLORS['info']
	const banner_classes = `${bg} ${text} px-12 py-4`
	const Icon = ICONS[options.type] ?? InformationCircle
</script>

<div
	role="banner"
	class="all-prose rounded-box prose-a:text-info-content relative mt-8 shadow-lg {banner_classes}"
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
