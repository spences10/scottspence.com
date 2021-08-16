<script>
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import Footer from '$lib/components/footer.svelte'
  import Nav from '$lib/components/nav.svelte'
  import ThemeSelect from '$lib/components/theme-select.svelte'
  import { name } from '$lib/info'
  import * as Fathom from 'fathom-client'
  import 'focus-visible'
  import { onMount } from 'svelte'
  import { themeChange } from 'theme-change'
  import '../app.css'
  import '../prism.css'

  // let prefersLight = browser
  //   ? Boolean(JSON.parse(localStorage.getItem('prefersLight')))
  //   : false

  // let theme = () => {
  //   prefersLight = !prefersLight
  //   localStorage.setItem('prefersLight', prefersLight.toString())

  //   if (prefersLight) {
  //     document.querySelector('html').classList.remove('dark')
  //   } else {
  //     document.querySelector('html').classList.add('dark')
  //   }
  // }

  onMount(() => {
    themeChange(false)
    Fathom.load(import.meta.env.VITE_FATHOM_ID, {
      url: import.meta.env.VITE_FATHOM_URL,
      excludedDomains: ['localhost'],
    })
  })

  $: $page.path, browser && Fathom.trackPageview()
</script>

<div class="flex flex-col min-h-screen">
  <div class="flex flex-col flex-grow mx-auto w-full max-w-2xl">
    <div
      class="flex h-16 mb-4 py-2 px-4 justify-between items-center"
    >
      <p
        class="bg-clip-text bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] font-extrabold text-transparent text-3xl lg:text-4xl"
      >
        <a href="/">{name}</a>
      </p>
      <div>
        <ThemeSelect />
      </div>
    </div>
    <Nav />
    <main class="flex flex-col flex-grow w-full py-4 px-4">
      <slot />
    </main>
  </div>
</div>
<Footer />
