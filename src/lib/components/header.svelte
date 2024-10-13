<script lang="ts">
	import { name } from '$lib/info'
	import ThemeSelect from './theme-select.svelte'
</script>

<div class="container mx-auto max-w-3xl px-4">
	<div class="mb-4 flex h-16 items-center justify-between py-2">
		<p
			class="bg-gradient-to-b from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent lg:text-4xl"
		>
			<a href="/">{name}</a>
		</p>
		<div>
			<ThemeSelect />
		</div>
	</div>
</div>
