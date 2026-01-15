<script lang="ts">
	import { track_click } from '$lib/analytics/track-click.remote'
	import LiveVisitors from './live-visitors.svelte'

	let is_hovering = $state(false)
	let base_cloudinary_url =
		'https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1691271318/scottspence.com/site-assets/'
	let ScottFace = `${base_cloudinary_url}scott-mug-face-no-bg.png`
	let ScottMugFace = `${base_cloudinary_url}scott-mug-face.png`
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
				<h1 class="text-6xl font-black text-balance">
					<span class="block">Scott Spence</span>
					<span
						class="from-primary to-secondary block bg-linear-to-b bg-clip-text text-transparent"
					>
						Hello World!
					</span>
				</h1>
				<p class="mb-5 text-pretty">
					This is my blog where I write about many things, including,
					but not limited to Svelte, SvelteKit, JavaScript, Tailwind
					and many more web dev related topics.
				</p>
				<p class="mb-5 text-pretty">
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
				<p class="mb-5 text-pretty">
					You can carry on scrolling for a bit more info about me if
					you like.
				</p>
				<p class="mb-10 text-pretty">
					Or if you want to get in touch, feel free to reach out to
					me...
				</p>
				<a
					href="/contact"
					onclick={() =>
						track_click({ event_name: 'contact button click' })}
					class="btn btn-primary btn-md rounded-box text-primary-content! lg:btn-lg hover:text-primary-content mb-5 w-full shadow-xl"
				>
					Get in Touch
				</a>
				<LiveVisitors />
			</div>
		</div>
	</div>
</div>
