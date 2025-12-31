<script lang="ts">
	import { visitors_store } from '$lib/stores'
	import { mouse_position } from '$lib/utils'

	let visitors = $visitors_store
</script>

<div
	class="not-prose rounded-box border-primary bg-base-100 text-base-content fixed z-20 border p-5 text-sm shadow-xl"
	style={`top: ${$mouse_position.y}px; left: ${$mouse_position.x}px;`}
>
	<h3 class="mb-2 text-xl font-bold">Current Site Visitors</h3>
	<section>
		<h4 class="mb-2 text-lg font-semibold">Recent Page Visits:</h4>
		<ul class="mb-2">
			{#each visitors.visitor_data as { pathname, title, recent_visitors }}
				<li class="text-base-content mb-2">
					{title === 'Unknown' ? pathname : title}
					<span class="font-bold">{recent_visitors}</span>
				</li>
			{/each}
		</ul>
	</section>
</div>
