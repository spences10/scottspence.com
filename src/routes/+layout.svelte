<script lang="ts">
  import { browser } from '$app/environment'
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import { BackToTop, Footer, Header, Nav } from '$lib/components'
  import { popular_posts_store } from '$lib/stores'
  import { handle_mouse_move } from '$lib/utils'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import '../app.css'
  import '../prism.css'

  export let data

  $popular_posts_store = data?.popular_posts || {
    popular_posts_daily: [],
    popular_posts_monthly: [],
    popular_posts_yearly: [],
  }
  // TODO: do something with this! 😂
  // $visitors_store = data?.visitors

  onMount(() => {
    Fathom.load(PUBLIC_FATHOM_ID, {
      url: PUBLIC_FATHOM_URL,
      excludedDomains: ['localhost'],
    })
  })

  $: $page.url.pathname, browser && Fathom.trackPageview()

  onNavigate(navigation => {
    // sorry Firefox and Safari users
    if (!(document as any).startViewTransition) return

    return new Promise(resolve => {
      ;(document as any).startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })
</script>

<svelte:window on:mousemove={handle_mouse_move} />

<a
  class="absolute left-0 m-3 -translate-y-16 bg-primary p-3 text-primary-content transition focus:translate-y-0"
  href="#main-content"
>
  Skip Navigation
</a>

<Header />

<Nav />

<div class="flex min-h-screen flex-col overflow-x-hidden">
  <main
    id="main-content"
    class="container mx-auto max-w-3xl flex-grow px-4"
  >
    <slot />
    <BackToTop />
  </main>

  <Footer />
</div>
