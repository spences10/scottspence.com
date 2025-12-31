<script lang="ts">
	import { PEOPLE } from '$lib/info'
	import PeopleToMeetCheck from './people-to-meet-check.svelte'
	import PostOnBlueSky from './post-on-bluesky.svelte'

	type SortFunctionKeys = 'all' | 'met' | 'not_met'

	interface Person {
		name: string
		link: string
		met: boolean
	}

	let sort_mode = $state('random')

	const shuffle_array = (array: Person[]) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	const sort_functions: Record<SortFunctionKeys, () => Person[]> = {
		all: () => shuffle_array(PEOPLE),
		met: () => shuffle_array(PEOPLE.filter((p) => p.met)),
		not_met: () => shuffle_array(PEOPLE.filter((p) => !p.met)),
	}

	let sorted_people: Person[] = $derived(
		sort_functions[sort_mode as SortFunctionKeys]
			? sort_functions[sort_mode as SortFunctionKeys]()
			: PEOPLE,
	)
</script>

<div class="my-10 flex w-full flex-col">
	<div class="divider divider-secondary"></div>
</div>

<article class="xs:-mx-30 m-0 mb-20 lg:-mx-40">
	<a
		href="#people-id-like-to-meet"
		id="people-id-like-to-meet"
		class="link-primary hover:text-accent text-2xl font-bold transition"
	>
		People I'd like to meet in real life (aka the meatspace).
	</a>
	<p class="all-prose -mt-1 mb-1">
		These are all people I'd like to share a firm handshake with.
	</p>

	<p class="text-secondary mb-9 text-sm">
		Idea totally stolen from
		<a
			class="link hover:text-primary transition"
			rel="noreferrer noopener"
			target="_blank"
			href="https://rafa.design/"
		>
			Rafael Conde
		</a>
	</p>

	<div class="join mb-5">
		<!-- Changed to join for button group -->
		<button
			onclick={() => (sort_mode = 'all')}
			class="join-item btn btn-sm"
		>
			All
		</button>
		<button
			onclick={() => (sort_mode = 'met')}
			class="join-item btn btn-sm"
		>
			Met
		</button>
		<button
			onclick={() => (sort_mode = 'not_met')}
			class="join-item btn btn-sm"
		>
			Not Met
		</button>
	</div>

	<ul
		class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
	>
		{#each sorted_people as { name, link, met }}
			<li>
				<div class="flex items-center text-left">
					<PeopleToMeetCheck {met} />
					<span class="hover:text-primary transition">
						<a
							class="text-xl"
							href={link}
							rel="noreferrer noopener"
							target="_blank"
						>
							{name}
						</a>
					</span>
				</div>
			</li>
		{/each}
	</ul>

	<div class="md:flex md:items-center">
		<p class="all-prose mb-3 md:mr-5 md:mb-0">
			Not on the list? Want to meet up?
		</p>
		<PostOnBlueSky
			post_text="Yo! @scottspence.dev, I think we should totally meet IRL. Add me to that list!!"
			button_text="Hit me up on Bluesky!"
			button_class="btn-primary btn-lg"
		/>
	</div>
</article>
