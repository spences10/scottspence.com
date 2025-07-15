<script lang="ts">
	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$env/static/public'
	import { BackToTop, Footer, Header, Nav } from '$lib/components'
	import { popular_posts_store } from '$lib/stores'
	import { handle_mouse_move } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import '../app.css'
	import '../prism.css'

	let { data, children } = $props()

	$popular_posts_store = data?.popular_posts || {
		popular_posts_daily: [],
		popular_posts_monthly: [],
		popular_posts_yearly: [],
	}
	// TODO: do something with this! 😂
	// $visitors_store = data?.visitors

	$effect(() => {
		if (browser) {
			Fathom.load(PUBLIC_FATHOM_ID, {
				url: PUBLIC_FATHOM_URL,
			})
		}
	})

	// Track pageview on route change
	$effect(() => {
		page.url.pathname, browser && Fathom.trackPageview()
	})

	// onNavigate((navigation) => {
	// 	if (!browser || !document.startViewTransition) return

	// 	return new Promise((resolve) => {
	// 		document.startViewTransition(async () => {
	// 			resolve()
	// 			await navigation.complete
	// 		})
	// 	})
	// })
</script>

<svelte:window onmousemove={handle_mouse_move} />

<a
	class="bg-primary text-primary-content absolute left-0 m-3 -translate-y-16 p-3 transition focus:translate-y-0"
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
		{@render children()}
		<BackToTop />
	</main>

	<Footer />
</div>
