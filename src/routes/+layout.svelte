<script lang="ts">
  import { browser } from '$app/environment'
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import { BackToTop, Footer, Header, Nav } from '$lib/components'
  import { popular_posts_store, visitors_store } from '$lib/stores'
  import { handle_mouse_move } from '$lib/utils'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import '../app.css'
  import '../prism.css'

  export let data

  $popular_posts_store = data?.popular_posts
  $visitors_store = data?.visitors

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
  class="transition left-0 bg-primary text-primary-content absolute p-3 m-3 -translate-y-16 focus:translate-y-0"
  href="#main-content"
>
  Skip Navigation
</a>

<Header />

<Nav />

<div class="flex flex-col min-h-screen overflow-x-hidden">
  <main
    id="main-content"
    class="container max-w-3xl mx-auto px-4 flex-grow"
  >
    <slot />
    <BackToTop />
  </main>

  <Footer />
</div>
