<script lang="ts">
	import { WarningTriangle } from '$lib/icons'
	import { compareDesc, differenceInYears } from 'date-fns'
	import DateDistance from './date-distance.svelte'

	interface Props {
		date?: any
		updated?: any
	}

	let { date = new Date(), updated = new Date() }: Props = $props()

	let has_been_updated = $derived(
		compareDesc(new Date(updated), new Date(date)),
	)
</script>

{#if has_been_updated}
	<div class="alert alert-warning my-8 shadow-lg">
		<div class="flex items-center">
			<span class="mr-5">
				<WarningTriangle />
			</span>
			<span class="text-left">
				Hey! Thanks for stopping by! Looks like this post was updated
				<span class="font-bold italic">
					<DateDistance date={new Date(updated)} /> ago.
				</span>
				Just bear in mind it was originally posted
				<span class="font-bold italic">
					<DateDistance date={new Date(date)} /> ago.
				</span>
				If there's anything in here which doesn't make sense,
				<a class="link" href="/contact"> please get in touch.</a>
			</span>
		</div>
	</div>
{:else}
	<div class="alert alert-warning my-8 shadow-lg">
		<div class="flex items-center">
			<span class="mr-5">
				<WarningTriangle />
			</span>
			<span class="text-left">
				Hey! Thanks for stopping by! Just a word of warning, this post
				is
				<span class="font-bold italic">
					<DateDistance date={new Date(date)} /> old, {differenceInYears(
						new Date(Date.now()),
						new Date(date),
					) >= 4
						? 'wow!'
						: '.'}
				</span>
				If there's technical information in here it's more than likely out
				of date.
			</span>
		</div>
	</div>
{/if}
