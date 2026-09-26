<script lang="ts">
	import Check from '#lib/icons/check.svelte';
	import CodeXml from '#lib/icons/code-xml.svelte';
	import Copy from '#lib/icons/copy.svelte';
	import ListOrdered from '#lib/icons/list-ordered.svelte';
	import { line_numbers_state } from '#lib/state/line-numbers.svelte.js';
	import { onMount } from 'svelte';

	// Emitted by the mdsvex highlighter, `html` is twinkleplop output,
	// `label` the language name (absent for plain text), `icon` a
	// language logo path (24x24 viewBox) when there is one and `digits`
	// the width of the largest line number
	const {
		html,
		label,
		icon,
		digits,
	}: { html: string; label?: string; icon?: string; digits: number } =
		$props();

	let block: HTMLDivElement | undefined;
	let copy_status = $state('');
	let reset_timer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		line_numbers_state.sync();
		return () => clearTimeout(reset_timer);
	});

	async function copy_code() {
		const code = block?.querySelector('pre code');
		if (!code) return;

		// Line numbers are real text in the markup, drop them from the copy
		const clone = code.cloneNode(true) as HTMLElement;
		clone.querySelectorAll('.ln').forEach((ln) => ln.remove());

		try {
			await navigator.clipboard.writeText(clone.textContent ?? '');
			copy_status = 'Copied';
		} catch {
			copy_status = 'Copy failed';
		}

		clearTimeout(reset_timer);
		reset_timer = setTimeout(() => (copy_status = ''), 2000);
	}
</script>

<div class="code-block" style:--ln-digits={digits} bind:this={block}>
	<div class="code-block-header">
		{#if label}
			<span
				class="code-block-language tooltip tooltip-right"
				data-tip={label}
				role="img"
				aria-label={label}
			>
				{#if icon}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
						height="16px"
						width="16px"
					>
						<path d={icon} />
					</svg>
				{:else}
					<CodeXml />
				{/if}
			</span>
		{/if}
		<div class="code-block-actions">
			<button
				type="button"
				class="tooltip tooltip-left"
				data-tip="Line numbers"
				aria-label="Line numbers"
				aria-pressed={line_numbers_state.visible}
				onclick={() => line_numbers_state.toggle()}
			>
				<ListOrdered />
			</button>
			<button
				type="button"
				class="tooltip tooltip-left"
				data-tip={copy_status || 'Copy code'}
				aria-label="Copy code"
				onclick={copy_code}
			>
				{#if copy_status === 'Copied'}
					<Check />
				{:else}
					<Copy />
				{/if}
			</button>
		</div>
		<span class="sr-only" role="status">{copy_status}</span>
	</div>
	{@html html}
</div>

<style>
	.code-block {
		/* Shared by the header and each code line (twinkleplop.css) */
		--code-gutter: clamp(1rem, 3vw, 1.5rem);
		margin-block: 1.75em;
		border-radius: 0.375rem;
		background: var(--twp-background);
	}

	.code-block-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem var(--code-gutter);
		border-bottom: 1px solid rgb(214 222 235 / 12%);
		color: var(--twp-identifier);
		font-family: var(--font-sans, sans-serif);
		font-size: 0.75rem;
	}

	.code-block-language {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* Buttons centre a 1rem icon in 1.75rem, pull the group out by the
	   difference so the icons, not the hit areas, line up with the code */
	.code-block-actions {
		display: flex;
		gap: 0.25rem;
		margin-left: auto;
		margin-right: -0.375rem;
	}

	button {
		display: inline-grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border: 1px solid transparent;
		border-radius: 0.25rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	button:hover {
		background: rgb(214 222 235 / 12%);
	}

	button[aria-pressed='true'] {
		border-color: rgb(214 222 235 / 25%);
		background: rgb(214 222 235 / 12%);
	}

	button:focus-visible {
		outline: 2px solid var(--twp-function);
		outline-offset: 2px;
	}

	/* The wrapper owns spacing and rounding, prose defaults stay off the pre */
	.code-block :global(pre),
	.code-block :global(figure) {
		margin: 0;
		border-radius: 0 0 0.375rem 0.375rem;
	}
</style>
