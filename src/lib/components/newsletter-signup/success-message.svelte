<script lang="ts">
	import { scale_and_fade } from '$lib/utils'
</script>

<div
	in:scale_and_fade|global={{ delay: 400, duration: 400 }}
	class="mx-auto max-w-7xl text-center lg:px-8"
>
	<div
		class="rounded-box bg-primary py-10 lg:flex lg:items-center lg:p-14"
	>
		<div class="text-primary-content lg:w-0 lg:flex-1">
			<h3 class="text-4xl font-extrabold tracking-tight">
				Awesome! 🥳
			</h3>
			<p class="mt-4 text-xl">
				Thanks for showing interest in my content.
			</p>
			<p class="mt-4 text-xl">
				Please check your email to confirm your subscription. 📨
			</p>
		</div>
	</div>
</div>
