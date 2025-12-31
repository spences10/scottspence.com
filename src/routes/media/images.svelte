<script lang="ts">
	import { images } from './images'
	const get_random_image = () => {
		const random_index = Math.floor(Math.random() * images.length)
		return images[random_index]
	}

	let selected_image = $state(get_random_image())

	const handle_image_click = (image: {
		url: string
		square: string
		thumb: string
		alt: string
	}) => {
		selected_image = image
	}
</script>

<div class="w-full sm:w-1/3">
	<a
		target="_blank"
		rel="noopener noreferrer"
		href={selected_image.url}
	>
		<img
			class="m-0 mb-5 shadow-xl"
			src={selected_image.square}
			alt={selected_image.alt}
		/>
	</a>
	<div class="not-prose grid grid-cols-6 gap-2">
		{#each images as image}
			<button
				class="focus:border-primary-accent focus:outline-primary shadow-xl"
				onclick={() => handle_image_click(image)}
			>
				<img
					class="cursor-pointer shadow-xl"
					src={image.thumb}
					alt={image.alt}
				/>
			</button>
		{/each}
	</div>
</div>
