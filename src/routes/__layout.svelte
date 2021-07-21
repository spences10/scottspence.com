<script>
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import ThemeSelect from '$lib/components/theme-select.svelte'
  import { name } from '$lib/info'
  import * as Fathom from 'fathom-client'
  import 'focus-visible'
  import { onMount } from 'svelte'
  import { themeChange } from 'theme-change'
  import '../app.css'
  import '../prism.css'

  let prefersLight = browser
    ? Boolean(JSON.parse(localStorage.getItem('prefersLight')))
    : false

  onMount(() => {
    themeChange(false)
    Fathom.load(import.meta.env.VITE_FATHOM_ID, {
      url: import.meta.env.VITE_FATHOM_URL,
    })
  })

  $: $page.path, browser && Fathom.trackPageview()
</script>

<div class="flex flex-col min-h-screen">
  <div class="mx-auto flex flex-col flex-grow w-full max-w-2xl">
    <div class="flex h-16 px-4 py-2 justify-between items-center mb-14">
      <p class="text-6xl font-extrabold">
        <a href="/">{name}</a>
      </p>
      <div class=" ">
        <ThemeSelect />
      </div>
    </div>
    <main
      class="flex flex-col w-full flex-grow prose prose-lg lg:prose-xl dark:prose-dark py-4 px-4"
    >
      <slot />
    </main>
  </div>
</div>
