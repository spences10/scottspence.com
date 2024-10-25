<script lang="ts">
	import { reactions } from '$lib/reactions-config'

	interface LeaderboardEntry {
		path: string
		title: string
		rank: number
		likes: number
		hearts: number
		poops: number
		parties: number
		total_count: number
		[key: string]: string | number
	}

	interface Props {
		leaderboard: LeaderboardEntry[]
	}

	let { leaderboard }: Props = $props()

	let sort_by = $state<keyof LeaderboardEntry>('total_count')
	let sort_order = $state<'asc' | 'desc'>('asc')

	$effect(() => {
		leaderboard = [...leaderboard].sort((a, b) => {
			const order = sort_order === 'desc' ? -1 : 1
			return order * ((b[sort_by] as number) - (a[sort_by] as number))
		})
	})

	const handle_sort_change = (
		new_sort_by: keyof LeaderboardEntry,
	) => {
		sort_by = new_sort_by
	}

	const toggle_sort_order = () => {
		sort_order = sort_order === 'desc' ? 'asc' : 'desc'
	}
</script>

<section class="sm:-mx-30 m-0 mb-20 lg:-mx-40">
	<div class="mb-4 flex items-center justify-end">
		<select
			class="select select-bordered select-sm mr-2"
			bind:value={sort_by}
			onchange={e =>
				handle_sort_change(
					(e?.target as HTMLSelectElement)
						?.value as keyof LeaderboardEntry,
				)}
		>
			<option value="total_count">Total Reactions</option>
			{#each reactions as reaction}
				<option value={reaction.type}>
					{reaction.emoji}
					{reaction.type}
				</option>
			{/each}
		</select>
		<button
			class="btn btn-outline btn-sm"
			onclick={toggle_sort_order}
		>
			{sort_order === 'desc' ? '▼' : '▲'}
		</button>
	</div>

	<div class="relative grid grid-cols-1 gap-8 md:grid-cols-2">
		{#each leaderboard as page (page.path)}
			<a
				target="_blank"
				rel="noopener noreferrer"
				data-sveltekit-reload
				href={page.path}
				class="h-full"
			>
				<article
					class="card flex h-full flex-col justify-between rounded-box border border-secondary p-5 font-bold shadow-lg transition hover:text-accent"
				>
					<h3 class="mb-5 text-2xl">
						{#if page.rank === 1}
							<span class="text-3xl">🥇</span>
						{:else if page.rank === 2}
							<span class="text-3xl">🥈</span>
						{:else if page.rank === 3}
							<span class="text-3xl">🥉</span>
						{:else if +page.rank > 3}
							<span class="text-accent">
								<span
									class="-mr-1 text-xs"
									style="vertical-align: top;">#</span
								>
								{page.rank}
							</span>
						{/if}
						{page.title}
					</h3>
					<div class="mt-5 flex flex-wrap justify-between">
						{#each reactions as reaction}
							<span
								class="btn btn-primary mb-2 mr-2 min-w-[calc(50%-0.5rem)] flex-1 text-xl md:min-w-0 md:flex-none"
							>
								{reaction.emoji}
								{page[reaction.type]}
							</span>
						{/each}
					</div>
				</article>
			</a>
		{/each}
	</div>
</section>
