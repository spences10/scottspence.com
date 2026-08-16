<script lang="ts">
	import { resolve } from '$app/paths';
	import { submit_reaction } from '$lib/data/reactions.remote';
	import { reactions } from '$lib/reactions-config';
	import NumberFlip from './reactions-number-flip.svelte';

	interface Props {
		path?: string | null;
		data?: ReactionsData | null;
	}

	let { path = '/', data = null }: Props = $props();

	// svelte-ignore state_referenced_locally
	let counts = $state({ ...data?.count });
	let submitting = $state(false);
	let rate_limited = $state(false);
	let error_message = $state('');

	async function handle_submit(event: SubmitEvent) {
		event.preventDefault();

		const submitter = event.submitter;
		if (!(submitter instanceof HTMLButtonElement) || submitting)
			return;

		const reaction = submitter.value;
		const previous_count = counts[reaction] ?? 0;

		counts[reaction] = previous_count + 1;
		submitting = true;
		error_message = '';

		try {
			const result = await submit_reaction({
				reaction,
				path: path ?? '/',
			});

			if (result.success && result.count !== undefined) {
				counts[reaction] = result.count;
				return;
			}

			counts[reaction] = previous_count;
			error_message = result.error ?? 'Could not save your reaction';

			if (result.status === 429 && result.time_remaining) {
				rate_limited = true;
				setTimeout(() => {
					rate_limited = false;
				}, result.time_remaining * 1000);
			}
		} catch {
			counts[reaction] = previous_count;
			error_message = 'Could not save your reaction';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="mb-10 flex justify-center">
	<form
		method="POST"
		action="/api/reactions?path={path}"
		onsubmit={handle_submit}
		class="grid w-full grid-cols-1 gap-5 sm:flex sm:justify-between"
	>
		{#each reactions as reaction (reaction.type)}
			<NumberFlip
				count={counts[reaction.type] ?? 0}
				emoji={reaction.emoji}
				value={reaction.type}
				disabled={rate_limited}
				aria_label={`Submit ${
					reaction.type
				} reaction. Current count: ${counts[reaction.type] ?? 0}`}
			/>
		{/each}
	</form>
	<p class="sr-only" aria-live="polite">{error_message}</p>
</section>

<div class="all-prose">
	<p>
		There's a <a href={resolve('/reactions-leaderboard')}>
			reactions leaderboard
		</a> you can check out too.
	</p>
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary" role="separator"></div>
</div>
