<script lang="ts">
	import { page } from '$app/stores'
	import { Envelope, Megaphone, News, Tag } from '$lib/icons'

	let links = [
		{ href: `/posts`, title: `Posts`, icon: News },
		{ href: `/tags`, title: `Tags`, icon: Tag },
		{ href: `/speaking`, title: `Speaking`, icon: Megaphone },
		{ href: `/contact`, title: `Contact`, icon: Envelope },
	]
</script>

<nav
	class="sticky top-0 z-10 mx-2 mb-10 hidden flex-none bg-base-100/50 px-2 py-4 backdrop-blur-xl backdrop-filter lg:flex"
>
	<ul
		class="container mx-auto flex max-w-3xl items-center justify-between px-4"
	>
		{#each links as link}
			<li>
				<a
					class="link link-primary flex items-center space-x-2 text-xl {$page
						.url.pathname === link.href && `link-secondary`}"
					href={link.href}
				>
					<span class="">
						<svelte:component
							this={link.icon}
							height="20px"
							width="20px"
							classes="link link-primary"
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

<nav
	class="btm-nav z-10 mx-auto mb-2 max-w-[95vw] rounded-box bg-primary shadow-xl lg:hidden"
>
	{#each links as link}
		<a href={link.href}>
			<span
				class="link text-primary-content {$page.url.pathname ===
					link.href && `text-secondary-content`}"
			>
				<svelte:component
					this={link.icon}
					height="30px"
					width="30px"
				/>
				<span class="sr-only">{link.title}</span>
			</span>
		</a>
	{/each}
</nav>
