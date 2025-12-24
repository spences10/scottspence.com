<script lang="ts">
	import { get_active_visitors } from '$lib/analytics/analytics.remote'
	import * as Fathom from 'fathom-client'
	import CurrentVisitorsData from './current-visitors-data.svelte'

	let is_hovering = $state(false)
	let base_cloudinary_url =
		'https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1691271318/scottspence.com/site-assets/'
	let ScottFace = `${base_cloudinary_url}scott-mug-face-no-bg.png`
	let ScottMugFace = `${base_cloudinary_url}scott-mug-face.png`

	const visitors_data = get_active_visitors({ limit: 10 })

	$effect(() => {
		const interval = setInterval(
			() => get_active_visitors({ limit: 10 }).refresh(),
			10000,
		)
		return () => clearInterval(interval)
	})

	let show_current_visitor_data = $state(false)
</script>

<div class="relative mb-4 lg:-mx-40 lg:px-8 xl:-mx-64 2xl:-mx-60">
	<div class="hero">
		<div class="hero-content flex-col p-0 lg:flex-row-reverse">
			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<!-- svelte-ignore a11y_img_redundant_alt -->
			<img
				src={is_hovering ? ScottFace : ScottMugFace}
				alt="Cartoon face Scott"
				class="max-h-96 w-1/2 max-w-sm rounded-full shadow-xl lg:w-full"
				onmouseover={() => (is_hovering = !is_hovering)}
				onmouseout={() => (is_hovering = !is_hovering)}
			/>
			<div class="all-prose lg:mr-28">
				<h1 class="text-6xl font-black">
					<span class="block">Scott Spence</span>
					<span
						class="from-primary to-secondary block bg-linear-to-b bg-clip-text text-transparent"
					>
						Hello World!
					</span>
				</h1>
				<p class="mb-5">
					This is my blog where I write about many things, including,
					but not limited to Svelte, SvelteKit, JavaScript, Tailwind
					and many more web dev related topics.
				</p>
				<p class="mb-5">
					Check out that massive picture of my <a
						href="https://www.cockneyrhymingslang.co.uk/slang/boat_race"
						target="_blank"
						rel="noopener noreferrer"
					>
						boat race
					</a>! What do you think? If you want to crack on then check
					out some of the stuff I'm writing about on the
					<a href="/posts">posts page</a>.
				</p>
				<p class="mb-5">
					You can carry on scrolling for a bit more info about me if
					you like.
				</p>
				<p class="mb-10">
					Or if you want to get in touch, feel free to reach out to
					me...
				</p>
				<a
					href="/contact"
					onclick={() => Fathom.trackEvent(`contact button click`)}
					class="btn btn-primary btn-md rounded-box text-primary-content! lg:btn-lg hover:text-primary-content mb-5 w-full shadow-xl"
				>
					Get in Touch
				</a>
				<svelte:boundary>
					{@const data = await visitors_data}
					{#if data.total > 0}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<span
							onmouseenter={() => (show_current_visitor_data = true)}
							onmouseleave={() => (show_current_visitor_data = false)}
							class="inline-block cursor-pointer"
						>
							<p
								class="rounded-box bg-secondary text-secondary-content mt-2 px-4 py-2 text-sm tracking-wide shadow-xl"
							>
								There's currently
								<span class="font-bold">
									{data.total}
								</span>
								live {data.total === 1 ? 'visitor' : 'visitors'}
							</p>
							{#if show_current_visitor_data}
								<CurrentVisitorsData />
							{/if}
						</span>
					{/if}
				</svelte:boundary>
			</div>
		</div>
	</div>
</div>
