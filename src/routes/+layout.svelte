<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$env/static/public'
	import { BackToTop, Footer, Header, Nav } from '$lib/components'
	import { handle_mouse_move } from '$lib/utils'
	import * as Fathom from 'fathom-client'
	import { onMount } from 'svelte'
	import '../app.css'
	import '../prism.css'

	let { children } = $props()

	onMount(() => {
		Fathom.load(PUBLIC_FATHOM_ID, { url: PUBLIC_FATHOM_URL })
	})

	$effect(() => {
		page.url.pathname
		browser && Fathom.trackPageview()
	})
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
		class="container mx-auto max-w-3xl grow px-4"
	>
		{@render children?.()}
		<BackToTop />
	</main>

	<Footer />
</div>
