<script lang="ts">
	import { page } from '$app/state'
	import { Envelope, Megaphone, News, Tag } from '$lib/icons'

	const links = [
		{ href: '/posts', title: 'Posts', icon: News },
		{ href: '/tags', title: 'Tags', icon: Tag },
		{ href: '/speaking', title: 'Speaking', icon: Megaphone },
		{ href: '/contact', title: 'Contact', icon: Envelope },
	]

	const is_active = (path: string) =>
		page.url.pathname === path ||
		page.url.pathname.startsWith(path + '/')
</script>

<!-- Desktop Navigation -->
<nav
	class="bg-base-100/50 sticky top-0 z-10 mx-2 mb-10 hidden flex-none px-2 py-4 backdrop-blur-xl lg:flex"
>
	<ul
		class="container mx-auto flex max-w-3xl items-center justify-between px-4"
	>
		{#each links as link}
			<li>
				<a
					class="hover:text-primary flex items-center space-x-2 text-xl transition-colors {is_active(
						link.href,
					)
						? 'text-secondary'
						: 'text-base-content'}"
					href={link.href}
				>
					<span>
						<link.icon
							height="20"
							width="20"
							classes={is_active(link.href)
								? 'text-secondary'
								: 'text-base-content'}
						/>
					</span>
					<span class="inline-block align-text-bottom">
						{link.title}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<!-- Mobile Navigation with DaisyUI v5 dock -->
<div class="fixed right-0 bottom-0 left-0 z-10 lg:hidden print:hidden">
	<div
		class="dock bg-primary rounded-box mx-auto mb-2 max-w-[95vw] shadow-xl"
	>
		{#each links as link}
			<button class={is_active(link.href) ? 'dock-active' : ''}>
				<a href={link.href} class="text-primary-content">
					<link.icon height="30" width="30" />
					<span class="sr-only">{link.title}</span>
				</a>
			</button>
		{/each}
	</div>
</div>
