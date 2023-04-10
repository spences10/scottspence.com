<script lang="ts">
  import {
    InformationCircle,
    LightBulb,
    Megaphone,
    WarningTriangle,
  } from '$lib/icons'

  export let options: BannerOptions = {
    type: 'info',
    message: '',
  }

  interface BannerOptions {
    type: 'info' | 'tip' | 'warning' | 'announcement'
    message: string
  }

  const ICONS = {
    info: InformationCircle,
    tip: LightBulb,
    warning: WarningTriangle,
    announcement: Megaphone,
  }

  const COLORS = {
    info: { bg: 'bg-info', text: 'text-info-content' },
    tip: { bg: 'bg-info', text: 'text-info-content' },
    warning: { bg: 'bg-warning', text: 'text-warning-content' },
    announcement: { bg: 'bg-success', text: 'text-success-content' },
    promotion: { bg: 'bg-success', text: 'text-success-content' },
  }

  const { bg, text } = COLORS[options.type] ?? COLORS['info']
  const banner_classes = `${bg} ${text} px-12 py-4`
  const Icon = ICONS[options.type] ?? InformationCircle
</script>

<div
  role="banner"
  class="mt-8 relative all-prose prose-a:text-info-content rounded-2xl shadow-lg {banner_classes}"
>
  <div
    class="{bg} rounded-full border-4 border-base-300 absolute -top-3 -left-3 p-1"
  >
    <Icon />
  </div>
  <div class="flex">
    <span class="">
      {@html options.message}
    </span>
  </div>
</div>
