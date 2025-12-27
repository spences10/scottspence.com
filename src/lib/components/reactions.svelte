<script lang="ts">
	import { enhance } from '$app/forms'
	import { reactions } from '$lib/reactions-config'
	import type { ActionResult } from '@sveltejs/kit'
	import { writable } from 'svelte/store'
	import NumberFlip from './reactions-number-flip.svelte'

	interface Props {
		path?: string | null
		data?: ReactionsData | null
	}

	let { path = '/', data = null }: Props = $props()

	let button_disabled = writable(false)

	const handle_result = (result: ActionResult) => {
		if (result.type === 'failure') {
			$button_disabled = true
			setTimeout(() => {
				$button_disabled = false
			}, result?.data?.time_remaining * 1000)
		}
	}
</script>

<section class="mb-10 flex justify-center">
	<form
		method="POST"
		action="/api/reactions?path={path}"
		use:enhance={() => {
			return ({ update, result }) => {
				handle_result(result)
				update({ reset: false })
			}
		}}
		class="grid w-full grid-cols-1 gap-5 sm:flex sm:justify-between"
	>
		{#each reactions as reaction}
			<NumberFlip
				count={data?.count?.[reaction.type] || 0}
				emoji={reaction.emoji}
				value={reaction.type}
				disabled={$button_disabled}
				aria_label={`Submit ${
					reaction.type
				} reaction. Current count: ${
					data?.count?.[reaction.type] || 0
				}`}
			/>
		{/each}
	</form>
</section>

<div class="all-prose">
	<p>
		There's a <a href="/reactions-leaderboard">
			reactions leaderboard
		</a> you can check out too.
	</p>
</div>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary" role="separator"></div>
</div>
