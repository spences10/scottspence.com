<script lang="ts">
	import { page } from '$app/state';
	import { Envelope, Megaphone, News, Tag } from '$lib/icons';

	const links = [
		{ href: '/posts', title: 'Posts', icon: News },
		{ href: '/tags', title: 'Tags', icon: Tag },
		{ href: '/speaking', title: 'Speaking', icon: Megaphone },
		{ href: '/contact', title: 'Contact', icon: Envelope },
	];

	const is_active = (path: string) =>
		page.url.pathname === path ||
		page.url.pathname.startsWith(path + '/');
</script>

<!-- Desktop Navigation -->
<nav
	class="sticky top-0 z-10 mx-2 mb-10 hidden flex-none bg-base-100/50 px-2 py-4 backdrop-blur-xl lg:flex"
>
	<ul
		class="container mx-auto flex max-w-3xl items-center justify-between px-4"
	>
		{#each links as link}
			<li>
				<a
					class="flex items-center space-x-2 text-xl transition-colors hover:text-primary {is_active(
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
<div
	class="fixed right-0 bottom-0 left-0 z-10 lg:hidden print:hidden"
>
	<div
		class="dock mx-auto mb-2 max-w-[95vw] rounded-box bg-primary shadow-xl"
	>
		{#each links as link}
			<a
				href={link.href}
				class="text-primary-content {is_active(link.href)
					? 'dock-active'
					: ''}"
			>
				<link.icon height="30" width="30" />
				<span class="sr-only">{link.title}</span>
			</a>
		{/each}
	</div>
</div>
