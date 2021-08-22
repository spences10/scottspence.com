<script>
  import { PEOPLE } from '$lib/info'
  import PeopleToMeetCheck from './people-to-meet-check.svelte'

  // const peopleSorted = PEOPLE.sort((a, b) => {
  //   return a.met - b.met
  // })
</script>

<article class="m-0 mb-20 sm:-mx-30 lg:-mx-40 ">
  <a href='#people-id-like-to-meet' id='people-id-like-to-meet' class="font-bold text-2xl mb-2">
    People I'd like to meet in real life (aka the meatspace).
  </a>

  <p class="text-sm text-secondary mb-5">
    Totally stolen this idea from
    <a
      class="transition link hover:text-primary"
      href="https://rafa.design/">Rafael Conde</a
    >
  </p>

  <ul
    class="grid gap-7 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10"
  >
    {#each PEOPLE as { name, link, met }}
      <li class="">
        <div class="flex text-left items-center">
          <PeopleToMeetCheck {met} />
          <span class="hover:text-primary">
            <a class="text-xl" href={link}>{name}</a>
          </span>
        </div>
      </li>
    {/each}
  </ul>

  <div class="md:flex md:items-center">
    <p class="all-prose md:mr-5 mb-3 md:mb-0">Not on the list? Want to meet up?</p>
    <a
      class="btn btn-sm"
      rel="noopener"
      target="_blank"
      href="https://twitter.com/intent/tweet?text=Yo%21%20@spences10%2C%20I%20think%20we%20should%20totally%20meet%20IRL."
    >
      <div class="flex items-center">
        <p class="mr-3">Hit me up on Twitter!</p>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="block fill-current text-primary hover:text-secondary transition h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          ><path
            d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
          /></svg
        >
      </div>
    </a>
  </div>
</article>
