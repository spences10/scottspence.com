<script lang="ts">
  import { PEOPLE } from '$lib/info'
  import PeopleToMeetCheck from './people-to-meet-check.svelte'
  import ShareWithTweet from './share-with-tweet.svelte'

  type SortFunctionKeys = 'all' | 'met' | 'not_met'

  interface Person {
    name: string
    link: string
    met: boolean
  }

  let sort_mode = $state('random')

  const shuffle_array = (array: Person[]) => {
    return array.sort(() => 0.5 - Math.random())
  }

  const sort_functions: Record<SortFunctionKeys, () => Person[]> = {
    all: () => shuffle_array(PEOPLE),
    met: () => PEOPLE.filter(p => p.met),
    not_met: () => PEOPLE.filter(p => !p.met),
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

<article class="sm:-mx-30 m-0 mb-20 lg:-mx-40">
  <a
    href="#people-id-like-to-meet"
    id="people-id-like-to-meet"
    class="hover:primary-accent link-primary text-2xl font-bold transition"
  >
    People I'd like to meet in real life (aka the meatspace).
  </a>
  <p class="all-prose -mt-1 mb-1">
    These are all people I'd like to share a firm handshake with.
  </p>

  <p class="mb-9 text-sm text-secondary">
    Idea totally stolen from
    <a
      class="link transition hover:text-primary"
      rel="noreferrer noopener"
      target="_blank"
      href="https://rafa.design/"
    >
      Rafael Conde
    </a>
  </p>

  <div class="mb-5">
    <button onclick={() => (sort_mode = 'all')} class="btn btn-xs">
      All
    </button>
    <button onclick={() => (sort_mode = 'met')} class="btn btn-xs">
      Met
    </button>
    <button
      onclick={() => (sort_mode = 'not_met')}
      class="btn btn-xs"
    >
      Not Met
    </button>
  </div>

  <ul
    class="mb-10 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  >
    {#each sorted_people as { name, link, met }}
      <li class="">
        <div class="flex items-center text-left">
          <PeopleToMeetCheck {met} />
          <span class="transition hover:text-primary">
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
    <p class="all-prose mb-3 md:mb-0 md:mr-5">
      Not on the list? Want to meet up?
    </p>
    <ShareWithTweet
      tweetText="Yo! @spences10, I think we should totally meet IRL."
      buttonText="Hit me up on Twitter!"
    />
  </div>
</article>
