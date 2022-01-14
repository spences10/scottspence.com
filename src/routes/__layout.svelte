<script>
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import Footer from '@components/footer.svelte'
  import Header from '@components/header.svelte'
  import Nav from '@lib/components/nav.svelte'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import { themeChange } from 'theme-change'
  import '../app.css'
  import '../prism.css'

  onMount(() => {
    themeChange(false)
    Fathom.load(import.meta.env.VITE_FATHOM_ID, {
      url: import.meta.env.VITE_FATHOM_URL,
      excludedDomains: ['localhost'],
    })
  })

  $: $page.pathname, browser && Fathom.trackPageview()
</script>

<a
  class="transition left-0 bg-primary text-primary-content absolute p-3 m-3 -translate-y-16 focus:translate-y-0"
  href="#main-content">Skip Navigation</a
>
<Header />
<Nav />
<main
  id="main-content"
  class="container max-w-3xl mx-auto px-4 mb-20"
>
  <slot />
</main>

<Footer />
