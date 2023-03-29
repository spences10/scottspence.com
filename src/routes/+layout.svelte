<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import { BackToTop, Footer, Header, Nav } from '$lib/components'
  import { popular_posts_store, visitors_store } from '$lib/stores'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import { themeChange } from 'theme-change'
  import '../app.css'
  import '../prism.css'

  export let data
  $popular_posts_store = data.popular_posts_analytics.flatMap(
    post_wrapper =>
      post_wrapper.popular_posts.analytics.map(post => ({
        ...post,
        visits: parseInt(post.visits, 10),
        uniques: parseInt(post.uniques, 10),
        pageviews: parseInt(post.pageviews, 10),
      }))
  )
  $visitors_store = data.visitors

  onMount(() => {
    themeChange(false)
    Fathom.load(PUBLIC_FATHOM_ID, {
      url: PUBLIC_FATHOM_URL,
      excludedDomains: ['localhost'],
    })
  })

  $: $page.url.pathname, browser && Fathom.trackPageview()
</script>

<a
  class="transition left-0 bg-primary text-primary-content absolute p-3 m-3 -translate-y-16 focus:translate-y-0"
  href="#main-content"
>
  Skip Navigation
</a>
<Header />
<Nav />
<main
  id="main-content"
  class="container max-w-3xl mx-auto px-4 mb-20 flex-grow"
>
  <slot />
  <BackToTop />
</main>

<Footer />
