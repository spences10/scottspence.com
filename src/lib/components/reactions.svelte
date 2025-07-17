<script lang="ts">
	import { reactions } from '$lib/reactions-config'
	import { add_reaction } from '../../routes/posts/[slug]/reactions.remote'
	import NumberFlip from './reactions-number-flip.svelte'

	interface Props {
		path?: string | null
		data?: ReactionsData | null
		reaction_counts_query?: any
	}

	let { path = '/', data = null, reaction_counts_query }: Props = $props()

	let button_disabled = $state(false)
</script>

<section class="mb-10 flex justify-center">
	<div class="grid w-full grid-cols-1 gap-5 sm:flex sm:justify-between">
		{#each reactions as reaction}
			<form
				{...add_reaction.enhance(async ({ data, submit }) => {
					const reaction_type = data.get('reaction_type') as string
					await submit().updates(
						reaction_counts_query?.withOverride((current_reactions) => {
							// Ensure current_reactions is an array
							if (!Array.isArray(current_reactions)) {
								console.error('current_reactions is not an array:', current_reactions)
								return []
							}
							
							// Check if reaction already exists
							const existing_reaction = current_reactions.find(r => r.reaction_type === reaction_type)
							
							if (existing_reaction) {
								// Update existing reaction
								return current_reactions.map((r) =>
									r.reaction_type === reaction_type
										? { ...r, count: r.count + 1 }
										: r
								)
							} else {
								// Add new reaction
								return [...current_reactions, { reaction_type, count: 1 }]
							}
						})
					)
				})}
			>
				<input type="hidden" name="pathname" value={path} />
				<input type="hidden" name="reaction_type" value={reaction.type} />
				<NumberFlip
					count={data?.count?.[reaction.type] || 0}
					emoji={reaction.emoji}
					value={reaction.type}
					disabled={button_disabled}
					aria_label={`Submit ${
						reaction.type
					} reaction. Current count: ${
						data?.count?.[reaction.type] || 0
					}`}
				/>
			</form>
		{/each}
	</div>
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
