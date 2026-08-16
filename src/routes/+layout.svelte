<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import {
		PUBLIC_FATHOM_ID,
		PUBLIC_FATHOM_URL,
	} from '$app/env/public';
	import { init_live_analytics } from '#lib/analytics/live-analytics.svelte.js';
	import {
		BackToTop,
		CommandPalette,
		Footer,
		Header,
		Nav,
	} from '#lib/components/index.js';
	import { command_palette_state } from '#lib/state/command-palette.svelte.js';
	import { handle_mouse_move } from '#lib/utils/index.js';
	import * as Fathom from 'fathom-client';
	import { onMount } from 'svelte';
	import '../app.css';
	import '../prism.css';

	let { children } = $props();

	const handle_keydown = (event: KeyboardEvent) => {
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			command_palette_state.toggle();
		}
	};

	onMount(() => {
		Fathom.load(PUBLIC_FATHOM_ID, {
			url: PUBLIC_FATHOM_URL,
		});
		init_live_analytics();
	});

	// Track pageview on route change
	afterNavigate(({ shallow }) => {
		if (shallow) return;

		Fathom.trackPageview();
	});
</script>

<svelte:window
	onmousemove={handle_mouse_move}
	onkeydown={handle_keydown}
/>

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
		class="container mx-auto max-w-3xl grow px-4"
	>
		{@render children?.()}
		<BackToTop />
	</main>

	<Footer />
</div>

<CommandPalette />
