<script lang="ts">
	import { innerHeight, scrollY } from 'svelte/reactivity/window';
	import { fade } from 'svelte/transition';

	interface Props {
		headings?: { label: string; href: string }[];
	}

	let { headings = [] }: Props = $props();

	// a heading becomes active once it's in the top third of the viewport,
	// which also covers where a clicked heading lands below the sticky nav
	const active_href = $derived.by(() => {
		// undefined on the server, and re-runs this on scroll and resize
		if (scrollY.current === undefined) return '';
		const active_offset = Math.max(
			160,
			(innerHeight.current ?? 0) / 3,
		);
		let current = '';
		for (const heading of headings) {
			const element = document.getElementById(heading.href.slice(1));
			if (!element) continue;
			if (element.getBoundingClientRect().top > active_offset) break;
			current = heading.href;
		}
		return current;
	});

	// keep the active link in view when the list itself overflows
	const keep_in_view = (link: HTMLElement) => {
		const list = link.closest('ul');
		if (!list) return;
		const link_rect = link.getBoundingClientRect();
		const list_rect = list.getBoundingClientRect();
		if (link_rect.top < list_rect.top) {
			list.scrollTop -= list_rect.top - link_rect.top;
		} else if (link_rect.bottom > list_rect.bottom) {
			list.scrollTop += link_rect.bottom - list_rect.bottom;
		}
	};
</script>

{#if headings.length}
	<aside
		transition:fade|global
		class="table-of-contents z-10 hidden w-64 rounded-box bg-base-100 shadow-lg lg:block"
	>
		<div class="">
			<h3
				class="mt-2! mb-0! text-lg! font-extrabold!"
				id="table-of-contents"
			>
				Table of Contents
			</h3>
			<ul class="mb-0! max-h-72 overflow-auto">
				{#each headings as heading (heading.href)}
					<li class="mr-4 mb-2">
						<a
							class="transition hover:text-primary aria-[current]:text-primary"
							href={heading.href}
							{@attach active_href === heading.href && keep_in_view}
							aria-current={active_href === heading.href
								? 'location'
								: undefined}
						>
							{heading.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</aside>
{/if}
