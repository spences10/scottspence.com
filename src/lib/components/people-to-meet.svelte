<script lang="ts">
  import { PEOPLE } from '$lib/info'
  import PeopleToMeetCheck from './people-to-meet-check.svelte'
  import ShareWithTweet from './share-with-tweet.svelte'

  // const peopleSorted = PEOPLE.sort((a, b) => {
  //   return a.met - b.met
  // })

  const peopleShuffled = PEOPLE.sort(() => {
    return 0.5 - Math.random()
  })
</script>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>

<article class="m-0 mb-20 sm:-mx-30 lg:-mx-40 ">
  <a
    href="#people-id-like-to-meet"
    id="people-id-like-to-meet"
    class="font-bold text-2xl link-primary hover:primary-focus transition"
  >
    People I'd like to meet in real life (aka the meatspace).
  </a>
  <p class="mb-1 -mt-1 all-prose">
    These are all people I'd like to share a firm handshake with.
  </p>

  <p class="text-sm text-secondary mb-9">
    Idea totally stolen from
    <a
      class="transition link hover:text-primary"
      rel="noreferrer noopener"
      target="_blank"
      href="https://rafa.design/"
    >
      Rafael Conde
    </a>
  </p>

  <ul
    class="mb-10 grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  >
    {#each peopleShuffled as { name, link, met }}
      <li class="">
        <div class="flex text-left items-center">
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
    <p class="mb-3 all-prose md:mr-5 md:mb-0">
      Not on the list? Want to meet up?
    </p>
    <ShareWithTweet
      tweetText="Yo! @spences10, I think we should totally meet IRL."
      buttonText="Hit me up on Twitter!"
    />
  </div>
</article>
