<script lang="ts">
	let thisYear = new Date().getFullYear()
</script>

<div
	class="flex justify-center md:-mx-24 md:h-[260px] lg:-mx-52 xl:-mx-64 2xl:-mx-96"
>
	<a
		href={`https://ghui.vercel.app/heat.png?username=spences10&year=${thisYear}&interactive=true`}
		target="_blank"
		rel="noopener noreferrer"
		class="hover:opacity-100"
	>
		<img
			src={`https://ghui.vercel.app/heat.png?username=spences10&year=${thisYear}`}
			alt="GitHub contributions heatmap"
			loading="eager"
		/>
	</a>
</div>
