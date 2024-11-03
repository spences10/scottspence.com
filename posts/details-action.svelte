<script lang="ts">
	export let buttonText = ''
	export let open = false

	// custom slide animation
	const slide = (node: HTMLDivElement, open: boolean) => {
		let initialHeight = node.offsetHeight
		node.style.height = open ? `auto` : '0px'
		node.style.overflow = 'hidden'
		let animation = node.animate(
			[{ height: '0px' }, { height: `${initialHeight}px` }],
			{
				duration: 200,
				easing: 'ease-in-out',
				fill: 'both',
				direction: open ? 'reverse' : 'normal',
			},
		)
		animation.pause()
		animation.onfinish = ({ currentTime }) => {
			if (currentTime === 0) {
				animation.reverse()
				animation.pause()
			}
			node.dispatchEvent(new CustomEvent('animation_end'))
		}
		return {
			update: () => {
				animation.currentTime ? animation.reverse() : animation.play()
			},
		}
	}
</script>

<section class="not-prose border">
	<button
		aria-controls="accordion__content_2"
		aria-expanded={open}
		tabindex="0"
		id="accordion__title_2"
		on:click={() => {
			open = !open
		}}
	>
		<div class="flex items-center text-left">
			<span style="margin:0 1rem;" class="transition" class:open>
				▶
			</span>
			<p style="margin:1rem 0;">{buttonText}</p>
		</div>
	</button>
	<div
		use:slide={open}
		on:animation_end={() => {
			console.log('=====================')
			console.log('animation ended event')
			console.log('=====================')
		}}
		id="accordion__content_2"
		role="region"
		aria-hidden={!open}
		aria-labelledby="accordion__title_2"
	>
		<slot />
	</div>
</section>

<style>
	.open {
		transform: rotate(90deg);
		transform-origin: center;
	}
</style>
