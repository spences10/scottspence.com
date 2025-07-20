<script lang="ts">
	import { name } from '$lib/info'
	import ThemeSelect from './theme-select.svelte'
	
	let is_meowed = $state(false)
	
	function toggle_meow() {
		if (is_meowed) {
			location.reload()
		} else {
			const walker = document.createTreeWalker(
				document.body,
				NodeFilter.SHOW_TEXT,
				null
			)
			
			const text_nodes: Text[] = []
			let node: Node | null
			
			while (node = walker.nextNode()) {
				text_nodes.push(node as Text)
			}
			
			text_nodes.forEach(text_node => {
				text_node.textContent = text_node.textContent?.replace(/\b[a-zA-Z0-9_-]+\b/g, 'meow') || ''
			})
			is_meowed = true
		}
	}
</script>

<div class="container mx-auto max-w-3xl px-4">
	<div class="mb-4 flex h-16 items-center justify-between py-2">
		<p
			class="bg-gradient-to-b from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent lg:text-4xl"
		>
			<a href="/">{name}</a>
		</p>
		<div class="flex items-center gap-2">
			<button onclick={toggle_meow} class="text-2xl">🐱</button>
			<ThemeSelect />
		</div>
	</div>
</div>
