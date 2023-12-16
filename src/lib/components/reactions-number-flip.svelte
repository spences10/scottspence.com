<!-- 
	button flip example taken from
	https://codesandbox.io/s/svelte-kit-demo-typescript-slxxe
-->
<script lang="ts">
  import { number_crunch } from '$lib/utils'
  import { spring } from 'svelte/motion'

  let {
    count,
    font_size = 'text-2xl',
    emoji,
    value,
    disabled,
    aria_label,
  } = $props<{
    count: number
    font_size?: string
    emoji: string
    value: string
    disabled: boolean
    aria_label: string
  }>()

  let base_width = 2
  let padding = 3
  let character_width = 1

  const displayed_count = spring(count)
  let offset = $state(0)
  let button_width = $state(``)

  $effect(() => {
    displayed_count.set(count)
    offset = modulo($displayed_count, 1)
    button_width =
      base_width + padding + character_width * crunched_length + 'rem'
  })

  function modulo(n: number, m: number) {
    return ((n % m) + m) % m
  }

  // calculate initial button width
  let crunched_number = number_crunch(count)
  let crunched_length = crunched_number.length

  function handle_click() {
    count += 1
    displayed_count.set(count)
    crunched_number = number_crunch(count)
    button_width =
      base_width + padding + character_width * crunched_length + 'rem'
  }
</script>

<button
  name="reaction"
  type="submit"
  {value}
  {disabled}
  class="btn btn-primary overflow-hidden lowercase relative shadow-xl rounded-box"
  onclick={handle_click}
  style:width={button_width}
  title={count > 1000 ? `${value} ${count}` : ''}
  aria-label={aria_label}
>
  <div
    class="absolute left-14 h-full"
    style="transform: translate(0, {100 * offset}%)"
  >
    <div
      class="absolute flex h-full items-center {font_size}"
      style="top: -100%"
      style:width={button_width}
      aria-hidden="true"
    >
      <strong class="font-bold">
        {number_crunch(Math.floor($displayed_count + 1))}
      </strong>
    </div>
    <div
      class="absolute flex h-full items-center {font_size}"
      style:width={button_width}
    >
      <strong class="font-bold">
        {number_crunch(Math.floor($displayed_count))}
      </strong>
    </div>
  </div>
  <div class="absolute flex h-full items-center left-2">
    <span class={font_size}>{emoji}</span>
  </div>
</button>
