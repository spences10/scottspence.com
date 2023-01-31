<script>
  import { browser, dev } from '$app/environment'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import Footer from '@components/footer.svelte'
  import Header from '@components/header.svelte'
  import Nav from '@lib/components/nav.svelte'
  import { popular_posts_store, visitors_store } from '@lib/stores'
  import { inject } from '@vercel/analytics'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import { themeChange } from 'theme-change'
  import '../app.css'
  import '../prism.css'

  export let data
  $popular_posts_store = data.popular_posts_analytics
  $visitors_store = data.visitors

  onMount(() => {
    themeChange(false)
    Fathom.load(PUBLIC_FATHOM_ID, {
      url: PUBLIC_FATHOM_URL,
      excludedDomains: ['localhost'],
    })
  })

  inject({ mode: dev ? 'development' : 'production' })
  $: $page.url.pathname, browser && Fathom.trackPageview()
</script>

<a
  class="transition left-0 bg-primary text-primary-content absolute p-3 m-3 -translate-y-16 focus:translate-y-0"
  href="#main-content">Skip Navigation</a
>
<Header />
<Nav />
<main
  id="main-content"
  class="container max-w-3xl mx-auto px-4 mb-20 flex-grow"
>
  <slot />
</main>

<Footer {data} />
